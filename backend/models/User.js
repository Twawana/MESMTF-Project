import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
 *         _id:
 *           type: string
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
 *               enum: [Male, Female, Other]
 *             specialization:
 *               type: string
 *               description: For healthcare providers
 *             licenseNumber:
 *               type: string
 *               description: Professional license number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         lastLogin:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['patient', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'admin'],
      message: 'Role must be one of: patient, doctor, nurse, pharmacist, receptionist, admin'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  profile: {
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    // For healthcare providers
    specialization: {
      type: String,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    }
  },
  lastLogin: {
    type: Date
  },
  refreshToken: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate refresh token
userSchema.methods.getRefreshToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

export default mongoose.model('User', userSchema);
