const Reservation = require('../models/Reservation');
const Product = require('../models/Product');
const redisService = require('./redisService');
const productService = require('./productService');

class ReservationService {
  constructor() {
    this.RESERVATION_TTL = parseInt(process.env.RESERVATION_TTL_SECONDS) || 600; // 10 minutes
  }

  // Reserve products to cart
  async reserveProducts(userId, items) {
    // Check if user already has an active reservation
    const existingReservation = await redisService.getUserReservation(userId);
    if (existingReservation) {
      throw new Error('You already have an active reservation. Please checkout or cancel first.');
    }

    const reservedItems = [];
    const rollbackItems = [];

    try {
      // Validate and reserve each product
      for (const item of items) {
        const { productId, sku, quantity } = item;

        // Get product
        const product = await productService.getProductById(productId);

        // Check availability considering Redis locks
        const availability = await productService.checkAvailability(productId, quantity);
        if (!availability.isAvailable) {
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${availability.availableQuantity}, Requested: ${quantity}`
          );
        }

        // Lock stock in Redis first (optimistic locking)
        await redisService.atomicReserveStock(productId, quantity, this.RESERVATION_TTL);

        // Update MongoDB
        await productService.updateAvailableStock(productId, quantity, 'decrement');

        reservedItems.push({
          productId: product._id,
          sku: product.sku,
          quantity,
          price: product.price,
          name: product.name,
        });

        rollbackItems.push({ productId: product._id, quantity });
      }

      // Create reservation record in MongoDB
      const expiresAt = new Date(Date.now() + this.RESERVATION_TTL * 1000);
      const reservation = new Reservation({
        userId,
        items: reservedItems.map(item => ({
          productId: item.productId,
          sku: item.sku,
          quantity: item.quantity,
        })),
        expiresAt,
        status: 'active',
      });

      await reservation.save();

      // Store reservation in Redis with TTL
      const reservationData = {
        reservationId: reservation._id.toString(),
        items: reservedItems,
        expiresAt: expiresAt.toISOString(),
      };

      await redisService.setUserReservation(userId, reservationData, this.RESERVATION_TTL);

      return {
        reservationId: reservation._id,
        items: reservedItems,
        expiresAt,
        ttlSeconds: this.RESERVATION_TTL,
      };
    } catch (error) {
      // Rollback all reservations on failure
      await this.rollbackReservations(rollbackItems);
      throw error;
    }
  }

  // Rollback reservations (release locks and restore stock)
  async rollbackReservations(items) {
    for (const item of items) {
      try {
        await redisService.releaseStock(item.productId, item.quantity);
        await productService.updateAvailableStock(item.productId, item.quantity, 'increment');
      } catch (error) {
        console.error(`Rollback failed for product ${item.productId}:`, error.message);
      }
    }
  }

  // Get user's active reservation
  async getUserReservation(userId) {
    // Try Redis first
    const redisReservation = await redisService.getUserReservation(userId);
    if (redisReservation) {
      const ttl = await redisService.getReservationTTL(userId);
      return {
        ...redisReservation,
        remainingTTL: ttl,
      };
    }

    // Fallback to MongoDB
    const dbReservation = await Reservation.findOne({
      userId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    }).populate('items.productId');

    if (!dbReservation) {
      return null;
    }

    const remainingTTL = Math.floor((dbReservation.expiresAt - new Date()) / 1000);
    return {
      reservationId: dbReservation._id,
      items: dbReservation.items,
      expiresAt: dbReservation.expiresAt,
      remainingTTL,
    };
  }

  // Cancel reservation
  async cancelReservation(userId) {
    // Get reservation from Redis
    const reservation = await redisService.getUserReservation(userId);
    if (!reservation) {
      throw new Error('No active reservation found');
    }

    // Release locks and restore stock
    for (const item of reservation.items) {
      await redisService.releaseStock(item.productId, item.quantity);
      await productService.updateAvailableStock(item.productId, item.quantity, 'increment');
    }

    // Delete from Redis
    await redisService.deleteUserReservation(userId);

    // Update MongoDB reservation status
    await Reservation.findByIdAndUpdate(reservation.reservationId, {
      status: 'cancelled',
    });

    return { message: 'Reservation cancelled successfully' };
  }

  // Auto-expire reservations (cleanup job)
  async expireReservations() {
    try {
      const now = new Date();
      
      // Find expired reservations in MongoDB
      const expiredReservations = await Reservation.find({
        status: 'active',
        expiresAt: { $lte: now },
      });

      let expiredCount = 0;

      for (const reservation of expiredReservations) {
        try {
          // Release locks and restore stock
          for (const item of reservation.items) {
            await redisService.releaseStock(item.productId, item.quantity);
            await productService.updateAvailableStock(
              item.productId.toString(),
              item.quantity,
              'increment'
            );
          }

          // Update reservation status
          reservation.status = 'expired';
          await reservation.save();

          // Clean up Redis
          await redisService.deleteUserReservation(reservation.userId);

          expiredCount++;
        } catch (error) {
          console.error(`Failed to expire reservation ${reservation._id}:`, error.message);
        }
      }

      console.log(`Expired ${expiredCount} reservations`);
      return { expiredCount };
    } catch (error) {
      console.error('Error in expireReservations:', error.message);
      throw error;
    }
  }

  // Get reservation by ID
  async getReservationById(reservationId) {
    const reservation = await Reservation.findById(reservationId).populate('items.productId');
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    return reservation;
  }
}

module.exports = new ReservationService();
