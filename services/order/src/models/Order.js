const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER, allowNull: false },
  recipient_name: { type: DataTypes.STRING(100) },
  recipient_phone: { type: DataTypes.STRING(20) },
  total: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('choxacnhan', 'daxacnhan', 'dangchuanbihang', 'danggiaohang', 'hoanthanh', 'dahuy'),
    defaultValue: 'choxacnhan',
  },
  payment_method: { type: DataTypes.STRING(50), defaultValue: 'cod' },
  address: { type: DataTypes.TEXT },
  note: { type: DataTypes.STRING(255) },
  discount_code: { type: DataTypes.STRING(50) },
  discount_amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  processed_by: { type: DataTypes.INTEGER },
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
});

module.exports = Order;
