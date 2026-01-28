const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validate, schemas } = require('../middleware/validation');

// Product routes
router.post('/', validate(schemas.createProduct), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/status', productController.getProductStatus);
router.put('/:id', validate(schemas.updateProduct), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
