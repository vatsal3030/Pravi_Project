// ============================================
// JWT Authentication Middleware
// ============================================

const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Access denied. No token provided.');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatar: true,
        totalPoints: true,
        currentLevel: true,
        currentStreak: true,
      },
    });

    if (!user || !user.isActive) {
      const error = new Error('User not found or inactive.');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      err.statusCode = 401;
      err.message = 'Invalid token.';
    }
    if (err.name === 'TokenExpiredError') {
      err.statusCode = 401;
      err.message = 'Token expired.';
    }
    next(err);
  }
};

/**
 * Role-based access control
 * Usage: authorize('ADMIN', 'INSPECTOR')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error(`Access denied. Required roles: ${roles.join(', ')}`);
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

module.exports = { authenticate, authorize };
