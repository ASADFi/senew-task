const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { validate, schemas } = require('../middleware/validation');
const { checkoutLimiter } = require('../middleware/rateLimiter');

// Checkout routes
router.post(
  '/',
  checkoutLimiter,
  validate(schemas.checkout),
  checkoutController.checkout
);

router.get('/orders', checkoutController.getAllOrders);
router.get('/orders/:id', checkoutController.getOrderById);
router.get('/user/:userId/orders', checkoutController.getUserOrders);
router.post('/orders/:id/cancel', checkoutController.cancelOrder);

module.exports = router;
