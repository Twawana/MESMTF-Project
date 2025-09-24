import Diagnosis from '../models/Diagnosis.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import { validationResult } from 'express-validator';

// Malaria and Typhoid Expert System Logic
const malariaSymptoms = [
  'fever', 'chills', 'headache', 'muscle aches', 'fatigue', 'nausea', 'vomiting', 
  'diarrhea', 'abdominal pain', 'sweating', 'shivering'
];

const typhoidSymptoms = [
  'fever', 'headache', 'weakness', 'stomach pain', 'constipation', 'diarrhea',
  'loss of appetite', 'rash', 'enlarged spleen', 'rose spots', 'dry cough'
];

const assessMalariaRisk = (symptoms, testResults) => {
  const malariaScore = symptoms.filter(s => 
    malariaSymptoms.includes(s.symptom.toLowerCase())
  ).length;
  
  let riskLevel = 'low';
  if (malariaScore >= 5 || testResults?.rapidTest === 'positive' || testResults?.microscopy === 'positive') {
    riskLevel = 'high';
  } else if (malariaScore >= 3) {
    riskLevel = 'moderate';
  }
  
  return { riskLevel, score: malariaScore };
};

const assessTyphoidRisk = (symptoms, testResults) => {
  const typhoidScore = symptoms.filter(s => 
    typhoidSymptoms.includes(s.symptom.toLowerCase())
  ).length;
  
  let riskLevel = 'low';
  if (typhoidScore >= 5 || testResults?.widalTest === 'positive' || testResults?.bloodCulture === 'positive') {
    riskLevel = 'high';
  } else if (typhoidScore >= 3) {
    riskLevel = 'moderate';
  }
  
  return { riskLevel, score: typhoidScore };
};

/**
 * @swagger
 * /api/diagnosis:
 *   get:
 *     summary: Get diagnoses
 *     tags: [Diagnosis]
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
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of diagnoses per page
 *     responses:
 *       200:
 *         description: List of diagnoses
 */
export const getDiagnoses = async (req, res, next) => {
  try {
    const { patient, doctor, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;

    // Role-based filtering
    if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    } else if (req.user.role === 'patient') {
      // Find patient record for this user
      const patientRecord = await Patient.findOne({ userId: req.user.id });
      if (patientRecord) {
        filter.patient = patientRecord._id;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get diagnoses with pagination
    const diagnoses = await Diagnosis.find(filter)
      .populate('patient', 'patientId firstName lastName')
      .populate('doctor', 'name profile.specialization')
      .populate('appointment', 'appointmentId appointmentDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Diagnosis.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: diagnoses.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: diagnoses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diagnosis/{id}:
 *   get:
 *     summary: Get diagnosis by ID
 *     tags: [Diagnosis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diagnosis ID
 *     responses:
 *       200:
 *         description: Diagnosis data
 *       404:
 *         description: Diagnosis not found
 */
export const getDiagnosis = async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id)
      .populate('patient', 'patientId firstName lastName dateOfBirth gender')
      .populate('doctor', 'name profile.specialization')
      .populate('appointment', 'appointmentId appointmentDate');

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: 'Diagnosis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diagnosis:
 *   post:
 *     summary: Create new diagnosis
 *     tags: [Diagnosis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Diagnosis'
 *     responses:
 *       201:
 *         description: Diagnosis created successfully
 *       400:
 *         description: Validation error
 */
export const createDiagnosis = async (req, res, next) => {
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

    const { patient, appointment, symptoms } = req.body;

    // Verify patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Verify appointment exists
    const appointmentExists = await Appointment.findById(appointment);
    if (!appointmentExists) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Expert system assessment
    const malariaAssessment = assessMalariaRisk(symptoms, req.body.malariaAssessment?.testResults);
    const typhoidAssessment = assessTyphoidRisk(symptoms, req.body.typhoidAssessment?.testResults);

    // Create diagnosis with expert system recommendations
    const diagnosisData = {
      ...req.body,
      doctor: req.user.id,
      malariaAssessment: {
        ...req.body.malariaAssessment,
        riskLevel: malariaAssessment.riskLevel
      },
      typhoidAssessment: {
        ...req.body.typhoidAssessment,
        riskLevel: typhoidAssessment.riskLevel
      }
    };

    const diagnosis = await Diagnosis.create(diagnosisData);

    // Populate references
    await diagnosis.populate([
      { path: 'patient', select: 'patientId firstName lastName' },
      { path: 'doctor', select: 'name profile.specialization' },
      { path: 'appointment', select: 'appointmentId appointmentDate' }
    ]);

    res.status(201).json({
      success: true,
      data: diagnosis,
      expertSystemRecommendations: {
        malaria: {
          riskLevel: malariaAssessment.riskLevel,
          score: malariaAssessment.score,
          recommendation: malariaAssessment.riskLevel === 'high' ? 
            'Immediate malaria testing and treatment recommended' :
            malariaAssessment.riskLevel === 'moderate' ?
            'Consider malaria testing' : 'Low malaria risk'
        },
        typhoid: {
          riskLevel: typhoidAssessment.riskLevel,
          score: typhoidAssessment.score,
          recommendation: typhoidAssessment.riskLevel === 'high' ? 
            'Immediate typhoid testing and treatment recommended' :
            typhoidAssessment.riskLevel === 'moderate' ?
            'Consider typhoid testing' : 'Low typhoid risk'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diagnosis/{id}:
 *   put:
 *     summary: Update diagnosis
 *     tags: [Diagnosis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diagnosis ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Diagnosis'
 *     responses:
 *       200:
 *         description: Diagnosis updated successfully
 *       404:
 *         description: Diagnosis not found
 */
export const updateDiagnosis = async (req, res, next) => {
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

    const diagnosis = await Diagnosis.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'patient', select: 'patientId firstName lastName' },
      { path: 'doctor', select: 'name profile.specialization' },
      { path: 'appointment', select: 'appointmentId appointmentDate' }
    ]);

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: 'Diagnosis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diagnosis/expert-system/assess:
 *   post:
 *     summary: Get expert system assessment for symptoms
 *     tags: [Diagnosis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     symptom:
 *                       type: string
 *                     severity:
 *                       type: string
 *               testResults:
 *                 type: object
 *     responses:
 *       200:
 *         description: Expert system assessment
 */
export const getExpertSystemAssessment = async (req, res, next) => {
  try {
    const { symptoms, testResults } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms array is required'
      });
    }

    const malariaAssessment = assessMalariaRisk(symptoms, testResults?.malaria);
    const typhoidAssessment = assessTyphoidRisk(symptoms, testResults?.typhoid);

    res.status(200).json({
      success: true,
      data: {
        malaria: {
          riskLevel: malariaAssessment.riskLevel,
          score: malariaAssessment.score,
          matchingSymptoms: symptoms.filter(s => 
            malariaSymptoms.includes(s.symptom.toLowerCase())
          ).map(s => s.symptom),
          recommendation: malariaAssessment.riskLevel === 'high' ? 
            'Immediate malaria testing and treatment recommended' :
            malariaAssessment.riskLevel === 'moderate' ?
            'Consider malaria testing' : 'Low malaria risk'
        },
        typhoid: {
          riskLevel: typhoidAssessment.riskLevel,
          score: typhoidAssessment.score,
          matchingSymptoms: symptoms.filter(s => 
            typhoidSymptoms.includes(s.symptom.toLowerCase())
          ).map(s => s.symptom),
          recommendation: typhoidAssessment.riskLevel === 'high' ? 
            'Immediate typhoid testing and treatment recommended' :
            typhoidAssessment.riskLevel === 'moderate' ?
            'Consider typhoid testing' : 'Low typhoid risk'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
