const reservationService = require('../services/reservationService');
const { asyncHandler } = require('../middleware/errorHandler');

class ReservationController {
  // Reserve products to cart
  reserveProducts = asyncHandler(async (req, res) => {
    const { userId, items } = req.validatedBody;
    
    const reservation = await reservationService.reserveProducts(userId, items);
    
    res.status(201).json({
      success: true,
      message: 'Products reserved successfully',
      data: reservation,
    });
  });

  // Get user's active reservation
  getUserReservation = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const reservation = await reservationService.getUserReservation(userId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'No active reservation found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: reservation,
    });
  });

  // Cancel reservation
  cancelReservation = asyncHandler(async (req, res) => {
    const { userId } = req.validatedBody;
    
    const result = await reservationService.cancelReservation(userId);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // Get reservation by ID
  getReservationById = asyncHandler(async (req, res) => {
    const reservation = await reservationService.getReservationById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: reservation,
    });
  });
}

module.exports = new ReservationController();
