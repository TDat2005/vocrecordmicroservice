const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

// Public endpoints
router.post('/login', ctrl.login);
router.post('/register', ctrl.register);
router.post('/send-register-otp', ctrl.sendRegisterOTP);
router.post('/verify-register-otp', ctrl.verifyRegisterOTP);
router.post('/send-forgot-otp', ctrl.sendForgotOTP);
router.post('/verify-forgot-otp', ctrl.verifyForgotOTP);
router.post('/reset-password', ctrl.resetPassword);

// Internal endpoints (called by other services)
router.get('/verify-token', ctrl.verifyToken);
router.post('/create-account', ctrl.createAccount);
router.post('/update-password', ctrl.updatePassword);
router.post('/toggle-status', ctrl.toggleStatus);

// Activity log
router.get('/activity-log', ctrl.getActivityLog);
router.post('/activity-log', ctrl.createActivityLog);

module.exports = router;
