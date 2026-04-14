const express = require('express');
const morgan = require('morgan');
const sequelize = require('./config/database');
const contentRoutes = require('./routes/contentRoutes');

const app = express();
const PORT = 3007;

app.use(express.json());
app.use(morgan('short'));
app.use('/', contentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'content-service' }));

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Content Service: Database connected');
    app.listen(PORT, () => console.log(`📝 Content Service running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Content Service: Failed to start:', err.message);
    setTimeout(start, 5000);
  }
}

start();
