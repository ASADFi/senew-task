const checkoutService = require('../services/checkoutService');
const { asyncHandler } = require('../middleware/errorHandler');

class CheckoutController {
  // Checkout
  checkout = asyncHandler(async (req, res) => {
    const { userId } = req.validatedBody;
    
    const order = await checkoutService.checkout(userId);
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  });

  // Get order by ID
  getOrderById = asyncHandler(async (req, res) => {
    const order = await checkoutService.getOrderById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: order,
    });
  });

  // Get user orders
  getUserOrders = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const filters = {
      status: req.query.status,
    };
    
    const orders = await checkoutService.getUserOrders(userId, filters);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  });

  // Get all orders (admin)
  getAllOrders = asyncHandler(async (req, res) => {
    const filters = {
      status: req.query.status,
      userId: req.query.userId,
    };
    
    const orders = await checkoutService.getAllOrders(filters);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  });

  // Cancel order
  cancelOrder = asyncHandler(async (req, res) => {
    const order = await checkoutService.cancelOrder(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  });
}

module.exports = new CheckoutController();
