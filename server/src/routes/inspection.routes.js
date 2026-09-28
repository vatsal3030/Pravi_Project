// ============================================
// Inspection Routes
// ============================================

const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getInspections, createInspection, getInspectionById, deleteInspection,
} = require('../controllers/inspection.controller');

const router = Router();
router.use(authenticate);

router.get('/', getInspections);
router.get('/:id', getInspectionById);
router.post('/', authorize('ADMIN', 'INSPECTOR'), createInspection);
router.delete('/:id', deleteInspection);

module.exports = router;
