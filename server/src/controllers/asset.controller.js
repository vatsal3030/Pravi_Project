// ============================================
// Asset Controller — Full CRUD + Lifecycle
// ============================================

const prisma = require('../utils/prisma');
const { v4: uuidv4 } = require('uuid');
const cache = require('../utils/cache');

// Asset code prefix mapping for RnB domain
const CATEGORY_PREFIX = {
  ROAD: 'RD',
  BRIDGE: 'BR',
  BUILDING: 'BL',
  STREETLIGHT: 'SL',
  WATER_PIPELINE: 'WP',
  DRAIN: 'DR',
  FOOTPATH: 'FP',
};

/**
 * Generate unique asset code: RD-2024-0001
 */
const generateAssetCode = async (category) => {
  const prefix = CATEGORY_PREFIX[category];
  const year = new Date().getFullYear();
  const count = await prisma.asset.count({
    where: {
      category,
      assetCode: { startsWith: `${prefix}-${year}` },
    },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * POST /api/assets
 */
const createAsset = async (req, res, next) => {
  try {
    const {
      name, description, category, status,
      latitude, longitude, address, ward, zone,
      purchaseCost, installCost, criticality,
      installDate, expectedEOL, metadata, images,
    } = req.body;

    const assetCode = await generateAssetCode(category);

    const asset = await prisma.asset.create({
      data: {
        assetCode,
        name,
        description,
        category,
        status: status || 'PLANNED',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
        ward,
        zone,
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : 0,
        installCost: installCost ? parseFloat(installCost) : 0,
        currentValue: purchaseCost ? parseFloat(purchaseCost) : 0,
        criticality: criticality ? parseInt(criticality) : 3,
        installDate: installDate ? new Date(installDate) : null,
        expectedEOL: expectedEOL ? new Date(expectedEOL) : null,
        metadata: metadata || {},
        images: images || [],
        createdById: req.user.id,
      },
    });

    // Log lifecycle event
    await prisma.assetLifecycleEvent.create({
      data: {
        assetId: asset.id,
        toStatus: asset.status,
        notes: 'Asset created',
        changedBy: req.user.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'created_asset',
        entityType: 'Asset',
        entityId: asset.id,
        details: { assetCode, name, category },
      },
    });

    cache.invalidate('dashboard_');
    cache.invalidate('map_');

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/assets
 * Supports: ?category=ROAD&status=ACTIVE&search=main&page=1&limit=20&sortBy=createdAt&sortOrder=desc
 */
const getAssets = async (req, res, next) => {
  try {
    const {
      category, status, conditionRating, ward, zone,
      search, page = 1, limit = 20,
      sortBy = 'createdAt', sortOrder = 'desc',
      minRisk, maxRisk,
    } = req.query;

    const where = {
      deletedAt: null,
    };

    if (category) where.category = category;
    if (status) where.status = status;
    if (conditionRating) where.conditionRating = conditionRating;
    if (ward) where.ward = ward;
    if (zone) where.zone = zone;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minRisk || maxRisk) {
      where.riskScore = {};
      if (minRisk) where.riskScore.gte = parseFloat(minRisk);
      if (maxRisk) where.riskScore.lte = parseFloat(maxRisk);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: {
              workOrders: true,
              inspections: true,
            },
          },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    res.json({
      success: true,
      data: assets,
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
 * GET /api/assets/:id
 */
const getAssetById = async (req, res, next) => {
  try {
    const cacheKey = `asset_detail_${req.params.id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const asset = await prisma.asset.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        lifecycleEvents: {
          orderBy: { changedAt: 'desc' },
          take: 20,
        },
        workOrders: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
          },
        },
        inspections: {
          where: { deletedAt: null },
          orderBy: { inspectedAt: 'desc' },
          take: 10,
          include: {
            inspector: { select: { id: true, name: true, avatar: true } },
          },
        },
        maintenanceRecords: {
          orderBy: { performedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            workOrders: true,
            inspections: true,
            maintenanceRecords: true,
          },
        },
      },
    });

    if (!asset) {
      const error = new Error('Asset not found.');
      error.statusCode = 404;
      throw error;
    }

    cache.set(cacheKey, asset, 30);
    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/assets/:id
 * Enforces ownership: only creator or ADMIN can update
 */
const updateAsset = async (req, res, next) => {
  try {
    const existing = await prisma.asset.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      const error = new Error('Asset not found.');
      error.statusCode = 404;
      throw error;
    }

    // RBAC & Ownership: Creator or ADMIN only
    if (req.user.role !== 'ADMIN' && existing.createdById !== req.user.id) {
      const error = new Error('Permission denied: Only the creator or an Administrator can modify this asset.');
      error.statusCode = 403;
      throw error;
    }

    const updateData = { ...req.body };

    // Parse numeric fields
    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);
    if (updateData.purchaseCost) updateData.purchaseCost = parseFloat(updateData.purchaseCost);
    if (updateData.installCost) updateData.installCost = parseFloat(updateData.installCost);
    if (updateData.criticality) updateData.criticality = parseInt(updateData.criticality);
    if (updateData.conditionScore) updateData.conditionScore = parseInt(updateData.conditionScore);

    // Parse date fields
    if (updateData.installDate) updateData.installDate = new Date(updateData.installDate);
    if (updateData.expectedEOL) updateData.expectedEOL = new Date(updateData.expectedEOL);
    if (updateData.plannedDate) updateData.plannedDate = new Date(updateData.plannedDate);
    if (updateData.procuredDate) updateData.procuredDate = new Date(updateData.procuredDate);
    if (updateData.commissionDate) updateData.commissionDate = new Date(updateData.commissionDate);

    // Don't allow changing immutable fields
    delete updateData.assetCode;
    delete updateData.category;
    delete updateData.createdById;
    delete updateData.deletedAt;

    // Track status change
    if (updateData.status && updateData.status !== existing.status) {
      await prisma.assetLifecycleEvent.create({
        data: {
          assetId: existing.id,
          fromStatus: existing.status,
          toStatus: updateData.status,
          notes: updateData.statusChangeNotes || `Status changed to ${updateData.status}`,
          changedBy: req.user.id,
        },
      });
      delete updateData.statusChangeNotes;
    }

    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: updateData,
    });

    cache.invalidate('dashboard_');
    cache.invalidate('map_');
    cache.invalidate(`asset_detail_${req.params.id}`);

    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/assets/:id
 * Soft delete: sets deletedAt = new Date()
 * Enforces ownership: only creator or ADMIN can delete
 */
const deleteAsset = async (req, res, next) => {
  try {
    const existing = await prisma.asset.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      const error = new Error('Asset not found.');
      error.statusCode = 404;
      throw error;
    }

    // RBAC & Ownership: Creator or ADMIN only
    if (req.user.role !== 'ADMIN' && existing.createdById !== req.user.id) {
      const error = new Error('Permission denied: Only the creator or an Administrator can delete this asset.');
      error.statusCode = 403;
      throw error;
    }

    // Soft delete
    await prisma.asset.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    cache.invalidate('dashboard_');
    cache.invalidate('map_');
    cache.invalidate(`asset_detail_${req.params.id}`);

    res.json({ success: true, message: 'Asset successfully soft-deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/assets/map/all
 * Returns lightweight active asset data for map rendering
 */
const getAssetsForMap = async (req, res, next) => {
  try {
    const { category, status, conditionRating } = req.query;
    const cacheKey = `map_${category || 'all'}_${status || 'all'}_${conditionRating || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const where = {
      deletedAt: null,
      latitude: { not: null },
      longitude: { not: null },
    };

    if (category) where.category = category;
    if (status) where.status = status;
    if (conditionRating) where.conditionRating = conditionRating;

    const assets = await prisma.asset.findMany({
      where,
      select: {
        id: true,
        assetCode: true,
        name: true,
        category: true,
        status: true,
        conditionRating: true,
        conditionScore: true,
        riskScore: true,
        latitude: true,
        longitude: true,
        criticality: true,
        zone: true,
        ward: true,
        address: true,
        purchaseCost: true,
        currentValue: true,
        installDate: true,
        metadata: true,
        createdBy: { select: { name: true, role: true } },
        workOrders: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, deletedAt: null },
          select: { id: true, orderCode: true, title: true, priority: true },
        },
        inspections: {
          orderBy: { inspectedAt: 'desc' },
          take: 1,
          select: { inspectedAt: true, conditionRating: true, conditionScore: true },
        },
      },
    });

    // Invalidate map caches to ensure fresh data delivery
    cache.set(cacheKey, assets, 30); // 30s TTL
    res.json({ success: true, data: assets });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/assets/:id/lifecycle
 * Record an explicit lifecycle audit transition event
 */
const recordLifecycleEvent = async (req, res, next) => {
  try {
    const { toStatus, notes } = req.body;
    if (!toStatus && !notes) {
      return res.status(400).json({ success: false, error: { message: 'Status or notes is required.' } });
    }

    const asset = await prisma.asset.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!asset) return res.status(404).json({ success: false, error: { message: 'Asset not found' } });

    const fromStatus = asset.status;
    const finalToStatus = toStatus || asset.status;

    const [newEvent, updatedAsset] = await prisma.$transaction([
      prisma.assetLifecycleEvent.create({
        data: {
          assetId: asset.id,
          fromStatus,
          toStatus: finalToStatus,
          notes: notes || `Lifecycle status updated to ${finalToStatus}`,
          changedBy: req.user.id,
        },
      }),
      prisma.asset.update({
        where: { id: asset.id },
        data: { status: finalToStatus },
      }),
    ]);

    cache.invalidate('dashboard_');
    cache.invalidate('map_');
    cache.invalidate(`asset_detail_${asset.id}`);

    res.json({ success: true, data: { event: newEvent, asset: updatedAsset } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetsForMap,
  recordLifecycleEvent,
};

