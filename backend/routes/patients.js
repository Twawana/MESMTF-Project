import express from 'express';
import { body } from 'express-validator';
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients
} from '../controllers/patientController.js';
import { protect, authorize, canAccessPatient } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createPatientValidation = [
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim(),
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim(),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age > 150 || birthDate > today) {
        throw new Error('Please provide a valid date of birth');
      }
      return true;
    }),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const updatePatientValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim(),
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim(),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age > 150 || birthDate > today) {
          throw new Error('Please provide a valid date of birth');
        }
      }
      return true;
    }),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Apply authentication to all routes
router.use(protect);

// Routes
router.route('/')
  .get(authorize('doctor', 'nurse', 'pharmacist', 'receptionist', 'admin'), getPatients)
  .post(authorize('doctor', 'nurse', 'receptionist', 'admin'), createPatientValidation, createPatient);

router.get('/search', authorize('doctor', 'nurse', 'pharmacist', 'receptionist', 'admin'), searchPatients);

router.route('/:id')
  .get(canAccessPatient, getPatient)
  .put(authorize('doctor', 'nurse', 'receptionist', 'admin'), updatePatientValidation, updatePatient)
  .delete(authorize('admin'), deletePatient);

export default router;
