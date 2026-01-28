const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { validate, schemas } = require('../middleware/validation');
const { reservationLimiter } = require('../middleware/rateLimiter');

// Reservation routes
router.post(
  '/',
  reservationLimiter,
  validate(schemas.reserveProducts),
  reservationController.reserveProducts
);

router.get('/:userId', reservationController.getUserReservation);

router.post(
  '/cancel',
  validate(schemas.cancelReservation),
  reservationController.cancelReservation
);

router.get('/detail/:id', reservationController.getReservationById);

module.exports = router;
