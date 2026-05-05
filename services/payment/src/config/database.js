const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.PAYMENT_DB_NAME,
  process.env.PAYMENT_DB_USER,
  process.env.PAYMENT_DB_PASS,
  {
    host: process.env.PAYMENT_DB_HOST,
    port: process.env.PAYMENT_DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      charset: 'utf8mb4',
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
  }
);

module.exports = sequelize;
