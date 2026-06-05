import express from 'express';
const router = express.Router();
import CustomerController from '../controllers/CustomerController.js';
import { validateCustomer  } from '../middleware/validation.js';

// Create Customer
router.post('/create', validateCustomer, CustomerController.createCustomer.bind(CustomerController));

// Get Customer Stats (must be before /:id to avoid conflicts)
router.get('/:id/stats', CustomerController.getCustomerStats.bind(CustomerController));

// Get Customer
router.get('/:id', CustomerController.getCustomer.bind(CustomerController));

// Update Customer
router.put('/:id', CustomerController.updateCustomer.bind(CustomerController));

// Delete Customer
router.delete('/:id', CustomerController.deleteCustomer.bind(CustomerController));

// List Customers
router.get('/', CustomerController.listCustomers.bind(CustomerController));

export default router;
