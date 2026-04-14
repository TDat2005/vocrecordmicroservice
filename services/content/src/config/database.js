const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.CONTENT_DB_NAME, process.env.CONTENT_DB_USER, process.env.CONTENT_DB_PASS,
  { host: process.env.CONTENT_DB_HOST, port: process.env.CONTENT_DB_PORT || 3306, dialect: 'mysql', logging: false, pool: { max: 10, min: 0, acquire: 30000, idle: 10000 } }
);
module.exports = sequelize;
