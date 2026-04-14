const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');

router.post('/create-link', ctrl.createPaymentLink);
router.post('/create-record', ctrl.createRecord);
router.post('/webhook', ctrl.webhook);
router.get('/by-order/:orderId', ctrl.getByOrder);
router.get('/check-status/:orderId', ctrl.checkStatus);

module.exports = router;
