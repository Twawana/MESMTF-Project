import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - dateOfBirth
 *         - gender
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           description: Patient ID
 *         patientId:
 *           type: string
 *           description: Unique patient identifier
 *         firstName:
 *           type: string
 *           description: Patient's first name
 *         lastName:
 *           type: string
 *           description: Patient's last name
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Date of birth
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *           description: Gender
 *         phone:
 *           type: string
 *           description: Phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *         emergencyContact:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             relationship:
 *               type: string
 *             phone:
 *               type: string
 *         medicalHistory:
 *           type: object
 *           properties:
 *             allergies:
 *               type: array
 *               items:
 *                 type: string
 *             chronicConditions:
 *               type: array
 *               items:
 *                 type: string
 *             medications:
 *               type: array
 *               items:
 *                 type: string
 *             bloodType:
 *               type: string
 *         insurance:
 *           type: object
 *           properties:
 *             provider:
 *               type: string
 *             policyNumber:
 *               type: string
 *             groupNumber:
 *               type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Patient status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Namibia' }
  },
  emergencyContact: {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  medicalHistory: {
    allergies: [{ type: String, trim: true }],
    chronicConditions: [{ type: String, trim: true }],
    medications: [{ type: String, trim: true }],
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
    },
    notes: { type: String, trim: true }
  },
  insurance: {
    provider: { type: String, trim: true },
    policyNumber: { type: String, trim: true },
    groupNumber: { type: String, trim: true }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  // Reference to User if patient has a user account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Assigned healthcare providers
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

// Index for better query performance
patientSchema.index({ patientId: 1 });
patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ email: 1 });

// Pre-save middleware to generate patient ID
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `P${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Patient', patientSchema);
