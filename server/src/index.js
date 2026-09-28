// ============================================
// InfraVault — Express Server Entry Point
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const assetRoutes = require('./routes/asset.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const workorderRoutes = require('./routes/workorder.routes');
const inspectionRoutes = require('./routes/inspection.routes');
const notificationRoutes = require('./routes/notification.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Parsing ──────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging ─────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health Check ────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'InfraVault API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ──────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/work-orders', workorderRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Error Handling ──────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   🏗️  InfraVault API Server              ║
  ║   📡 Running on port ${PORT}                ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}        ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
