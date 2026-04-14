const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Otp = sequelize.define('Otp', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(100), allowNull: false },
  code: { type: DataTypes.STRING(6), allowNull: false },
  type: { type: DataTypes.ENUM('register', 'forgot_password'), allowNull: false },
  is_used: { type: DataTypes.BOOLEAN, defaultValue: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'otps',
  timestamps: true,
  underscored: true,
  updatedAt: false,
});

module.exports = Otp;
