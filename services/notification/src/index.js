const express = require('express');
const morgan = require('morgan');
const ctrl = require('./controllers/notificationController');

const app = express();
const PORT = 3006;

app.use(express.json());
app.use(morgan('short'));

app.post('/send-otp', ctrl.sendOtp);
app.post('/send-order-confirmation', ctrl.sendOrderConfirmation);
app.post('/send-status-update', ctrl.sendStatusUpdate);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.listen(PORT, () => {
  console.log(`📧 Notification Service running on port ${PORT}`);
});
