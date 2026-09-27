const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

// GET /api/v1/docs - Returns full technical documentation for IT Engineers / Super Admin
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN'), (req, res) => {
  try {
    const docsDir = path.join(__dirname, '../../../docs');
    const rootDir = path.join(__dirname, '../../..');

    const readFileSafe = (filePath) => {
      try {
        return fs.readFileSync(filePath, 'utf8');
      } catch (e) {
        return null;
      }
    };

    const docsData = {
      system_overview: {
        title: 'BenPayu.com Platform Architecture & Tech Stack',
        runtime: 'Node.js (v18+), Express.js REST Framework',
        frontend: 'HTML5, Glassmorphism CSS System, Vanilla JS Async Engine',
        database: 'PostgreSQL Compatible Schema (Knex / DDL SQL)',
        authentication: 'JWT (JSON Web Tokens) + RBAC / ABAC Middleware',
        total_modules: 13,
        modules_list: [
          'audit', 'auth', 'cashflow', 'copywriting', 'gmaps',
          'inventory', 'kit', 'landing', 'learning', 'loyalty',
          'pos', 'qris', 'services'
        ]
      },
      files: {
        architecture: readFileSafe(path.join(docsDir, 'ARCHITECTURE.md')),
        modules_api: readFileSafe(path.join(docsDir, 'MODULES_API.md')),
        migrations_sql: readFileSafe(path.join(docsDir, 'MIGRATIONS.md')),
        rbac_matrix: readFileSafe(path.join(docsDir, 'RBAC_MATRIX.md')),
        user_flows: readFileSafe(path.join(docsDir, 'USER_FLOWS.md')),
        user_flow_spec: readFileSafe(path.join(rootDir, 'USER_FLOW_SPEC.md')),
        readme: readFileSafe(path.join(rootDir, 'README.md'))
      }
    };

    return res.json({
      success: true,
      message: 'Dokumentasi Sistem IT berhasil dimuat.',
      data: docsData
    });
  } catch (err) {
    console.error('Fetch docs error:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat berkas dokumentasi sistem' });
  }
});

module.exports = router;
