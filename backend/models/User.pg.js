import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../config/database.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - role
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         username:
 *           type: string
 *           description: Unique username
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         name:
 *           type: string
 *           description: Full name
 *         role:
 *           type: string
 *           enum: [patient, doctor, nurse, pharmacist, receptionist, admin]
 *           description: User role
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Account status
 *         profile:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *             dateOfBirth:
 *               type: string
 *               format: date
 *             gender:
 *               type: string
 *               enum: [male, female, other]
 *             specialization:
 *               type: string
 *             licenseNumber:
 *               type: string
 */

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      is: /^[a-zA-Z0-9._-]+$/,
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255],
    },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
    },
  },
  role: {
    type: DataTypes.ENUM('patient', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'admin'),
    allowNull: false,
    defaultValue: 'patient',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    allowNull: false,
    defaultValue: 'active',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  profile: {
    type: DataTypes.JSONB,
    defaultValue: {},
    validate: {
      isValidProfile(value) {
        if (value && typeof value !== 'object') {
          throw new Error('Profile must be an object');
        }
      },
    },
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['username'],
    },
    {
      unique: true,
      fields: ['email'],
    },
    {
      fields: ['role'],
    },
    {
      fields: ['status'],
    },
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Instance methods
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.getSignedJwtToken = function() {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

User.prototype.getSignedRefreshToken = function() {
  return jwt.sign({ id: this.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.refreshToken;
  delete values.emailVerificationToken;
  delete values.passwordResetToken;
  return values;
};

// Class methods
User.findByLogin = async function(login) {
  let user = await this.findOne({
    where: {
      username: login,
    },
  });

  if (!user) {
    user = await this.findOne({
      where: {
        email: login,
      },
    });
  }

  return user;
};

export default User;
