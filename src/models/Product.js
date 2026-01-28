const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  totalStock: {
    type: Number,
    required: true,
    min: 0,
  },
  availableStock: {
    type: Number,
    required: true,
    min: 0,
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0,
  },
  isFlashDeal: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
productSchema.index({ sku: 1 });
productSchema.index({ isFlashDeal: 1 });

module.exports = mongoose.model('Product', productSchema);
