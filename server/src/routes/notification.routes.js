// ============================================
// Notification Routes
// ============================================

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All notification routes require authentication
router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
