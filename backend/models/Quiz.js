module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define('Quiz', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g., Head, Neck, Thorax, etc.'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 600,
      comment: 'Duration in seconds (default 10 minutes)'
    },
    passingScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      comment: 'Percentage required to pass'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Quizzes',
    timestamps: true
  });

  return Quiz;
};