// ============================================
// Work Order Controller — CRUD + Assignment
// ============================================

const prisma = require('../utils/prisma');
const { randomBytes } = require('crypto');
const cache = require('../utils/cache');

const generateWOCode = () => {
  const num = randomBytes(2).readUInt16BE(0) % 10000;
  return `WO-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`;
};

// GET /api/work-orders
const getWorkOrders = async (req, res, next) => {
  try {
    const { search, status, priority, assetId, page = 1, limit = 50 } = req.query;
    const where = { deletedAt: null };
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { orderCode: { contains: search, mode: 'insensitive' } },
    ];
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assetId) where.assetId = assetId;

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        include: {
          asset: { select: { id: true, name: true, assetCode: true, category: true, address: true, latitude: true, longitude: true, conditionRating: true, conditionScore: true } },
          createdBy: { select: { id: true, name: true, avatar: true, role: true } },
          assignee: { select: { id: true, name: true, avatar: true, role: true, department: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.workOrder.count({ where }),
    ]);

    // Normalize field names for frontend
    const normalized = workOrders.map(wo => ({
      ...wo,
      assignedTo: wo.assignee,
    }));

    res.json({ success: true, data: normalized, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// GET /api/work-orders/:id
const getWorkOrderById = async (req, res, next) => {
  try {
    const wo = await prisma.workOrder.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetCode: true,
            category: true,
            address: true,
            latitude: true,
            longitude: true,
            conditionRating: true,
            conditionScore: true,
            criticality: true,
            status: true,
            ward: true,
            zone: true,
          },
        },
        createdBy: { select: { id: true, name: true, email: true, avatar: true, role: true, department: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true, role: true, department: true, totalPoints: true, currentLevel: true } },
      },
    });
    if (!wo) return res.status(404).json({ success: false, error: { message: 'Work order not found' } });
    res.json({ success: true, data: { ...wo, assignedTo: wo.assignee } });
  } catch (err) { next(err); }
};

// POST /api/work-orders
const createWorkOrder = async (req, res, next) => {
  try {
    const { title, description, priority, assetId, assignedToId, dueDate, estimatedCost } = req.body;

    if (!assignedToId) {
      return res.status(400).json({
        success: false,
        error: { message: 'A valid assigned engineer/inspector is mandatory for work order dispatch.' },
      });
    }

    // Verify assigned user exists
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true, name: true, role: true },
    });
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'Assigned personnel was not found in the department directory.' },
      });
    }

    const data = {
      orderCode: generateWOCode(),
      title,
      description: description || title,
      priority: priority || 'MEDIUM',
      asset: { connect: { id: assetId } },
      createdBy: { connect: { id: req.user.id } },
      assignee: { connect: { id: assignedToId } },
    };

    if (dueDate) data.dueDate = new Date(dueDate);
    if (estimatedCost) data.estimatedCost = parseFloat(estimatedCost);

    const wo = await prisma.workOrder.create({
      data,
      include: {
        asset: { select: { id: true, name: true, assetCode: true, category: true } },
        assignee: { select: { id: true, name: true, email: true, role: true, department: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id, action: 'created_work_order', entityType: 'WorkOrder',
        entityId: wo.id, details: { title: wo.title, priority: wo.priority, assignedTo: assignedUser.name },
      },
    });

    // Notify assigned user
    if (assignedToId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          type: 'WORK_ORDER_ASSIGNED',
          title: 'New Work Order Assigned',
          message: `You were assigned work order ${wo.orderCode}: ${wo.title}`,
          link: `/work-orders/${wo.id}`,
        },
      });
    }

    cache.invalidate('dashboard_');

    res.status(201).json({ success: true, data: { ...wo, assignedTo: wo.assignee } });
  } catch (err) { next(err); }
};

// PUT /api/work-orders/:id
const updateWorkOrder = async (req, res, next) => {
  try {
    const existing = await prisma.workOrder.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Work order not found' } });
    }

    // RBAC: Admins, creator, or assigned engineer can update
    if (req.user.role !== 'ADMIN' && existing.createdById !== req.user.id && existing.assigneeId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Permission denied: Only the creator, assigned engineer, or an Administrator can modify this work order.' } });
    }

    const { status, priority, assignedToId, notes, actualCost, completedAt } = req.body;
    const data = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assignedToId) data.assignee = { connect: { id: assignedToId } };
    if (notes) data.notes = notes;
    if (actualCost) data.actualCost = parseFloat(actualCost);
    if (completedAt) data.completedAt = new Date(completedAt);
    if (status === 'COMPLETED' && !completedAt) data.completedAt = new Date();
    if (status === 'IN_PROGRESS' && !existing.startedAt) data.startedAt = new Date();

    const wo = await prisma.workOrder.update({
      where: { id: req.params.id },
      data,
      include: {
        asset: { select: { id: true, name: true, assetCode: true, category: true, address: true, latitude: true, longitude: true, conditionRating: true, conditionScore: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true, role: true, department: true, totalPoints: true, currentLevel: true } },
      },
    });

    if (status === 'COMPLETED' && wo.assigneeId) {
      await prisma.user.update({ where: { id: wo.assigneeId }, data: { totalPoints: { increment: 50 } } });
      await prisma.gamificationEvent.create({
        data: { userId: wo.assigneeId, action: 'WORK_ORDER_COMPLETED', points: 50, metadata: { orderCode: wo.orderCode } },
      });
      // Notify creator
      if (wo.createdById && wo.createdById !== req.user.id) {
        await prisma.notification.create({
          data: {
            userId: wo.createdById,
            type: 'WORK_ORDER_COMPLETED',
            title: 'Work Order Completed',
            message: `Work order ${wo.orderCode} (${wo.title}) was marked as completed.`,
            link: '/work-orders',
          },
        });
      }
    }

    cache.invalidate('dashboard_');

    res.json({ success: true, data: { ...wo, assignedTo: wo.assignee } });
  } catch (err) { next(err); }
};

// DELETE /api/work-orders/:id
// Soft delete & creator/admin check
const deleteWorkOrder = async (req, res, next) => {
  try {
    const existing = await prisma.workOrder.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Work order not found' } });
    }

    if (req.user.role !== 'ADMIN' && existing.createdById !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Permission denied: Only the creator or an Administrator can delete this work order.' } });
    }

    await prisma.workOrder.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    cache.invalidate('dashboard_');

    res.json({ success: true, message: 'Work order soft-deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { getWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, deleteWorkOrder };
