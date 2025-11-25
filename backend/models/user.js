const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name cannot be empty' },
      len: { args: [2, 100], msg: 'Name must be 2-100 characters' }
    }
  },
  
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: { msg: 'Email already exists' },
    validate: {
      isEmail: { msg: 'Please provide a valid email' }
    }
  },
  
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [6, 100], msg: 'Password must be at least 6 characters' }
    }
  },
  
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'admin'),
    defaultValue: 'student'
  },
  
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'default-avatar.png'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
  
}, {
  timestamps: true,
  tableName: 'users',
  
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Check password
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;