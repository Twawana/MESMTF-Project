import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - patient
 *         - doctor
 *         - appointmentDate
 *         - reason
 *       properties:
 *         _id:
 *           type: string
 *           description: Appointment ID
 *         appointmentId:
 *           type: string
 *           description: Unique appointment identifier
 *         patient:
 *           type: string
 *           description: Patient ID reference
 *         doctor:
 *           type: string
 *           description: Doctor ID reference
 *         appointmentDate:
 *           type: string
 *           format: date-time
 *           description: Appointment date and time
 *         reason:
 *           type: string
 *           description: Reason for appointment
 *         status:
 *           type: string
 *           enum: [scheduled, confirmed, in-progress, completed, cancelled, no-show]
 *           description: Appointment status
 *         type:
 *           type: string
 *           enum: [consultation, follow-up, emergency, routine-checkup]
 *           description: Type of appointment
 *         duration:
 *           type: number
 *           description: Duration in minutes
 *         notes:
 *           type: string
 *           description: Additional notes
 *         symptoms:
 *           type: array
 *           items:
 *             type: string
 *           description: Patient symptoms
 *         vitalSigns:
 *           type: object
 *           properties:
 *             temperature:
 *               type: number
 *             bloodPressure:
 *               type: string
 *             heartRate:
 *               type: number
 *             weight:
 *               type: number
 *             height:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
    default: 'consultation'
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration cannot exceed 180 minutes']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  vitalSigns: {
    temperature: {
      type: Number,
      min: [30, 'Temperature seems too low'],
      max: [50, 'Temperature seems too high']
    },
    bloodPressure: {
      systolic: { type: Number },
      diastolic: { type: Number }
    },
    heartRate: {
      type: Number,
      min: [30, 'Heart rate seems too low'],
      max: [200, 'Heart rate seems too high']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    oxygenSaturation: {
      type: Number,
      min: [0, 'Oxygen saturation cannot be negative'],
      max: [100, 'Oxygen saturation cannot exceed 100%']
    }
  },
  // For rescheduling tracking
  originalDate: {
    type: Date
  },
  rescheduleReason: {
    type: String,
    trim: true
  },
  // Assigned nurse for the appointment
  assignedNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Room/location information
  room: {
    type: String,
    trim: true
  },
  // Follow-up information
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  // Created by (receptionist/admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentId: 1 });

// Virtual for appointment duration in hours
appointmentSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual to check if appointment is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return today.toDateString() === appointmentDate.toDateString();
});

// Virtual to check if appointment is overdue
appointmentSchema.virtual('isOverdue').get(function() {
  const now = new Date();
  return this.appointmentDate < now && this.status === 'scheduled';
});

// Ensure virtual fields are serialized
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate appointment ID
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `A${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to set original date for rescheduling
appointmentSchema.pre('save', function(next) {
  if (this.isModified('appointmentDate') && !this.originalDate) {
    this.originalDate = this.appointmentDate;
  }
  next();
});

export default mongoose.model('Appointment', appointmentSchema);
