// ============================================
// Notification Controller
// Handles in-app alerts, unread counts, and status updates
// ============================================

const prisma = require('../utils/prisma');
const cache = require('../utils/cache');

/**
 * GET /api/notifications
 * Query params: ?unreadOnly=true&limit=20
 */
const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit = 30 } = req.query;
    const userId = req.user.id;
    const cacheKey = `notif_${userId}_${unreadOnly || 'all'}_${limit}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const where = { userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    const result = {
      success: true,
      data: notifications,
      unreadCount,
    };

    cache.set(cacheKey, result, 15); // 15s cache
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark single notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    cache.invalidate(`notif_${userId}`);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark all user notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    cache.invalidate(`notif_${userId}`);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
