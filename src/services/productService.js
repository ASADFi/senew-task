const Product = require('../models/Product');
const redisService = require('./redisService');

class ProductService {
  // Create a new product
  async createProduct(productData) {
    const { name, sku, description, price, totalStock } = productData;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }

    const product = new Product({
      name,
      sku,
      description,
      price,
      totalStock,
      availableStock: totalStock,
      reservedStock: 0,
    });

    await product.save();
    return product;
  }

  // Get product by ID
  async getProductById(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  // Get product by SKU
  async getProductBySku(sku) {
    const product = await Product.findOne({ sku });
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  // Get all products
  async getAllProducts(filters = {}) {
    const query = {};
    if (filters.isFlashDeal !== undefined) {
      query.isFlashDeal = filters.isFlashDeal;
    }
    return await Product.find(query);
  }

  // Get product status with real-time reserved stock from Redis
  async getProductStatus(productId) {
    const product = await this.getProductById(productId);
    const lockedInRedis = await redisService.getLockedStock(productId);

    return {
      productId: product._id,
      name: product.name,
      sku: product.sku,
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      reservedStock: product.reservedStock,
      lockedInRedis, // Real-time locked stock from Redis
      actualAvailable: Math.max(0, product.availableStock - lockedInRedis),
    };
  }

  // Update available stock (internal method)
  async updateAvailableStock(productId, quantity, operation = 'decrement') {
    const product = await this.getProductById(productId);

    if (operation === 'decrement') {
      if (product.availableStock < quantity) {
        throw new Error('Insufficient stock available');
      }
      product.availableStock -= quantity;
      product.reservedStock += quantity;
    } else if (operation === 'increment') {
      product.availableStock += quantity;
      product.reservedStock = Math.max(0, product.reservedStock - quantity);
    }

    await product.save();
    return product;
  }

  // Finalize stock reduction (on checkout)
  async finalizeStockReduction(productId, quantity) {
    const product = await this.getProductById(productId);

    if (product.reservedStock < quantity) {
      throw new Error('Reserved stock mismatch');
    }

    product.reservedStock -= quantity;
    await product.save();
    return product;
  }

  // Check if product has enough available stock
  async checkAvailability(productId, requestedQuantity) {
    const product = await this.getProductById(productId);
    const lockedInRedis = await redisService.getLockedStock(productId);
    const actualAvailable = product.availableStock - lockedInRedis;

    return {
      isAvailable: actualAvailable >= requestedQuantity,
      availableQuantity: Math.max(0, actualAvailable),
      requestedQuantity,
    };
  }

  // Update product details
  async updateProduct(productId, updateData) {
    const product = await this.getProductById(productId);

    // Prevent updating stock-related fields directly
    delete updateData.totalStock;
    delete updateData.availableStock;
    delete updateData.reservedStock;

    Object.assign(product, updateData);
    await product.save();
    return product;
  }

  // Delete product
  async deleteProduct(productId) {
    const product = await this.getProductById(productId);
    
    if (product.reservedStock > 0) {
      throw new Error('Cannot delete product with reserved stock');
    }

    await Product.findByIdAndDelete(productId);
    return { message: 'Product deleted successfully' };
  }
}

module.exports = new ProductService();
