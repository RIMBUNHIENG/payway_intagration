const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

// Create Product with Price
router.post('/create', ProductController.createProduct.bind(ProductController));

// Get Product
router.get('/:id', ProductController.getProduct.bind(ProductController));

// List Products
router.get('/', ProductController.listProducts.bind(ProductController));

// Update Product
router.put('/:id', ProductController.updateProduct.bind(ProductController));

// Delete Product
router.delete('/:id', ProductController.deleteProduct.bind(ProductController));

module.exports = router;
