// ============================================
// Asset Routes
// ============================================

const { Router } = require('express');
const {
  createAsset, getAssets, getAssetById,
  updateAsset, deleteAsset, getAssetsForMap,
  recordLifecycleEvent,
} = require('../controllers/asset.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = Router();

// All asset routes require authentication
router.use(authenticate);

// Map data endpoint (lightweight, before :id to avoid conflict)
router.get('/map/all', getAssetsForMap);

// CRUD
router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', authorize('ADMIN', 'INSPECTOR'), createAsset);
router.put('/:id', authorize('ADMIN', 'INSPECTOR'), updateAsset);
router.delete('/:id', authorize('ADMIN'), deleteAsset);
router.post('/:id/lifecycle', authorize('ADMIN', 'INSPECTOR'), recordLifecycleEvent);

module.exports = router;
