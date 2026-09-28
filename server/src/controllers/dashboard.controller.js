// ============================================
// Dashboard Controller — Analytics & KPIs
// ============================================

const prisma = require('../utils/prisma');
const cache = require('../utils/cache');

/**
 * GET /api/dashboard/stats
 * Returns high-level KPI stats for the dashboard
 */
const getStats = async (req, res, next) => {
  try {
    const cached = cache.get('dashboard_stats');
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const [
      totalAssets,
      activeAssets,
      criticalAssets,
      openWorkOrders,
      pendingInspections,
      totalMaintenanceCost,
      assetsByCategory,
      assetsByStatus,
      assetsByCondition,
      recentActivity,
      totalValue,
    ] = await Promise.all([
      // Total assets
      prisma.asset.count(),

      // Active assets
      prisma.asset.count({ where: { status: 'ACTIVE' } }),

      // Critical condition assets
      prisma.asset.count({ where: { conditionRating: 'CRITICAL' } }),

      // Open work orders
      prisma.workOrder.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),

      // Inspections count this month
      prisma.inspection.count({
        where: {
          inspectedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Total maintenance cost
      prisma.asset.aggregate({
        _sum: { totalMaintCost: true },
      }),

      // Assets by category
      prisma.asset.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),

      // Assets by status
      prisma.asset.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      // Assets by condition
      prisma.asset.groupBy({
        by: ['conditionRating'],
        _count: { _all: true },
      }),

      // Recent activity
      prisma.activityLog.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),

      // Calculate total asset value in parallel
      prisma.asset.aggregate({
        _sum: { currentValue: true, purchaseCost: true },
      }),
    ]);

    const result = {
      kpis: {
        totalAssets,
        activeAssets,
        criticalAssets,
        openWorkOrders,
        inspectionsThisMonth: pendingInspections,
        totalMaintenanceCost: totalMaintenanceCost._sum.totalMaintCost || 0,
        totalAssetValue: totalValue._sum.currentValue || 0,
        totalPurchaseCost: totalValue._sum.purchaseCost || 0,
      },
      charts: {
        assetsByCategory: assetsByCategory.map(item => ({
          name: item.category,
          value: item._count._all,
        })),
        assetsByStatus: assetsByStatus.map(item => ({
          name: item.status,
          value: item._count._all,
        })),
        assetsByCondition: assetsByCondition.map(item => ({
          name: item.conditionRating,
          value: item._count._all,
        })),
      },
      recentActivity,
    };

    cache.set('dashboard_stats', result, 20); // 20s TTL
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/trends
 * Returns monthly trends for the past 12 months
 */
const getTrends = async (req, res, next) => {
  try {
    const cached = cache.get('dashboard_trends');
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Fetch all 3 trend datasets in parallel
    const [assets, workOrders, inspections] = await Promise.all([
      prisma.asset.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true, category: true },
      }),
      prisma.workOrder.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true, status: true },
      }),
      prisma.inspection.findMany({
        where: { inspectedAt: { gte: twelveMonthsAgo } },
        select: { inspectedAt: true },
      }),
    ]);

    // Aggregate by month
    const monthlyData = {};
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = {
        month: key,
        assetsCreated: 0,
        workOrdersCreated: 0,
        inspectionsCompleted: 0,
      };
    }

    assets.forEach(a => {
      const key = `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) monthlyData[key].assetsCreated++;
    });

    workOrders.forEach(wo => {
      const key = `${wo.createdAt.getFullYear()}-${String(wo.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) monthlyData[key].workOrdersCreated++;
    });

    inspections.forEach(ins => {
      const key = `${ins.inspectedAt.getFullYear()}-${String(ins.inspectedAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) monthlyData[key].inspectionsCompleted++;
    });

    const trends = Object.values(monthlyData).reverse();
    cache.set('dashboard_trends', trends, 30); // 30s TTL

    res.json({ success: true, data: trends });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/leaderboard
 * Gamification leaderboard
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const cached = cache.get('dashboard_leaderboard');
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        totalPoints: true,
        currentLevel: true,
        currentStreak: true,
        badges: {
          include: { badge: true },
        },
        _count: {
          select: {
            inspections: true,
            assignedWorkOrders: true,
          },
        },
      },
      orderBy: { totalPoints: 'desc' },
      take: 20,
    });

    cache.set('dashboard_leaderboard', users, 20);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getTrends, getLeaderboard };
