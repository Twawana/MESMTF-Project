// Note: These models need to be created for PostgreSQL
// import Prescription from '../models/Prescription.pg.js';
import Patient from '../models/Patient.pg.js';
// import Diagnosis from '../models/Diagnosis.pg.js';
import { validationResult } from 'express-validator';

/**
 * @swagger
 * /api/prescriptions:
 *   get:
 *     summary: Get prescriptions
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: doctor
 *         schema:
 *           type: string
 *         description: Filter by doctor ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by prescription status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of prescriptions per page
 *     responses:
 *       200:
 *         description: List of prescriptions
 */
export const getPrescriptions = async (req, res, next) => {
  try {
    const { patient, doctor, status, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;
    if (status) filter.status = status;

    // Role-based filtering
    if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    } else if (req.user.role === 'patient') {
      // Find patient record for this user
      const patientRecord = await Patient.findOne({ userId: req.user.id });
      if (patientRecord) {
        filter.patient = patientRecord._id;
      }
    } else if (req.user.role === 'pharmacist') {
      // Pharmacists can see all prescriptions, but might want to filter by status
      if (!status) {
        filter.status = { $in: ['pending', 'partially-dispensed'] };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get prescriptions with pagination
    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'patientId firstName lastName phone')
      .populate('doctor', 'name profile.specialization')
      .populate('diagnosis', 'diagnosis.primary')
      .populate('dispensedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Prescription.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get prescription by ID
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription data
 *       404:
 *         description: Prescription not found
 */
export const getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'patientId firstName lastName phone dateOfBirth')
      .populate('doctor', 'name profile.specialization')
      .populate('diagnosis', 'diagnosis.primary diagnosis.secondary')
      .populate('dispensedBy', 'name');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create new prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Validation error
 */
export const createPrescription = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { patient, diagnosis } = req.body;

    // Verify patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Verify diagnosis exists if provided
    if (diagnosis) {
      const diagnosisExists = await Diagnosis.findById(diagnosis);
      if (!diagnosisExists) {
        return res.status(404).json({
          success: false,
          error: 'Diagnosis not found'
        });
      }
    }

    // Create prescription
    const prescriptionData = {
      ...req.body,
      doctor: req.user.id
    };

    const prescription = await Prescription.create(prescriptionData);

    // Populate references
    await prescription.populate([
      { path: 'patient', select: 'patientId firstName lastName phone' },
      { path: 'doctor', select: 'name profile.specialization' },
      { path: 'diagnosis', select: 'diagnosis.primary' }
    ]);

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   put:
 *     summary: Update prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Prescription'
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *       404:
 *         description: Prescription not found
 */
export const updatePrescription = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'patient', select: 'patientId firstName lastName phone' },
      { path: 'doctor', select: 'name profile.specialization' },
      { path: 'diagnosis', select: 'diagnosis.primary' },
      { path: 'dispensedBy', select: 'name' }
    ]);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/prescriptions/{id}/dispense:
 *   patch:
 *     summary: Dispense prescription (Pharmacist only)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicationIndex:
 *                       type: number
 *                     quantityDispensed:
 *                       type: number
 *               dispensingNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prescription dispensed successfully
 *       404:
 *         description: Prescription not found
 */
export const dispensePrescription = async (req, res, next) => {
  try {
    const { medications, dispensingNotes } = req.body;
    const prescriptionId = req.params.id;

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    // Update medication dispensing information
    medications.forEach(({ medicationIndex, quantityDispensed }) => {
      if (prescription.medications[medicationIndex]) {
        const medication = prescription.medications[medicationIndex];
        medication.quantityDispensed = Math.min(
          medication.quantityDispensed + quantityDispensed,
          medication.quantity
        );
        
        // Update medication status
        if (medication.quantityDispensed >= medication.quantity) {
          medication.status = 'dispensed';
        } else if (medication.quantityDispensed > 0) {
          medication.status = 'partially-dispensed';
        }
      }
    });

    // Update prescription metadata
    prescription.dispensedBy = req.user.id;
    prescription.dispensedAt = new Date();
    prescription.dispensingNotes = dispensingNotes;

    await prescription.save();

    // Populate references
    await prescription.populate([
      { path: 'patient', select: 'patientId firstName lastName phone' },
      { path: 'doctor', select: 'name profile.specialization' },
      { path: 'dispensedBy', select: 'name' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Prescription dispensed successfully',
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/prescriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription cancelled successfully
 *       404:
 *         description: Prescription not found
 */
export const cancelPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate([
      { path: 'patient', select: 'patientId firstName lastName phone' },
      { path: 'doctor', select: 'name profile.specialization' }
    ]);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prescription cancelled successfully',
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};
