const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  artist: { type: DataTypes.STRING(100) },
  genre: { type: DataTypes.STRING(100) },
  release_year: { type: DataTypes.INTEGER },
  price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING(500) },
  status: {
    type: DataTypes.ENUM('conhang', 'saphethang', 'hethang', 'preorder', 'ngungkinhdoanh'),
    defaultValue: 'conhang',
  },
  category_id: { type: DataTypes.INTEGER },
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
});

module.exports = Product;
