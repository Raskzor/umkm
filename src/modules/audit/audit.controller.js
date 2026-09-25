const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

// Execute AI-Powered Business Health Check Evaluation
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
    breakdown.push({ item: 'Google Maps Profil Diklaim', points: 15, max: 15 });
  } else {
    recommendations.push({
      id: 'rec-gmaps-claim',
      text: 'Klaim & verifikasi lokasi usaha Anda di Google Maps untuk meningkatkan visibilitas di area sekitar.',
      target_course_id: 'tut-001',
      course_title: 'Cara Klaim & Verifikasi Google Maps Tempat Usaha',
      category: 'Google Maps Optimization'
    });
  }

  if (gmaps_rating >= 4.5) {
    score += 10;
    breakdown.push({ item: 'Rating Pelanggan Bintang 5 (>=4.5)', points: 10, max: 10 });
  } else if (gmaps_rating >= 4.0) {
    score += 5;
    breakdown.push({ item: 'Rating Pelanggan Cukup (>=4.0)', points: 5, max: 10 });
  } else {
    recommendations.push({
      id: 'rec-rating-boost',
      text: 'Tingkatkan rating Google Maps dengan mencetak QR Standee ulasan dan memberikan respons ramah AI.',
      target_course_id: 'tut-002',
      course_title: 'Trik Mendapatkan 100+ Bintang 5 Review Pelanggan',
      category: 'Review Management'
    });
  }

  if (review_count >= 20) {
    score += 10;
    breakdown.push({ item: 'Jumlah Review Pelanggan (>=20)', points: 10, max: 10 });
  } else {
    recommendations.push({
      id: 'rec-review-count',
      text: 'Kejar target minimal 20 review pertama menggunakan Standee Akrilik QR Code di meja kasir.',
      target_course_id: 'tut-002',
      course_title: 'Trik Mendapatkan 100+ Bintang 5 Review Pelanggan',
      category: 'Review Management'
    });
  }

  // 2. Web Catalog & Landing Page Check (Max 25 pts)
  if (has_website_or_catalog) {
    score += 25;
    breakdown.push({ item: 'Landing Page / Mini Katalog Aktif', points: 25, max: 25 });
  } else {
    recommendations.push({
      id: 'rec-landing-build',
      text: 'Terbitkan Website Sementara & Mini Catalog instan dalam 3 menit di fitur Builder.',
      target_course_id: 'tut-003',
      course_title: 'Masterclass WhatsApp Automation & Landing Page High Conversion',
      category: 'Digital Marketing'
    });
  }

  // 3. Digital Presence & Content (Max 40 pts)
  if (has_whatsapp_business) {
    score += 15;
    breakdown.push({ item: 'WhatsApp Business Hook Built-in', points: 15, max: 15 });
  } else {
    recommendations.push({
      id: 'rec-wa-business',
      text: 'Aktifkan WhatsApp Business resmi agar pembeli dari katalog web bisa langsung memesan instan.',
      target_course_id: 'tut-003',
      course_title: 'Masterclass WhatsApp Automation & Landing Page High Conversion',
      category: 'Digital Marketing'
    });
  }

  if (photos_count >= 10) {
    score += 15;
    breakdown.push({ item: 'Foto Produk & Lokasi Lengkap (>=10)', points: 15, max: 15 });
  } else {
    recommendations.push({
      id: 'rec-photos-upload',
      text: 'Unggah foto produk & suasana tempat usaha berkualitas tinggi untuk menarik kepercayaan calon pembeli.',
      target_course_id: 'tut-004',
      course_title: 'Strategi Ads Lokal Radius 3KM untuk Kafe & Retail',
      category: 'Local Advertising'
    });
  }

  if (weekly_post_updates) {
    score += 10;
    breakdown.push({ item: 'Pembaruan Promo Mingguan', points: 10, max: 10 });
  } else {
    recommendations.push({
      id: 'rec-weekly-updates',
      text: 'Perbarui postingan promo/update terbaru di Google Business Profile setidaknya seminggu sekali.',
      target_course_id: 'tut-004',
      course_title: 'Strategi Ads Lokal Radius 3KM untuk Kafe & Retail',
      category: 'Local Advertising'
    });
  }

  // Generate AI Diagnosis Text Summary based on Score & Answers
  let aiDiagnosisSummary = '';
  let statusGrade = 'EXCELLENT';

  if (score >= 80) {
    statusGrade = 'EXCELLENT';
    aiDiagnosisSummary = `🤖 Analisis AI SuperUMKM: Usaha Anda memiliki fondasi digital yang SANGAT KUAT (Skor: ${score}/100). Visibilitas Google Maps dan aset katalog web Anda sudah optimal untuk mendorong konversi penjualan.`;
  } else if (score >= 50) {
    statusGrade = 'NEEDS_OPTIMIZATION';
    aiDiagnosisSummary = `🤖 Analisis AI SuperUMKM: Usaha Anda berada di tingkat BERKEMBANG (Skor: ${score}/100). Potensi pelanggan lokal sangat besar, namun Anda memerlukan penguatan di ulasan Google Maps dan penerbitan Katalog WA.`;
  } else {
    statusGrade = 'CRITICAL';
    aiDiagnosisSummary = `🤖 Analisis AI SuperUMKM: Usaha Anda berstatus KRITIS DIGITAL (Skor: ${score}/100). Banyak calon pembeli kesulitan menemukan lokasi & katalog produk Anda di internet. Ikuti rekomendasi aksi cepat di bawah ini.`;
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
    ai_diagnosis_summary: aiDiagnosisSummary,
    created_at: new Date().toISOString()
  };

  db.auditLogs.push(auditEntry);

  return res.json({
    success: true,
    data: {
      health_score: score,
      status_grade: statusGrade,
      ai_diagnosis_summary: aiDiagnosisSummary,
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
