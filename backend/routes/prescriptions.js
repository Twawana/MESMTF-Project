import express from 'express';
import { body } from 'express-validator';
import {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  dispensePrescription,
  cancelPrescription
} from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createPrescriptionValidation = [
  body('patient')
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  body('medications.*.name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters')
    .trim(),
  body('medications.*.dosage')
    .isLength({ min: 2, max: 50 })
    .withMessage('Dosage must be between 2 and 50 characters')
    .trim(),
  body('medications.*.frequency')
    .isLength({ min: 2, max: 50 })
    .withMessage('Frequency must be between 2 and 50 characters')
    .trim(),
  body('medications.*.duration')
    .isLength({ min: 2, max: 50 })
    .withMessage('Duration must be between 2 and 50 characters')
    .trim(),
  body('medications.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('instructions')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters')
    .trim()
];

const updatePrescriptionValidation = [
  body('medications')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  body('medications.*.name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters')
    .trim(),
  body('medications.*.dosage')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Dosage must be between 2 and 50 characters')
    .trim(),
  body('medications.*.frequency')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Frequency must be between 2 and 50 characters')
    .trim(),
  body('medications.*.duration')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Duration must be between 2 and 50 characters')
    .trim(),
  body('medications.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('instructions')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters')
    .trim()
];

const dispensePrescriptionValidation = [
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication to dispense is required'),
  body('medications.*.medicationIndex')
    .isInt({ min: 0 })
    .withMessage('Medication index must be a valid number'),
  body('medications.*.quantityDispensed')
    .isInt({ min: 1 })
    .withMessage('Quantity dispensed must be at least 1'),
  body('dispensingNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Dispensing notes cannot exceed 500 characters')
    .trim()
];

// Apply authentication to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getPrescriptions)
  .post(authorize('doctor'), createPrescriptionValidation, createPrescription);

router.route('/:id')
  .get(getPrescription)
  .put(authorize('doctor'), updatePrescriptionValidation, updatePrescription);

router.patch('/:id/dispense', authorize('pharmacist'), dispensePrescriptionValidation, dispensePrescription);
router.patch('/:id/cancel', authorize('doctor', 'admin'), cancelPrescription);

export default router;
