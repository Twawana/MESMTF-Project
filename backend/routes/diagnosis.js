import express from 'express';
import { body } from 'express-validator';
import {
  getDiagnoses,
  getDiagnosis,
  createDiagnosis,
  updateDiagnosis,
  getExpertSystemAssessment,
  savePatientDiagnosis
} from '../controllers/diagnosisController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createDiagnosisValidation = [
  body('patient')
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  body('appointment')
    .isMongoId()
    .withMessage('Please provide a valid appointment ID'),
  body('symptoms')
    .isArray({ min: 1 })
    .withMessage('At least one symptom is required'),
  body('symptoms.*.symptom')
    .isLength({ min: 2, max: 100 })
    .withMessage('Symptom must be between 2 and 100 characters')
    .trim(),
  body('symptoms.*.severity')
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Severity must be mild, moderate, or severe'),
  body('diagnosis.primary')
    .isLength({ min: 3, max: 200 })
    .withMessage('Primary diagnosis must be between 3 and 200 characters')
    .trim(),
  body('diagnosis.confidence')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Confidence must be between 0 and 100')
];

const updateDiagnosisValidation = [
  body('symptoms')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one symptom is required'),
  body('symptoms.*.symptom')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Symptom must be between 2 and 100 characters')
    .trim(),
  body('symptoms.*.severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Severity must be mild, moderate, or severe'),
  body('diagnosis.primary')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Primary diagnosis must be between 3 and 200 characters')
    .trim(),
  body('diagnosis.confidence')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Confidence must be between 0 and 100')
];

const expertSystemValidation = [
  body('symptoms')
    .isArray({ min: 1 })
    .withMessage('At least one symptom is required'),
  body('symptoms.*.symptom')
    .isLength({ min: 2, max: 100 })
    .withMessage('Symptom must be between 2 and 100 characters')
    .trim(),
  body('symptoms.*.severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Severity must be mild, moderate, or severe')
];

// Apply authentication to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getDiagnoses)
  .post(authorize('doctor'), createDiagnosisValidation, createDiagnosis);

router.post('/expert-system/assess', authorize('doctor', 'nurse'), expertSystemValidation, getExpertSystemAssessment);

// Patient AI diagnosis endpoint
router.post('/patient-ai', authorize('patient'), [
  body('symptoms').optional().isArray().withMessage('Symptoms must be an array'),
  body('diagnosis').optional().isString().withMessage('Diagnosis must be a string'),
  body('confidence').optional().isString().withMessage('Confidence must be a string'),
  body('recommendations').optional().isString().withMessage('Recommendations must be a string')
], savePatientDiagnosis);

router.route('/:id')
  .get(getDiagnosis)
  .put(authorize('doctor'), updateDiagnosisValidation, updateDiagnosis);

export default router;
