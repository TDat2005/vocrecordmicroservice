const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  position: { type: DataTypes.STRING(50) },
  account_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'employees',
  timestamps: true,
  underscored: true,
});

module.exports = Employee;
