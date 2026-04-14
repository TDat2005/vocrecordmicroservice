const express = require('express');
const morgan = require('morgan');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(morgan('short'));

app.use('/', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ User Service: Database connected');
    app.listen(PORT, () => {
      console.log(`👤 User Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ User Service: Failed to start:', err.message);
    setTimeout(start, 5000);
  }
}

start();
