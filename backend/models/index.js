const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Import Models
const User = require('./user')(sequelize, DataTypes);
const Comment = require('./Comment')(sequelize, DataTypes);
const Quiz = require('./Quiz')(sequelize, DataTypes);           
const Question = require('./Question')(sequelize, DataTypes); 
const QuizAttempt = require('./QuizAttempt')(sequelize, DataTypes); 

// User - Comment Associations
User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE'
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Quiz - Question Associations
Quiz.hasMany(Question, {
  foreignKey: 'quizId',
  as: 'questions',
  onDelete: 'CASCADE'
});

Question.belongsTo(Quiz, {
  foreignKey: 'quizId',
  as: 'quiz'
});

// User - QuizAttempt Associations
User.hasMany(QuizAttempt, {
  foreignKey: 'userId',
  as: 'quizAttempts',
  onDelete: 'CASCADE'
});

QuizAttempt.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Quiz - QuizAttempt Associations
Quiz.hasMany(QuizAttempt, {
  foreignKey: 'quizId',
  as: 'attempts',
  onDelete: 'CASCADE'
});

QuizAttempt.belongsTo(Quiz, {
  foreignKey: 'quizId',
  as: 'quiz'
});

module.exports = {
  sequelize,
  User,
  Comment,
  Quiz,          
  Question,     
  QuizAttempt   
};