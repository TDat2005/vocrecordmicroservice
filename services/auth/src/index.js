const express = require('express');
const morgan = require('morgan');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(morgan('short'));

// Routes
app.use('/', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Auth Service: Database connected');
    app.listen(PORT, () => {
      console.log(`🔐 Auth Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Auth Service: Failed to start:', err.message);
    // Retry after 5 seconds
    setTimeout(start, 5000);
  }
}

start();
