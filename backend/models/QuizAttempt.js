const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QuizAttempt = sequelize.define('QuizAttempt', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    answers: {
      type: DataTypes.JSON, // { questionId: userAnswer }
      defaultValue: {}
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    correctAnswers: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('in-progress', 'completed', 'timeout'),
      defaultValue: 'in-progress'
    },
    timeTaken: {
      type: DataTypes.INTEGER, // in seconds
      allowNull: true
    }
  }, {
    tableName: 'quiz_attempts',
    timestamps: true
  });

  return QuizAttempt;
};