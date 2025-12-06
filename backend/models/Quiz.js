const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Quiz = sequelize.define('Quiz', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM(
        'basics', 'head', 'neuroanatomy', 'neck', 'thorax',
        'back', 'upper-limb', 'lower-limb', 'abdomen', 'pelvis', '3d-body'
      ),
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner'
    },
    timeLimit: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 30
    },
    passingScore: {
      type: DataTypes.INTEGER, // percentage
      defaultValue: 60
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'quizzes',
    timestamps: true
  });

  return Quiz;
};