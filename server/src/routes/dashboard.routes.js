// ============================================
// Dashboard Routes
// ============================================

const { Router } = require('express');
const { getStats, getTrends, getLeaderboard } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/stats', getStats);
router.get('/trends', getTrends);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
