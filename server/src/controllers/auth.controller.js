// ============================================
// Auth Controller — Register, Login, Refresh
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');

/**
 * Generate access + refresh token pair
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, tokenId: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error('Email already registered.');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'VIEWER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        totalPoints: true,
        currentLevel: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated. Contact an administrator.');
      error.statusCode = 403;
      throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          totalPoints: user.totalPoints,
          currentLevel: user.currentLevel,
          currentStreak: user.currentStreak,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const error = new Error('Refresh token required.');
      error.statusCode = 400;
      throw error;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      const error = new Error('Invalid or expired refresh token.');
      error.statusCode = 401;
      throw error;
    }

    // Delete old refresh token safely
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    // Generate new tokens
    const tokens = generateTokens(decoded.userId);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      err.statusCode = 401;
      err.message = 'Invalid refresh token.';
    }
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        department: true,
        totalPoints: true,
        currentLevel: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refreshAccessToken, logout, getMe };
