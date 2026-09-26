const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./modules/auth/auth.controller');
const auditRoutes = require('./modules/audit/audit.controller');
const gmapsRoutes = require('./modules/gmaps/gmaps.controller');
const landingRoutes = require('./modules/landing/landing.controller');
const learningRoutes = require('./modules/learning/learning.controller');
const servicesRoutes = require('./modules/services/services.controller');
const posRoutes = require('./modules/pos/pos.controller');
const kitRoutes = require('./modules/kit/kit.controller');
const cashflowRoutes = require('./modules/cashflow/cashflow.controller');
const loyaltyRoutes = require('./modules/loyalty/loyalty.controller');
const inventoryRoutes = require('./modules/inventory/inventory.controller');
const copywritingRoutes = require('./modules/copywriting/copywriting.controller');
const qrisRoutes = require('./modules/qris/qris.controller');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend dashboard
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/gmaps', gmapsRoutes);
app.use('/api/v1/landing', landingRoutes);
app.use('/api/v1/learning', learningRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/kit', kitRoutes);
app.use('/api/v1/cashflow', cashflowRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/copywriting', copywritingRoutes);
app.use('/api/v1/qris', qrisRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'Business Consultant UMKM Platform Engine', timestamp: new Date() });
});

// Root Route: Serve Main Product Landing Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Dashboard App Route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Start Server if launched directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 SuperUMKM Platform Server running on http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
