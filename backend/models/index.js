const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Import Models
const User = require('./user')(sequelize, DataTypes);
const Comment = require('./Comment')(sequelize, DataTypes);

// Associations
User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE'
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,  // ✅ শুধু এইটুকু
  User,
  Comment
};