import jwt from 'jsonwebtoken';
import User from '../models/User.pg.js';

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user is active
      if (req.user.status !== 'active') {
        return res.status(401).json({
          success: false,
          error: 'Account is not active'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};

/**
 * Check if user can access patient data
 */
export const canAccessPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const user = req.user;

    // Admins can access all patient data
    if (user.role === 'admin') {
      return next();
    }

    // Patients can only access their own data
    if (user.role === 'patient') {
      if (user._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this patient data'
        });
      }
    }

    // Healthcare providers can access patient data they're assigned to
    if (['doctor', 'nurse', 'pharmacist', 'receptionist'].includes(user.role)) {
      // For now, allow all healthcare providers to access patient data
      // In a real system, you'd check assignments/permissions
      return next();
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error in authorization check'
    });
  }
};
