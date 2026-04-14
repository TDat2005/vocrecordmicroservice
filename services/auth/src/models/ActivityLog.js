const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  account_id: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING(100) },
  content: { type: DataTypes.TEXT },
}, {
  tableName: 'activity_logs',
  timestamps: true,
  underscored: true,
  updatedAt: false,
});

module.exports = ActivityLog;
