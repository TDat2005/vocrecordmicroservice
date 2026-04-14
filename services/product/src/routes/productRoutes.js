const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

// Public product routes
router.get('/', ctrl.list);
router.get('/categories', ctrl.getCategories);
router.get('/by-ids', ctrl.getByIds);
router.get('/inventory', ctrl.inventoryList);
router.get('/stats', ctrl.stats);
router.get('/:id', ctrl.detail);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

// Internal stock management
router.post('/decrease-stock', ctrl.decreaseStock);
router.post('/increase-stock', ctrl.increaseStock);
router.post('/import-stock', ctrl.importStock);

// Discount routes
router.get('/discounts/all', ctrl.getAllDiscounts);
router.post('/discounts', ctrl.createDiscount);
router.post('/discounts/check', ctrl.checkDiscountCode);
router.post('/discounts/calculate', ctrl.calculateDiscount);
router.post('/discounts/increment-usage', ctrl.incrementUsage);
router.put('/discounts/:id', ctrl.updateDiscount);
router.delete('/discounts/:id', ctrl.deleteDiscount);

module.exports = router;
