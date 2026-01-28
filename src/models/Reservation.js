const mongoose = require('mongoose');

const reservationItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const reservationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  items: [reservationItemSchema],
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'completed', 'cancelled'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
reservationSchema.index({ userId: 1, status: 1 });
reservationSchema.index({ expiresAt: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
