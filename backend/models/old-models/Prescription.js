import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Prescription:
 *       type: object
 *       required:
 *         - patient
 *         - doctor
 *         - medications
 *       properties:
 *         _id:
 *           type: string
 *           description: Prescription ID
 *         prescriptionId:
 *           type: string
 *           description: Unique prescription identifier
 *         patient:
 *           type: string
 *           description: Patient ID reference
 *         doctor:
 *           type: string
 *           description: Doctor ID reference
 *         diagnosis:
 *           type: string
 *           description: Diagnosis ID reference
 *         medications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               genericName:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               duration:
 *                 type: string
 *               quantity:
 *                 type: number
 *               instructions:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, dispensed, partially-dispensed]
 *         status:
 *           type: string
 *           enum: [pending, dispensed, partially-dispensed, cancelled]
 *           description: Prescription status
 *         instructions:
 *           type: string
 *           description: General instructions
 *         dispensedBy:
 *           type: string
 *           description: Pharmacist ID reference
 *         dispensedAt:
 *           type: string
 *           format: date-time
 *           description: Dispensing date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
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
  diagnosis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Diagnosis'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medications: [{
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true
    },
    genericName: {
      type: String,
      trim: true
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    quantityDispensed: {
      type: Number,
      default: 0,
      min: [0, 'Quantity dispensed cannot be negative']
    },
    instructions: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'dispensed', 'partially-dispensed'],
      default: 'pending'
    },
    // Drug interaction warnings
    warnings: [{
      type: String,
      trim: true
    }],
    // Cost information
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative']
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'dispensed', 'partially-dispensed', 'cancelled'],
    default: 'pending'
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters']
  },
  // Dispensing information
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dispensedAt: {
    type: Date
  },
  dispensingNotes: {
    type: String,
    trim: true
  },
  // Prescription validity
  validUntil: {
    type: Date
  },
  // Refill information
  refillsAllowed: {
    type: Number,
    default: 0,
    min: [0, 'Refills allowed cannot be negative']
  },
  refillsUsed: {
    type: Number,
    default: 0,
    min: [0, 'Refills used cannot be negative']
  },
  // Priority level
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'emergency'],
    default: 'routine'
  },
  // Insurance information
  insurance: {
    covered: {
      type: Boolean,
      default: false
    },
    copay: {
      type: Number,
      min: [0, 'Copay cannot be negative']
    },
    claimNumber: {
      type: String,
      trim: true
    }
  },
  // Total cost
  totalCost: {
    type: Number,
    min: [0, 'Total cost cannot be negative']
  }
}, {
  timestamps: true
});

// Index for better query performance
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ prescriptionId: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ dispensedBy: 1 });
prescriptionSchema.index({ createdAt: -1 });

// Virtual to check if prescription is expired
prescriptionSchema.virtual('isExpired').get(function() {
  if (!this.validUntil) return false;
  return new Date() > this.validUntil;
});

// Virtual to check if refills are available
prescriptionSchema.virtual('refillsAvailable').get(function() {
  return this.refillsAllowed - this.refillsUsed;
});

// Virtual to calculate total quantity dispensed
prescriptionSchema.virtual('totalQuantityDispensed').get(function() {
  return this.medications.reduce((total, med) => total + med.quantityDispensed, 0);
});

// Virtual to calculate total quantity prescribed
prescriptionSchema.virtual('totalQuantityPrescribed').get(function() {
  return this.medications.reduce((total, med) => total + med.quantity, 0);
});

// Ensure virtual fields are serialized
prescriptionSchema.set('toJSON', { virtuals: true });
prescriptionSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate prescription ID
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `RX${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to set validity period (default 30 days)
prescriptionSchema.pre('save', function(next) {
  if (!this.validUntil && this.isNew) {
    const validityDays = 30; // Default validity period
    this.validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
  }
  next();
});

// Pre-save middleware to calculate total cost
prescriptionSchema.pre('save', function(next) {
  this.totalCost = this.medications.reduce((total, med) => {
    return total + (med.totalPrice || 0);
  }, 0);
  next();
});

// Pre-save middleware to update prescription status based on medication status
prescriptionSchema.pre('save', function(next) {
  const medications = this.medications;
  const allDispensed = medications.every(med => med.status === 'dispensed');
  const someDispensed = medications.some(med => med.status === 'dispensed' || med.status === 'partially-dispensed');
  
  if (allDispensed) {
    this.status = 'dispensed';
  } else if (someDispensed) {
    this.status = 'partially-dispensed';
  }
  
  next();
});

export default mongoose.model('Prescription', prescriptionSchema);
