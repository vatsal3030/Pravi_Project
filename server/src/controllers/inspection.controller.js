// ============================================
// Inspection Controller — CRUD + Scoring
// ============================================

const prisma = require('../utils/prisma');
const { randomBytes } = require('crypto');

const ratingFromScore = (score) => {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  if (score >= 20) return 'POOR';
  return 'CRITICAL';
};

const generateInsCode = () => {
  const num = randomBytes(2).readUInt16BE(0) % 10000;
  return `INS-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`;
};

// GET /api/inspections
const getInspections = async (req, res, next) => {
  try {
    const { assetId, inspectorId, page = 1, limit = 50 } = req.query;
    const where = { deletedAt: null };
    if (assetId) where.assetId = assetId;
    if (inspectorId) where.inspectorId = inspectorId;

    const [inspections, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        include: {
          asset: { select: { id: true, name: true, assetCode: true, category: true } },
          inspector: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { inspectedAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.inspection.count({ where }),
    ]);

    res.json({ success: true, data: inspections, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// POST /api/inspections
const createInspection = async (req, res, next) => {
  try {
    const { assetId, conditionScore, notes, findings, photos } = req.body;
    const score = parseInt(conditionScore);
    const conditionRating = ratingFromScore(score);

    const inspection = await prisma.inspection.create({
      data: {
        inspectionCode: generateInsCode(),
        asset: { connect: { id: assetId } },
        inspector: { connect: { id: req.user.id } },
        conditionScore: score,
        conditionRating,
        notes: notes || '',
        findings: findings || {},
        photos: photos || [],
      },
      include: {
        asset: { select: { id: true, name: true, assetCode: true } },
        inspector: { select: { id: true, name: true } },
      },
    });

    // Update asset condition
    await prisma.asset.update({
      where: { id: assetId },
      data: { conditionScore: score, conditionRating },
    });

    // Gamification: points + streak
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const lastIns = await prisma.inspection.findFirst({
      where: { inspectorId: req.user.id, id: { not: inspection.id } },
      orderBy: { inspectedAt: 'desc' },
    });

    let streakBonus = 0;
    if (lastIns) {
      const daysSince = Math.floor((Date.now() - new Date(lastIns.inspectedAt).getTime()) / 86400000);
      if (daysSince <= 1) {
        const newStreak = (user.currentStreak || 0) + 1;
        streakBonus = newStreak >= 7 ? 25 : newStreak >= 3 ? 10 : 0;
        await prisma.user.update({ where: { id: req.user.id }, data: { currentStreak: newStreak, longestStreak: Math.max(newStreak, user.longestStreak || 0) } });
      } else {
        await prisma.user.update({ where: { id: req.user.id }, data: { currentStreak: 1 } });
      }
    }

    const totalPoints = 30 + streakBonus;
    await prisma.user.update({ where: { id: req.user.id }, data: { totalPoints: { increment: totalPoints } } });
    await prisma.gamificationEvent.create({
      data: { userId: req.user.id, action: 'INSPECTION_COMPLETED', points: totalPoints, metadata: { assetCode: inspection.asset.assetCode, conditionScore: score, streakBonus } },
    });
    await prisma.activityLog.create({
      data: { userId: req.user.id, action: 'completed_inspection', entityType: 'Inspection', entityId: inspection.id, details: { assetName: inspection.asset.name, conditionScore: score } },
    });

    res.status(201).json({ success: true, data: { ...inspection, pointsEarned: totalPoints, streakBonus } });
  } catch (err) { next(err); }
};

// GET /api/inspections/:id
const getInspectionById = async (req, res, next) => {
  try {
    const inspection = await prisma.inspection.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        asset: { select: { id: true, name: true, assetCode: true, category: true } },
        inspector: { select: { id: true, name: true, avatar: true } },
      },
    });
    if (!inspection) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ success: true, data: inspection });
  } catch (err) { next(err); }
};

// DELETE /api/inspections/:id
// Soft delete & inspector/admin check
const deleteInspection = async (req, res, next) => {
  try {
    const existing = await prisma.inspection.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Inspection not found' } });
    }

    if (req.user.role !== 'ADMIN' && existing.inspectorId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Permission denied: Only the inspector or an Administrator can delete this inspection.' } });
    }

    await prisma.inspection.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, message: 'Inspection soft-deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { getInspections, createInspection, getInspectionById, deleteInspection };
