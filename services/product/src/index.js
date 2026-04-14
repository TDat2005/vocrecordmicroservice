const express = require('express');
const morgan = require('morgan');
const sequelize = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');
const productRoutes = require('./routes/productRoutes');

// Setup associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(morgan('short'));

app.use('/', productRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Product Service: Database connected');
    app.listen(PORT, () => {
      console.log(`📦 Product Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Product Service: Failed to start:', err.message);
    setTimeout(start, 5000);
  }
}

start();
