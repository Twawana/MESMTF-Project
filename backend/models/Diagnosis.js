import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Diagnosis:
 *       type: object
 *       required:
 *         - patient
 *         - doctor
 *         - appointment
 *         - symptoms
 *         - diagnosis
 *       properties:
 *         _id:
 *           type: string
 *           description: Diagnosis ID
 *         diagnosisId:
 *           type: string
 *           description: Unique diagnosis identifier
 *         patient:
 *           type: string
 *           description: Patient ID reference
 *         doctor:
 *           type: string
 *           description: Doctor ID reference
 *         appointment:
 *           type: string
 *           description: Appointment ID reference
 *         symptoms:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               symptom:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [mild, moderate, severe]
 *               duration:
 *                 type: string
 *         diagnosis:
 *           type: object
 *           properties:
 *             primary:
 *               type: string
 *             secondary:
 *               type: array
 *               items:
 *                 type: string
 *             confidence:
 *               type: number
 *               minimum: 0
 *               maximum: 100
 *             icd10Code:
 *               type: string
 *         malariaAssessment:
 *           type: object
 *           properties:
 *             riskLevel:
 *               type: string
 *               enum: [low, moderate, high]
 *             testResults:
 *               type: object
 *               properties:
 *                 rapidTest:
 *                   type: string
 *                   enum: [positive, negative, not-done]
 *                 microscopy:
 *                   type: string
 *                   enum: [positive, negative, not-done]
 *                 parasiteCount:
 *                   type: number
 *             species:
 *               type: string
 *               enum: [P. falciparum, P. vivax, P. ovale, P. malariae, mixed]
 *         typhoidAssessment:
 *           type: object
 *           properties:
 *             riskLevel:
 *               type: string
 *               enum: [low, moderate, high]
 *             testResults:
 *               type: object
 *               properties:
 *                 widalTest:
 *                   type: string
 *                   enum: [positive, negative, not-done]
 *                 bloodCulture:
 *                   type: string
 *                   enum: [positive, negative, not-done]
 *                 stoolCulture:
 *                   type: string
 *                   enum: [positive, negative, not-done]
 *         treatment:
 *           type: object
 *           properties:
 *             medications:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   dosage:
 *                     type: string
 *                   frequency:
 *                     type: string
 *                   duration:
 *                     type: string
 *             instructions:
 *               type: string
 *         followUp:
 *           type: object
 *           properties:
 *             required:
 *               type: boolean
 *             date:
 *               type: string
 *               format: date
 *             instructions:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const diagnosisSchema = new mongoose.Schema({
  diagnosisId: {
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment is required']
  },
  symptoms: [{
    symptom: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true
    },
    duration: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  diagnosis: {
    primary: {
      type: String,
      required: [true, 'Primary diagnosis is required'],
      trim: true
    },
    secondary: [{
      type: String,
      trim: true
    }],
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be negative'],
      max: [100, 'Confidence cannot exceed 100%']
    },
    icd10Code: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  // Malaria-specific assessment
  malariaAssessment: {
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    testResults: {
      rapidTest: {
        type: String,
        enum: ['positive', 'negative', 'not-done']
      },
      microscopy: {
        type: String,
        enum: ['positive', 'negative', 'not-done']
      },
      parasiteCount: {
        type: Number,
        min: 0
      }
    },
    species: {
      type: String,
      enum: ['P. falciparum', 'P. vivax', 'P. ovale', 'P. malariae', 'mixed']
    },
    complications: [{
      type: String,
      trim: true
    }]
  },
  // Typhoid-specific assessment
  typhoidAssessment: {
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    testResults: {
      widalTest: {
        type: String,
        enum: ['positive', 'negative', 'not-done']
      },
      bloodCulture: {
        type: String,
        enum: ['positive', 'negative', 'not-done']
      },
      stoolCulture: {
        type: String,
        enum: ['positive', 'negative', 'not-done']
      },
      typhiDot: {
        type: String,
        enum: ['positive', 'negative', 'not-done']
      }
    },
    complications: [{
      type: String,
      trim: true
    }]
  },
  treatment: {
    medications: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      dosage: {
        type: String,
        required: true,
        trim: true
      },
      frequency: {
        type: String,
        required: true,
        trim: true
      },
      duration: {
        type: String,
        required: true,
        trim: true
      },
      instructions: {
        type: String,
        trim: true
      }
    }],
    generalInstructions: {
      type: String,
      trim: true
    },
    dietaryRecommendations: {
      type: String,
      trim: true
    },
    activityRestrictions: {
      type: String,
      trim: true
    }
  },
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date
    },
    instructions: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'chronic'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for better query performance
diagnosisSchema.index({ patient: 1 });
diagnosisSchema.index({ doctor: 1 });
diagnosisSchema.index({ appointment: 1 });
diagnosisSchema.index({ diagnosisId: 1 });
diagnosisSchema.index({ 'diagnosis.primary': 1 });
diagnosisSchema.index({ createdAt: -1 });

// Pre-save middleware to generate diagnosis ID
diagnosisSchema.pre('save', async function(next) {
  if (!this.diagnosisId) {
    const count = await mongoose.model('Diagnosis').countDocuments();
    this.diagnosisId = `D${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Diagnosis', diagnosisSchema);
