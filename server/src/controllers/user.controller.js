// ============================================
// User Controller — Profile & Management
// ============================================

const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

/**
 * GET /api/users
 * Admin only — list all users
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          department: true,
          isActive: true,
          totalPoints: true,
          currentLevel: true,
          lastLoginAt: true,
          currentStreak: true,
          longestStreak: true,
          createdAt: true,
          _count: {
            select: {
              inspections: true,
              assignedWorkOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, department, avatar, role, isActive } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Only admins can change roles and active status
    if (req.user.role === 'ADMIN') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        department: true,
        isActive: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 * Public Officer Profile view
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        department: true,
        isActive: true,
        totalPoints: true,
        currentLevel: true,
        currentStreak: true,
        longestStreak: true,
        lastLoginAt: true,
        createdAt: true,
        badges: {
          include: {
            badge: true,
          },
        },
        assignedWorkOrders: {
          where: { deletedAt: null },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderCode: true,
            title: true,
            priority: true,
            status: true,
            dueDate: true,
          },
        },
        _count: {
          select: {
            inspections: true,
            assignedWorkOrders: true,
            createdAssets: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, updateUser, getUserById };

