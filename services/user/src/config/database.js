const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.USER_DB_NAME,
  process.env.USER_DB_USER,
  process.env.USER_DB_PASS,
  {
    host: process.env.USER_DB_HOST,
    port: process.env.USER_DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);

module.exports = sequelize;
