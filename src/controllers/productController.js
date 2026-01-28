const productService = require('../services/productService');
const { asyncHandler } = require('../middleware/errorHandler');

class ProductController {
  // Create product
  createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.validatedBody);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  });

  // Get all products
  getAllProducts = asyncHandler(async (req, res) => {
    const filters = {
      isFlashDeal: req.query.isFlashDeal === 'true',
    };
    
    const products = await productService.getAllProducts(filters);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  });

  // Get product by ID
  getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: product,
    });
  });

  // Get product status (with real-time availability)
  getProductStatus = asyncHandler(async (req, res) => {
    const status = await productService.getProductStatus(req.params.id);
    
    res.status(200).json({
      success: true,
      data: status,
    });
  });

  // Update product
  updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(
      req.params.id,
      req.validatedBody
    );
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  });

  // Delete product
  deleteProduct = asyncHandler(async (req, res) => {
    const result = await productService.deleteProduct(req.params.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}

module.exports = new ProductController();
