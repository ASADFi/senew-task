const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const redisService = require('./redisService');
const productService = require('./productService');

class CheckoutService {
  // Checkout and finalize order
  async checkout(userId) {
    // Get user's reservation
    const reservation = await redisService.getUserReservation(userId);
    if (!reservation) {
      throw new Error('No active reservation found. Please add items to cart first.');
    }

    const orderItems = [];
    let totalAmount = 0;

    try {
      // Process each item
      for (const item of reservation.items) {
        const { productId, quantity, price, name, sku } = item;

        // Finalize stock reduction
        await productService.finalizeStockReduction(productId, quantity);

        // Release Redis lock
        await redisService.releaseStock(productId, quantity);

        const subtotal = price * quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId,
          sku,
          name,
          price,
          quantity,
          subtotal,
        });
      }

      // Create order
      const order = new Order({
        userId,
        items: orderItems,
        totalAmount,
        status: 'completed',
      });

      await order.save();

      // Update reservation status
      await Reservation.findByIdAndUpdate(reservation.reservationId, {
        status: 'completed',
      });

      // Delete reservation from Redis
      await redisService.deleteUserReservation(userId);

      return {
        orderId: order._id,
        items: orderItems,
        totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      };
    } catch (error) {
      console.error('Checkout failed:', error.message);
      throw new Error('Checkout failed: ' + error.message);
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  // Get user's orders
  async getUserOrders(userId, filters = {}) {
    const query = { userId };
    
    if (filters.status) {
      query.status = filters.status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.productId');

    return orders;
  }

  // Get all orders (admin)
  async getAllOrders(filters = {}) {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.productId');

    return orders;
  }

  // Cancel order (only if not completed)
  async cancelOrder(orderId) {
    const order = await this.getOrderById(orderId);

    if (order.status === 'completed') {
      throw new Error('Cannot cancel completed order');
    }

    order.status = 'cancelled';
    await order.save();

    // Restore stock for cancelled items
    for (const item of order.items) {
      await productService.updateAvailableStock(
        item.productId.toString(),
        item.quantity,
        'increment'
      );
    }

    return order;
  }
}

module.exports = new CheckoutService();
