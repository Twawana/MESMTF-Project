// Note: These models need to be created for PostgreSQL
// import Appointment from '../models/Appointment.pg.js';
import Patient from '../models/Patient.pg.js';
import User from '../models/User.pg.js';
import { validationResult } from 'express-validator';

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by appointment status
 *       - in: query
 *         name: doctor
 *         schema:
 *           type: string
 *         description: Filter by doctor ID
 *       - in: query
 *         name: patient
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by appointment date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of appointments per page
 *     responses:
 *       200:
 *         description: List of appointments
 */
export const getAppointments = async (req, res, next) => {
  try {
    const { status, doctor, patient, date, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (doctor) filter.doctor = doctor;
    if (patient) filter.patient = patient;
    
    // Filter by date (appointments for a specific day)
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.appointmentDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

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

    // Get appointments with pagination
    const appointments = await Appointment.find(filter)
      .populate('patient', 'patientId firstName lastName phone')
      .populate('doctor', 'name profile.specialization')
      .populate('assignedNurse', 'name')
      .populate('createdBy', 'name')
      .sort({ appointmentDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment data
 *       404:
 *         description: Appointment not found
 */
export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'patientId firstName lastName phone email dateOfBirth gender')
      .populate('doctor', 'name profile.specialization')
      .populate('assignedNurse', 'name')
      .populate('createdBy', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Time slot conflict
 */
export const createAppointment = async (req, res, next) => {
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

    const { patient, doctor, appointmentDate, duration = 30 } = req.body;

    // Check if patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Check if doctor exists and has the right role
    const doctorExists = await User.findOne({ _id: doctor, role: 'doctor' });
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Check for time slot conflicts
    const appointmentStart = new Date(appointmentDate);
    const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000);

    const conflictingAppointment = await Appointment.findOne({
      doctor: doctor,
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
      $or: [
        {
          appointmentDate: {
            $gte: appointmentStart,
            $lt: appointmentEnd
          }
        },
        {
          $expr: {
            $and: [
              { $lte: ['$appointmentDate', appointmentStart] },
              { $gt: [{ $add: ['$appointmentDate', { $multiply: ['$duration', 60000] }] }, appointmentStart] }
            ]
          }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        error: 'Time slot is already booked'
      });
    }

    // Create appointment
    const appointmentData = {
      ...req.body,
      createdBy: req.user.id
    };

    const appointment = await Appointment.create(appointmentData);

    // Populate references
    await appointment.populate([
      { path: 'patient', select: 'patientId firstName lastName phone' },
      { path: 'doctor', select: 'name profile.specialization' },
      { path: 'assignedNurse', select: 'name' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 */
export const updateAppointment = async (req, res, next) => {
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

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'patient', select: 'patientId firstName lastName phone' },
      { path: 'doctor', select: 'name profile.specialization' },
      { path: 'assignedNurse', select: 'name' },
      { path: 'createdBy', select: 'name' }
    ]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Cancel appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       404:
 *         description: Appointment not found
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, confirmed, in-progress, completed, cancelled, no-show]
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *       404:
 *         description: Appointment not found
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'patientId firstName lastName phone' },
      { path: 'doctor', select: 'name profile.specialization' }
    ]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};
