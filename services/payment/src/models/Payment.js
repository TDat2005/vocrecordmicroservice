const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(15, 2) },
  method: { type: DataTypes.ENUM('cod', 'payos', 'chuyenkhoan', 'momo', 'vnpay'), defaultValue: 'cod' },
  status: { type: DataTypes.ENUM('chuathanhtoan', 'dangxuly', 'dathanhtoan', 'thatbai', 'dahuy'), defaultValue: 'chuathanhtoan' },
  transaction_code: { type: DataTypes.STRING(100) },
  paid_at: { type: DataTypes.DATE },
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
});

module.exports = Payment;
