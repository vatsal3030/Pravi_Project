// ============================================
// Work Order Routes
// ============================================

const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, deleteWorkOrder,
} = require('../controllers/workorder.controller');

const router = Router();
router.use(authenticate);

router.get('/', getWorkOrders);
router.get('/:id', getWorkOrderById);
router.post('/', authorize('ADMIN', 'INSPECTOR'), createWorkOrder);
router.put('/:id', authorize('ADMIN', 'INSPECTOR'), updateWorkOrder);
router.delete('/:id', authorize('ADMIN'), deleteWorkOrder);

module.exports = router;
