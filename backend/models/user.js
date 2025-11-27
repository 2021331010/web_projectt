const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING(150), 
      allowNull: false, 
      unique: true 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'student'
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'users',
    freezeTableName: true,
    timestamps: true
  });

  // Hash password before saving
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Compare password
  User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  return User;
};