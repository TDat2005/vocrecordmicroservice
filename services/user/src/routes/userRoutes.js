const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');

// Customer routes
router.get('/customers', ctrl.getAllCustomers);
router.get('/customers/:id', ctrl.getProfile);
router.get('/customers/by-account/:accountId', ctrl.getByAccountId);
router.post('/customers', ctrl.createCustomer);
router.put('/customers/:id', ctrl.updateProfile);

// Employee routes
router.get('/employees', ctrl.getAllEmployees);
router.post('/employees', ctrl.createEmployee);
router.put('/employees/:id', ctrl.updateEmployee);
router.post('/employees/toggle-status', ctrl.toggleEmployeeStatus);

// Wishlist routes
router.get('/wishlist/:customerId', ctrl.getWishlist);
router.post('/wishlist', ctrl.addToWishlist);
router.post('/wishlist/remove', ctrl.removeFromWishlist);

module.exports = router;
