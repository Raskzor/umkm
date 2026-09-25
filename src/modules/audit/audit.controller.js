const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

// Execute Business Health Check Evaluation
router.post('/evaluate', authenticate, (req, res) => {
  const {
    has_gmaps_profile,
    gmaps_rating,
    review_count,
    has_website_or_catalog,
    has_whatsapp_business,
    photos_count,
    weekly_post_updates
  } = req.body;

  let score = 0;
  const breakdown = [];
  const recommendations = [];

  // 1. Google Maps Optimization Check (Max 35 pts)
  if (has_gmaps_profile) {
    score += 15;
    breakdown.push({ item: 'Google Maps Claimed', points: 15, max: 15 });
  } else {
    recommendations.push('Segera klaim & verifikasi lokasi usaha Anda di Google Maps untuk meningkatkan visibilitas lokal.');
  }

  if (gmaps_rating >= 4.5) {
    score += 10;
    breakdown.push({ item: 'Rating Pelanggan Tinggi (>=4.5)', points: 10, max: 10 });
  } else if (gmaps_rating >= 4.0) {
    score += 5;
    breakdown.push({ item: 'Rating Pelanggan Cukup (>=4.0)', points: 5, max: 10 });
  } else {
    recommendations.push('Tingkatkan rating Google Maps dengan mencetak QR Code Review untuk diberikan ke pelanggan.');
  }

  if (review_count >= 20) {
    score += 10;
    breakdown.push({ item: 'Jumlah Review Cukup (>=20)', points: 10, max: 10 });
  } else {
    recommendations.push('Ajak minimal 20 pelanggan pertama memberikan ulasan positif menggunakan QR Review Standee.');
  }

  // 2. Web Catalog & Landing Page Check (Max 25 pts)
  if (has_website_or_catalog) {
    score += 25;
    breakdown.push({ item: 'Landing Page / Mini Katalog Aktif', points: 25, max: 25 });
  } else {
    recommendations.push('Buat Landing Page / Mini Katalog gratis dalam 3 menit di fitur Landing Builder.');
  }

  // 3. Digital Presence & Content (Max 40 pts)
  if (has_whatsapp_business) {
    score += 15;
    breakdown.push({ item: 'WhatsApp Business Hook Built-in', points: 15, max: 15 });
  } else {
    recommendations.push('Gunakan WhatsApp Business agar calon pembeli dapat langsung memesan via tautan otomatis.');
  }

  if (photos_count >= 10) {
    score += 15;
    breakdown.push({ item: 'Foto Produk & Lokasi Lengkap (>=10)', points: 15, max: 15 });
  } else {
    recommendations.push('Unggah foto produk & suasana tempat usaha berkualitas minimal 10 foto.');
  }

  if (weekly_post_updates) {
    score += 10;
    breakdown.push({ item: 'Pembaruan Promo Mingguan', points: 10, max: 10 });
  } else {
    recommendations.push('Perbarui postingan promo/update terbaru di Google Business Profile setidaknya seminggu sekali.');
  }

  const business = db.businessProfiles.find(b => b.user_id === req.user.id);
  const auditEntry = {
    id: `audit-${Date.now()}`,
    user_id: req.user.id,
    business_id: business ? business.id : null,
    health_score: score,
    audit_answers: req.body,
    breakdown,
    recommendations,
    created_at: new Date().toISOString()
  };

  db.auditLogs.push(auditEntry);

  return res.json({
    success: true,
    data: {
      health_score: score,
      status_grade: score >= 80 ? 'EXCELLENT' : score >= 50 ? 'NEEDS_OPTIMIZATION' : 'CRITICAL',
      breakdown,
      recommendations,
      created_at: auditEntry.created_at
    }
  });
});

// Get User Audit History
router.get('/history', authenticate, (req, res) => {
  let userAudits = [];
  if (['SUPER_ADMIN', 'FIELD_AGENT'].includes(req.user.role_code)) {
    userAudits = db.auditLogs;
  } else {
    userAudits = db.auditLogs.filter(a => a.user_id === req.user.id);
  }

  return res.json({
    success: true,
    data: userAudits
  });
});

module.exports = router;
