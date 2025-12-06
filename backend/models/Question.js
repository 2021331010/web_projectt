const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quizzes',
        key: 'id'
      }
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    questionType: {
      type: DataTypes.ENUM('multiple-choice', 'true-false'),
      defaultValue: 'multiple-choice'
    },
    options: {
      type: DataTypes.JSON, // ['Option A', 'Option B', 'Option C', 'Option D']
      allowNull: false
    },
    correctAnswer: {
      type: DataTypes.STRING(10), // 'A', 'B', 'C', 'D' or 'true', 'false'
      allowNull: false
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'questions',
    timestamps: true
  });

  return Question;
};