const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

// Public order routes
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/check-status', ctrl.checkStatus);
router.get('/:id', ctrl.detail);
router.post('/update-status', ctrl.updateStatus);
router.post('/cancel', ctrl.cancelOrder);

// Internal (from Payment Service)
router.post('/payment-status', ctrl.updatePaymentStatus);

// Admin routes (aggregator)
router.get('/admin/dashboard', ctrl.dashboardStats);
router.get('/admin/revenue', ctrl.revenueReport);

module.exports = router;
