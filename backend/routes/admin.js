import express from 'express';
import {
  getDashboardStats,
  getSystemHealth,
  getSummaryReports,
  getAuditLogs,
  initiateBackup,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Routes
router.get('/dashboard', getDashboardStats);
router.get('/system-health', getSystemHealth);
router.get('/reports/summary', getSummaryReports);
router.get('/audit-logs', getAuditLogs);
router.post('/backup', initiateBackup);
router.route('/settings')
  .get(getSystemSettings)
  .put(updateSystemSettings);

export default router;
