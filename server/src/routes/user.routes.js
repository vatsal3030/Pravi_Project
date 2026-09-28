// ============================================
// User Routes
// ============================================

const { Router } = require('express');
const { getUsers, updateUser, getUserById } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), getUsers);

// Self Profile routes (must come before /:id)
router.get('/me', (req, res, next) => {
  req.params.id = req.user.id;
  return getUserById(req, res, next);
});

router.put('/profile', (req, res, next) => {
  req.params.id = req.user.id;
  return updateUser(req, res, next);
});

router.get('/:id', getUserById);
router.put('/:id', updateUser);

module.exports = router;
