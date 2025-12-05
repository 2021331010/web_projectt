module.exports = (sequelize, DataTypes) => {
  const QuizAttempt = sequelize.define('QuizAttempt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Quizzes',
        key: 'id'
      }
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
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
    answers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of user answers with question IDs'
    },
    status: {
      type: DataTypes.ENUM('in-progress', 'completed', 'abandoned'),
      defaultValue: 'in-progress'
    }
  }, {
    tableName: 'QuizAttempts',
    timestamps: true
  });

  return QuizAttempt;
};