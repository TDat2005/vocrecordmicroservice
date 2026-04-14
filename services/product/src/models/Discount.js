const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discount = sequelize.define('Discount', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  type: { type: DataTypes.ENUM('percent', 'fixed'), defaultValue: 'percent' },
  value: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  min_order: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  expires_at: { type: DataTypes.DATE },
}, {
  tableName: 'discounts',
  timestamps: true,
  underscored: true,
});

module.exports = Discount;
