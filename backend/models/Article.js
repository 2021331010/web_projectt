const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(250),
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.ENUM(
      'basics', 'head', 'neuroanatomy', 'neck', 'thorax',
      'back', 'upper-limb', 'lower-limb', 'abdomen', 'pelvis', '3d-body'
    ),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  excerpt: { type: DataTypes.STRING(500), allowNull: true },
  images: { type: DataTypes.JSON, defaultValue: [] },
  featuredImage: { type: DataTypes.STRING, allowNull: true },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  difficulty: { type: DataTypes.ENUM('beginner','intermediate','advanced'), defaultValue: 'beginner' },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
  readingTime: { type: DataTypes.INTEGER, defaultValue: 5 },
  tags: { type: DataTypes.JSON, defaultValue: [] }
}, {
  tableName: 'articles',
  freezeTableName: true,
  timestamps: true
});

module.exports = Article;
