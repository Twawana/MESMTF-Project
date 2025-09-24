import express from 'express';
import { body } from 'express-validator';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createAppointmentValidation = [
  body('patient')
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  body('doctor')
    .isMongoId()
    .withMessage('Please provide a valid doctor ID'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      if (appointmentDate <= now) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    }),
  body('reason')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
    .trim(),
  body('type')
    .optional()
    .isIn(['consultation', 'follow-up', 'emergency', 'routine-checkup'])
    .withMessage('Type must be one of: consultation, follow-up, emergency, routine-checkup'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes')
];

const updateAppointmentValidation = [
  body('patient')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  body('doctor')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid doctor ID'),
  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid appointment date'),
  body('reason')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
    .trim(),
  body('type')
    .optional()
    .isIn(['consultation', 'follow-up', 'emergency', 'routine-checkup'])
    .withMessage('Type must be one of: consultation, follow-up, emergency, routine-checkup'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Status must be one of: scheduled, confirmed, in-progress, completed, cancelled, no-show')
];

// Apply authentication to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getAppointments)
  .post(authorize('doctor', 'nurse', 'receptionist', 'admin'), createAppointmentValidation, createAppointment);

router.route('/:id')
  .get(getAppointment)
  .put(authorize('doctor', 'nurse', 'receptionist', 'admin'), updateAppointmentValidation, updateAppointment)
  .delete(authorize('doctor', 'receptionist', 'admin'), cancelAppointment);

router.patch('/:id/status', authorize('doctor', 'nurse', 'receptionist', 'admin'), updateAppointmentStatus);

export default router;
