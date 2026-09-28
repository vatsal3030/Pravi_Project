// ============================================
// Auth Routes
// ============================================

const { Router } = require('express');
const { register, login, refreshAccessToken, logout, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;
