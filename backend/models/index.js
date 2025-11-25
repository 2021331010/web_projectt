const { sequelize } = require('../config/database');
const User = require('./user');
const Article = require('./Article');

// Define Relationships
User.hasMany(Article, {
  foreignKey: 'authorId',
  as: 'articles',
  onDelete: 'CASCADE'
});

Article.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});

module.exports = {
  sequelize,
  User,
  Article
};