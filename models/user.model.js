const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Name is required'
      },
      notEmpty: {
        msg: 'Name cannot be empty'
      },
      len: {
        args: [2, 100],
        msg: 'Name must be between 2 and 100 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'email',
      msg: 'Email already in use'
    },
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      },
      notNull: {
        msg: 'Email is required'
      },
      notEmpty: {
        msg: 'Email cannot be empty'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'suspended']],
        msg: 'Invalid status value'
      }
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      name: 'idx_user_email',
      unique: true,
      fields: ['email']
    },
    {
      name: 'idx_user_status',
      fields: ['status']
    }
  ]
});

// Add instance methods
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.createdAt;
  delete values.updatedAt;
  return values;
};

module.exports = User;
