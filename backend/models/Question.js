module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question',{
        id:{
         type: DataTypes.INTEGER,
         primaryKey: true,
      autoIncrement: true
        },
        quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Quizzes',
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
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of options: ["Option A", "Option B", "Option C", "Option D"]'
    },
    correctAnswer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Index of correct option (0-3)'
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Explanation for the correct answer'
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    tableName: 'Questions',
    timestamps: true
    });
    return Question;
};