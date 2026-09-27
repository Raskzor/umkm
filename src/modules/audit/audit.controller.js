const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');
const { generateBusinessAuditDiagnosis } = require('../../shared/utils/ai.service');

const { calculateNAPConsistency } = require('../../shared/utils/localSeoHelpers');

// Execute AI-Powered Business Health Check Evaluation (Deterministic 100-Point Engine)
router.post('/evaluate', authenticate, authorizeRoles('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'), async (req, res) => {
  const {
    has_gmaps_profile = false,
    gmaps_verified = false,
    gmaps_rating = 0,
    review_count = 0,
    photos_count = 0,
    has_physical_banner = false,
    has_website_or_catalog = false,
    has_whatsapp_business = false,
    has_product_prices = false,
    has_qris_payment = false,
    has_operational_hours = false,
    has_promo_program = false,
    has_social_media = false,
    local_phone = '',
    local_address = '',
    gmaps_phone = '',
    gmaps_address = ''
  } = req.body;

  let totalScore = 0;
  const breakdown = [];
  const recommendations = [];

  // Check NAP Consistency
  const napResult = calculateNAPConsistency({
    localPhone: local_phone || req.user.phone_number || '081234567890',
    localAddress: local_address || 'Jl. Melati No. 12',
    gmapsPhone: gmaps_phone || '081234567890',
    gmapsAddress: gmaps_address || 'Jl. Melati No. 12'
  });

  // 1. Google Business Presence (20%) - Max 20 Poin
  let gmapsEarned = 0;
  let gmapsGap = null;
  if (has_gmaps_profile) {
    gmapsEarned += 10;
    if (gmaps_verified) {
      gmapsEarned += 10;
    } else {
      gmapsGap = 'Titik lokasi Google Maps belum terverifikasi instan';
    }

    // NAP mismatch penalty (> 20% mismatch)
    if (!napResult.is_consistent) {
      gmapsEarned = Math.max(0, gmapsEarned - 5);
      gmapsGap = (gmapsGap ? `${gmapsGap}. ` : '') + (napResult.mismatch_reason || 'Inkonsistensi data NAP toko (Nama, Alamat, No HP).');

      recommendations.push({
        id: 'rec-nap-fix',
        title: 'Perbaiki Inkonsistensi Data NAP Toko',
        text: napResult.mismatch_reason || 'Samakan data Nama, Alamat, dan No HP di database dengan profil Google Maps.',
        impact_points: 5,
        category: 'Local SEO NAP Optimization',
        action_tab_id: 'gmaps-tab',
        action_button_label: '⚠️ Perbaiki Data NAP Sekarang',
        steps: [
          'Langkah 1: Periksa nomor HP & alamat lengkap toko di database BenPayu.com.',
          'Langkah 2: Samakan dengan informasi kontak di Google Business Profile.',
          'Langkah 3: Simpan dan verifikasi kembali status konsistensi NAP.'
        ]
      });
    }
  } else {
    gmapsGap = 'Belum mendaftarkan lokasi toko di Google Maps';
  }
  totalScore += gmapsEarned;
  breakdown.push({
    dimension: 'Google Business Presence',
    earned: gmapsEarned,
    max: 20,
    gap_reason: gmapsGap
  });

  if (!has_gmaps_profile || !gmaps_verified) {
    recommendations.push({
      id: 'rec-gmaps-claim',
      title: 'Klaim & Verifikasi Lokasi Google Maps',
      text: 'Daftarkan & verifikasi lokasi toko Anda di Google Maps agar mudah ditemukan pembeli sekitar.',
      impact_points: 20 - gmapsEarned,
      category: 'Google Maps Optimization',
      action_tab_id: 'gmaps-tab',
      action_button_label: '📍 Klaim & Buat QR Code Review',
      steps: [
        'Langkah 1: Buka aplikasi Google Maps, cari nama toko Anda lalu klik "Klaim Bisnis Ini".',
        'Langkah 2: Lakukan verifikasi via SMS/WA ke nomor HP toko.',
        'Langkah 3: Cetak QR Code Ulasan dari BenPayu.com dan letakkan di meja kasir.'
      ]
    });
  }

  // 2. Review & Reputasi (15%) - Max 15 Poin
  let reviewEarned = 0;
  let reviewGap = null;
  if (has_gmaps_profile) {
    if (gmaps_rating >= 4.5) {
      reviewEarned += 8;
    } else if (gmaps_rating >= 4.0) {
      reviewEarned += 4;
      reviewGap = 'Rating toko masih di bawah 4.5 bintang';
    } else {
      reviewGap = 'Rating toko di bawah 4.0 bintang';
    }

    if (review_count >= 20) {
      reviewEarned += 7;
    } else if (review_count >= 5) {
      reviewEarned += 3;
      reviewGap = reviewGap || 'Jumlah ulasan pelanggan masih di bawah 20 review';
    } else {
      reviewGap = reviewGap || 'Jumlah ulasan pelanggan masih di bawah 5 review';
    }
  } else {
    reviewGap = 'Fitur ulasan belum aktif karena belum ada lokasi Google Maps';
  }
  totalScore += reviewEarned;
  breakdown.push({
    dimension: 'Review & Reputasi Toko',
    earned: reviewEarned,
    max: 15,
    gap_reason: reviewGap
  });

  if (reviewEarned < 15 && has_gmaps_profile) {
    recommendations.push({
      id: 'rec-review-boost',
      title: 'Kumpulkan 20+ Ulasan Bintang 5',
      text: 'Gunakan QR Standee ulasan & kupon ulasan jujur untuk menambah bintang 5 dari pembeli.',
      impact_points: 15 - reviewEarned,
      category: 'Review Management',
      action_tab_id: 'gmaps-tab',
      action_button_label: '⭐ Cetak Standee QR Ulasan Jujur',
      steps: [
        'Langkah 1: Buka menu Google Maps & QR, buat template "Berikan Ulasan Jujur Anda".',
        'Langkah 2: Minta kasir mengajak pembeli memindai QR saat transaksi selesai.',
        'Langkah 3: Gunakan balasan otomatis AI untuk merespons ulasan pelanggan secara ramah.'
      ]
    });
  }

  // 3. Foto & Kelengkapan Visual (10%) - Max 10 Poin
  let visualEarned = 0;
  let visualGap = null;
  if (has_physical_banner) visualEarned += 5;
  if (photos_count >= 5) visualEarned += 5;
  else if (photos_count > 0) visualEarned += 2;

  if (visualEarned < 10) {
    visualGap = 'Foto plang nama toko & visual produk masih kurang lengkap';
    recommendations.push({
      id: 'rec-visual-photos',
      title: 'Lengkapi Foto Toko & Produk',
      text: 'Unggah minimal 5 foto produk & foto plang nama toko agar pembeli makin percaya.',
      impact_points: 10 - visualEarned,
      category: 'Kredibilitas Visual',
      action_tab_id: 'landing-tab',
      action_button_label: '📸 Unggah Foto ke Toko Online',
      steps: [
        'Langkah 1: Ambil foto plang toko tampak depan dari jarak 5 meter.',
        'Langkah 2: Ambil 5 foto produk terlaris dengan pencahayaan terang.',
        'Langkah 3: Unggah foto ke Mini Website Toko Online Instan Anda.'
      ]
    });
  }
  totalScore += visualEarned;
  breakdown.push({
    dimension: 'Foto & Kelengkapan Visual',
    earned: visualEarned,
    max: 10,
    gap_reason: visualGap
  });

  // 4. Website / Katalog Produk (15%) - Max 15 Poin
  let catalogEarned = has_website_or_catalog ? 15 : 0;
  let catalogGap = has_website_or_catalog ? null : 'Belum menerbitkan Mini Website & Toko Online Instan';
  totalScore += catalogEarned;
  breakdown.push({
    dimension: 'Mini Website & Toko Online Instan',
    earned: catalogEarned,
    max: 15,
    gap_reason: catalogGap
  });

  if (!has_website_or_catalog) {
    recommendations.push({
      id: 'rec-catalog-build',
      title: 'Terbitkan Mini Website & Toko Online Instan',
      text: 'Buat katalog web instan dalam 3 menit agar pelanggan bisa memesan via WhatsApp.',
      impact_points: 15,
      category: 'Toko Online Instan',
      action_tab_id: 'landing-tab',
      action_button_label: '🌐 Buat Mini Website Toko Online',
      steps: [
        'Langkah 1: Masukkan nama toko, alamat, dan deskripsi singkat usaha.',
        'Langkah 2: Tambahkan daftar produk beserta foto dan harga.',
        'Langkah 3: Terbitkan website dan bagikan tautan /toko/nama-toko-anda di media sosial.'
      ]
    });
  }

  // 5. WhatsApp & Kontak (10%) - Max 10 Poin
  let waEarned = has_whatsapp_business ? 10 : 0;
  let waGap = has_whatsapp_business ? null : 'Nomor WhatsApp Business resmi belum terhubung';
  totalScore += waEarned;
  breakdown.push({
    dimension: 'WhatsApp & Kontak Toko',
    earned: waEarned,
    max: 10,
    gap_reason: waGap
  });

  if (!has_whatsapp_business) {
    recommendations.push({
      id: 'rec-wa-business',
      title: 'Hubungkan WhatsApp Business Toko',
      text: 'Aktifkan WhatsApp Business agar tombol pesan di katalog langsung terhubung ke HP toko.',
      impact_points: 10,
      category: 'Komunikasi Pelanggan',
      action_tab_id: 'landing-tab',
      action_button_label: '💬 Tautkan WhatsApp Business',
      steps: [
        'Langkah 1: Unduh aplikasi WhatsApp Business gratis di smartphone.',
        'Langkah 2: Masukkan nomor WA toko Anda ke form Toko Online BenPayu.com.',
        'Langkah 3: Atur salam otomatis di WA Business untuk menyapa pembeli.'
      ]
    });
  }

  // 6. Produk & Kesiapan Harga (10%) - Max 10 Poin
  let priceEarned = has_product_prices ? 10 : (has_website_or_catalog ? 5 : 0);
  let priceGap = priceEarned === 10 ? null : 'Daftar harga produk belum dicantumkan secara jelas';
  totalScore += priceEarned;
  breakdown.push({
    dimension: 'Produk & Kesiapan Harga',
    earned: priceEarned,
    max: 10,
    gap_reason: priceGap
  });

  // 7. Transaksi Digital (10%) - Max 10 Poin
  let qrisEarned = has_qris_payment ? 10 : 0;
  let qrisGap = has_qris_payment ? null : 'Belum menyediakan pembayaran digital QRIS / Kasir';
  totalScore += qrisEarned;
  breakdown.push({
    dimension: 'Transaksi Digital & QRIS',
    earned: qrisEarned,
    max: 10,
    gap_reason: qrisGap
  });

  if (!has_qris_payment) {
    recommendations.push({
      id: 'rec-qris-setup',
      title: 'Aktifkan Pembayaran QRIS Kasir',
      text: 'Terima pembayaran e-wallet (GoPay, OVO, Dana, QRIS Bank) untuk mempercepat checkout kasir.',
      impact_points: 10,
      category: 'Transaksi Digital',
      action_tab_id: 'pos-tab',
      action_button_label: '📱 Buka Mesin Kasir & QRIS',
      steps: [
        'Langkah 1: Buka modul Mesin Kasir & QRIS di BenPayu.com.',
        'Langkah 2: Pilih pembayaran QRIS saat checkout kasir.',
        'Langkah 3: Tampilkan QR Code di layar HP/tablet agar di-scan pelanggan.'
      ]
    });
  }

  // 8. Kesiapan Operasional (10%) - Max 10 Poin
  let opsEarned = (has_operational_hours || has_promo_program) ? 10 : 5;
  let opsGap = opsEarned === 10 ? null : 'Jam operasional & program penawaran promo perlu dilengkapi';
  totalScore += opsEarned;
  breakdown.push({
    dimension: 'Kesiapan Operasional Toko',
    earned: opsEarned,
    max: 10,
    gap_reason: opsGap
  });

  // Ensure Total Score clamped 0 - 100
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Determine merchant-friendly status grade
  let statusGrade = 'SANGAT BAIK & OPTIMAL';
  if (totalScore >= 80) {
    statusGrade = 'SANGAT BAIK & OPTIMAL';
  } else if (totalScore >= 50) {
    statusGrade = 'PERLU OPTIMALISASI LOKAL';
  } else {
    statusGrade = 'PERLU PERHATIAN KHUSUS';
  }

  // Sort recommendations by impact_points descending for "Fokus Minggu Ini"
  recommendations.sort((a, b) => b.impact_points - a.impact_points);
  const topFocusTasks = recommendations.slice(0, 3);

  const business = db.businessProfiles.find(b => b.user_id === req.user.id);
  const businessName = business ? business.business_name : 'Usaha Anda';
  const businessCategory = business ? business.category : 'Kuliner & Retail';

  // Generate AI Model Diagnosis Summary with state consistency check
  const aiDiagnosisSummary = await generateBusinessAuditDiagnosis({
    score: totalScore,
    answers: req.body,
    businessName,
    businessCategory
  });

  const auditEntry = {
    id: `audit-${Date.now()}`,
    user_id: req.user.id,
    business_id: business ? business.id : null,
    health_score: totalScore,
    status_grade: statusGrade,
    audit_answers: req.body,
    breakdown,
    recommendations,
    top_focus_tasks: topFocusTasks,
    ai_diagnosis_summary: aiDiagnosisSummary,
    created_at: new Date().toISOString()
  };

  db.auditLogs.push(auditEntry);

  return res.json({
    success: true,
    data: {
      health_score: totalScore,
      status_grade: statusGrade,
      ai_diagnosis_summary: aiDiagnosisSummary,
      breakdown,
      recommendations,
      top_focus_tasks: topFocusTasks,
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

/**
 * @route GET /api/v1/audit/logs
 * @desc Get system audit logs (Admin & Field Agent Oversight)
 */
router.get('/logs', authenticate, authorizeRoles('SUPER_ADMIN', 'FIELD_AGENT'), (req, res) => {
  const { limit = 50 } = req.query;
  const logs = db.auditLogs.slice(0, Number(limit));

  return res.json({
    success: true,
    total_logs: db.auditLogs.length,
    data: logs
  });
});

/**
 * @route GET /api/v1/audit/file-log
 * @desc Read physical audit.log file contents for system debugging & security auditing
 */
router.get('/file-log', authenticate, authorizeRoles('SUPER_ADMIN'), (req, res) => {
  const { readAuditLogFile } = require('../../shared/utils/auditLogger');
  const fileContent = readAuditLogFile(200);

  return res.json({
    success: true,
    message: 'Physical audit.log file contents fetched successfully',
    data: {
      log_file_path: 'logs/audit.log',
      content: fileContent
    }
  });
});

module.exports = router;
