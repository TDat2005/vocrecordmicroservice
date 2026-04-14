const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(100), unique: true },
  address: { type: DataTypes.TEXT },
  account_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'customers',
  timestamps: true,
  underscored: true,
});

module.exports = Customer;
