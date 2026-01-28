const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const reservationRoutes = require('./reservationRoutes');
const checkoutRoutes = require('./checkoutRoutes');

// API routes
router.use('/products', productRoutes);
router.use('/reservations', reservationRoutes);
router.use('/checkout', checkoutRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
