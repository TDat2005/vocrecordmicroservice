const express = require('express');
const morgan = require('morgan');
const sequelize = require('./config/database');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const orderRoutes = require('./routes/orderRoutes');

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

const app = express();
const PORT = 3004;

app.use(express.json());
app.use(morgan('short'));

app.use('/', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Order Service: Database connected');
    app.listen(PORT, () => console.log(`🛒 Order Service running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Order Service: Failed to start:', err.message);
    setTimeout(start, 5000);
  }
}

start();
