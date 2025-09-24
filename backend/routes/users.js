import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Username can only contain letters, numbers, dots, underscores, and hyphens'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  body('role')
    .isIn(['patient', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'admin'])
    .withMessage('Role must be one of: patient, doctor, nurse, pharmacist, receptionist, admin')
];

const updateUserValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Username can only contain letters, numbers, dots, underscores, and hyphens'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  body('role')
    .optional()
    .isIn(['patient', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'admin'])
    .withMessage('Role must be one of: patient, doctor, nurse, pharmacist, receptionist, admin')
];

// Apply authentication to all routes
router.use(protect);

// Routes
router.route('/')
  .get(authorize('admin', 'receptionist'), getUsers)
  .post(authorize('admin'), createUserValidation, createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUserValidation, updateUser)
  .delete(authorize('admin'), deleteUser);

router.patch('/:id/status', authorize('admin'), updateUserStatus);

export default router;
