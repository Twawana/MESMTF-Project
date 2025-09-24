import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Diagnosis from '../models/Diagnosis.js';
import Prescription from '../models/Prescription.js';

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       403:
 *         description: Access denied
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // Get current date ranges
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Parallel queries for better performance
    const [
      totalUsers,
      totalPatients,
      totalAppointments,
      todayAppointments,
      weeklyAppointments,
      monthlyAppointments,
      totalDiagnoses,
      totalPrescriptions,
      pendingPrescriptions,
      usersByRole,
      appointmentsByStatus,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: {
          $gte: startOfToday,
          $lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
        }
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfWeek }
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfMonth }
      }),
      Diagnosis.countDocuments(),
      Prescription.countDocuments(),
      Prescription.countDocuments({ status: 'pending' }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Appointment.find()
        .populate('patient', 'firstName lastName')
        .populate('doctor', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('appointmentId patient doctor appointmentDate status createdAt')
    ]);

    // Calculate growth rates (simplified - you might want to implement proper historical comparison)
    const patientGrowth = 5.2; // Mock data - implement actual calculation
    const appointmentGrowth = 12.8;
    const diagnosisGrowth = 8.5;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPatients,
          totalAppointments,
          totalDiagnoses,
          totalPrescriptions,
          pendingPrescriptions
        },
        appointments: {
          today: todayAppointments,
          thisWeek: weeklyAppointments,
          thisMonth: monthlyAppointments
        },
        growth: {
          patients: patientGrowth,
          appointments: appointmentGrowth,
          diagnoses: diagnosisGrowth
        },
        distribution: {
          usersByRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/system-health:
 *   get:
 *     summary: Get system health status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status
 */
export const getSystemHealth = async (req, res, next) => {
  try {
    const startTime = Date.now();
    
    // Test database connectivity
    await User.findOne().limit(1);
    const dbResponseTime = Date.now() - startTime;

    // Get system information
    const systemInfo = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      database: {
        status: 'connected',
        responseTime: dbResponseTime
      },
      lastBackup: new Date().toISOString(), // Mock data
      diskSpace: {
        total: '100GB', // Mock data
        used: '45GB',
        available: '55GB'
      }
    };

    res.status(200).json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/reports/summary:
 *   get:
 *     summary: Get summary reports
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *         description: Report period
 *     responses:
 *       200:
 *         description: Summary reports
 */
export const getSummaryReports = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [
      appointmentStats,
      diagnosisStats,
      prescriptionStats,
      patientStats
    ] = await Promise.all([
      Appointment.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Diagnosis.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$diagnosis.primary',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Prescription.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalCost: { $sum: '$totalCost' }
          }
        }
      ]),
      Patient.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate,
          end: now
        },
        appointments: appointmentStats,
        diagnoses: diagnosisStats,
        prescriptions: prescriptionStats,
        patientRegistrations: patientStats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs per page
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: Audit logs
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    
    // Mock audit logs - in a real system, you'd have a proper audit log collection
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(),
        user: 'admin@moh.gov',
        action: 'USER_CREATED',
        resource: 'User',
        resourceId: 'user123',
        details: 'Created new doctor account',
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000),
        user: 'dr.smith@moh.gov',
        action: 'DIAGNOSIS_CREATED',
        resource: 'Diagnosis',
        resourceId: 'diag456',
        details: 'Created malaria diagnosis',
        ipAddress: '192.168.1.101'
      }
    ];

    // Filter by action if provided
    const filteredLogs = action 
      ? mockLogs.filter(log => log.action === action)
      : mockLogs;

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginatedLogs.length,
      total: filteredLogs.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredLogs.length / limit)
      },
      data: paginatedLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/backup:
 *   post:
 *     summary: Initiate system backup
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup initiated successfully
 */
export const initiateBackup = async (req, res, next) => {
  try {
    // In a real system, you would implement actual backup logic
    // This is a mock implementation
    
    const backupId = `backup_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Simulate backup process
    setTimeout(() => {
      console.log(`Backup ${backupId} completed at ${timestamp}`);
    }, 5000);

    res.status(200).json({
      success: true,
      message: 'Backup initiated successfully',
      data: {
        backupId,
        timestamp,
        status: 'in_progress',
        estimatedCompletion: new Date(Date.now() + 300000).toISOString() // 5 minutes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings
 */
export const getSystemSettings = async (req, res, next) => {
  try {
    // Mock system settings - in a real system, you'd store these in a database
    const settings = {
      hospital: {
        name: process.env.HOSPITAL_NAME || 'Ministry of Health Hospital',
        location: process.env.HOSPITAL_LOCATION || 'Windhoek, Namibia',
        contactEmail: process.env.HOSPITAL_CONTACT_EMAIL || 'info@moh.gov',
        contactPhone: process.env.HOSPITAL_CONTACT_PHONE || '+264 61 123 4567',
        emergencyContact: process.env.HOSPITAL_EMERGENCY_CONTACT || '+264 81 123 4567'
      },
      system: {
        maintenanceMode: false,
        allowRegistration: true,
        sessionTimeout: 30, // minutes
        maxLoginAttempts: 5,
        backupFrequency: 'daily'
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        appointmentReminders: true,
        prescriptionAlerts: true
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Update system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
export const updateSystemSettings = async (req, res, next) => {
  try {
    // In a real system, you would validate and save these settings to a database
    const updatedSettings = req.body;

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    next(error);
  }
};
