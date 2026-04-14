const express = require('express');
const morgan = require('morgan');
const sequelize = require('./config/database');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = 3005;

app.use(express.json());
app.use(morgan('short'));
app.use('/', paymentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'payment-service' }));

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Payment Service: Database connected');
    app.listen(PORT, () => console.log(`💳 Payment Service running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Payment Service: Failed to start:', err.message);
    setTimeout(start, 5000);
  }
}

start();
