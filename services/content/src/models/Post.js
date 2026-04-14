const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('blog', 'guide'), defaultValue: 'blog' },
  image: { type: DataTypes.STRING(500) },
  account_id: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('draft', 'published'), defaultValue: 'draft' },
}, {
  tableName: 'posts',
  timestamps: true,
  underscored: true,
});

module.exports = Post;
