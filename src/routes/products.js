import express from 'express';
const router = express.Router();
import ProductController from '../controllers/ProductController.js';

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

export default router;
