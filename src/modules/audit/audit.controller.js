const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');
const { generateBusinessAuditDiagnosis } = require('../../shared/utils/ai.service');

// Execute AI-Powered Business Health Check Evaluation
router.post('/evaluate', authenticate, authorizeRoles('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'), async (req, res) => {
  const {
    has_gmaps_profile,
    gmaps_rating,
    review_count,
    has_website_or_catalog,
    has_whatsapp_business,
    has_qris_payment,
    has_physical_banner,
    has_social_media,
    has_promo_program
  } = req.body;

  let score = 0;
  const breakdown = [];
  const recommendations = [];

  // 1. Google Maps Optimization Check (Conditional max 25 pts)
  if (has_gmaps_profile) {
    score += 10;
    breakdown.push({ item: 'Google Maps Profil Diklaim', points: 10, max: 10 });

    if (gmaps_rating >= 4.5) {
      score += 8;
      breakdown.push({ item: 'Rating Pelanggan Bintang 5 (>=4.5)', points: 8, max: 8 });
    } else if (gmaps_rating >= 4.0) {
      score += 4;
      breakdown.push({ item: 'Rating Pelanggan Cukup (>=4.0)', points: 4, max: 8 });
    } else {
      recommendations.push({
        id: 'rec-rating-boost',
        text: 'Tingkatkan rating Google Maps dengan mencetak QR Standee ulasan dan memberikan respons ramah AI.',
        target_course_id: 'tut-002',
        course_title: 'Trik Mendapatkan 100+ Bintang 5 Review Pelanggan',
        category: 'Review Management',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        action_tab_id: 'gmaps-tab',
        action_button_label: '🎨 Cetak QR Standee & Auto-Reply AI',
        steps: [
          { num: 1, title: 'Generate QR Standee Akrilik', desc: 'Buka menu Google Maps & QR, masukkan link ulasan toko Anda lalu klik "Generate Standee".' },
          { num: 2, title: 'Letakkan QR di Meja Kasir', desc: 'Cetak dan letakkan Standee QR di kasir. Minta kasir menyapa: "Boleh bantu ulas bintang 5 kak?"' },
          { num: 3, title: 'Gunakan AI Auto-Reply', desc: 'Aktifkan fitur AI Auto-Responder di SuperUMKM untuk membalas ulasan secara ramah & otomatis.' }
        ]
      });
    }

    if (review_count >= 20) {
      score += 7;
      breakdown.push({ item: 'Jumlah Review Pelanggan (>=20)', points: 7, max: 7 });
    } else {
      recommendations.push({
        id: 'rec-review-count',
        text: 'Kejar target minimal 20 review pertama menggunakan Standee Akrilik QR Code di meja kasir.',
        target_course_id: 'tut-002',
        course_title: 'Trik Mendapatkan 100+ Bintang 5 Review Pelanggan',
        category: 'Review Management',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        action_tab_id: 'gmaps-tab',
        action_button_label: '🎟️ Buat Kupon Diskon Ulasan Bintang 5',
        steps: [
          { num: 1, title: 'Terbitkan Kupon Digital Loyalitas', desc: 'Buka fitur QR Review Coupon Generator, buat promo "Diskon Rp 5.000 / Gratis Es Teh".' },
          { num: 2, title: 'Sajikan QR Code Ulasan', desc: 'Minta pelanggan memindai QR Code setelah selesai transaksi.' },
          { num: 3, title: 'Berikan Hadiah Langsung', desc: 'Tunjukkan bukti ulasan bintang 5 ke kasir untuk mengklaim promo diskon.' }
        ]
      });
    }
  } else {
    recommendations.push({
      id: 'rec-gmaps-claim',
      text: 'Klaim & verifikasi lokasi usaha Anda di Google Maps untuk meningkatkan visibilitas di area sekitar.',
      target_course_id: 'tut-001',
      course_title: 'Cara Klaim & Verifikasi Google Maps Tempat Usaha',
      category: 'Google Maps Optimization',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      action_tab_id: 'gmaps-tab',
      action_button_label: '📍 Buka Modul Google Maps & QR Generator',
      steps: [
        { num: 1, title: 'Cari Toko Anda di Google Maps', desc: 'Buka aplikasi Google Maps di HP, ketik nama usaha Anda. Jika sudah muncul, pilih "Klaim Bisnis Ini".' },
        { num: 2, title: 'Verifikasi Nomor & Alamat', desc: 'Pilih metode verifikasi via SMS atau WhatsApp ke nomor telepon toko Anda yang aktif.' },
        { num: 3, title: 'Lengkapi Foto & Jam Buka', desc: 'Unggah foto plang toko tampak depan dan sesuaikan jam operasional toko dari Senin-Minggu.' }
      ]
    });
  }

  // 2. Transaksi Digital & Omset (Max 15 pts)
  if (has_qris_payment) {
    score += 15;
    breakdown.push({ item: 'Menerima Pembayaran QRIS / E-Wallet', points: 15, max: 15 });
  } else {
    recommendations.push({
      id: 'rec-qris-payment',
      text: 'Aktifkan QRIS / Digital Payment untuk mempercepat checkout kasir & meningkatkan omset penjualan.',
      target_course_id: 'tut-003',
      course_title: 'Strategi Akselerasi Omset dengan Pembayaran QRIS',
      category: 'Penjualan & Kasir',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      action_tab_id: 'pos-tab',
      action_button_label: '📱 Buka Fitur Kasir & QRIS',
      steps: [
        { num: 1, title: 'Daftar Merchant QRIS', desc: 'Aktifkan QRIS toko via aplikasi perbankan atau e-wallet.' },
        { num: 2, title: 'Tempel QRIS di Meja Kasir', desc: 'Cetak dan letakkan stiker QRIS di dekat mesin kasir.' },
        { num: 3, title: 'Catat Penjualan di POS', desc: 'Gunakan mesin kasir SuperUMKM untuk merekap transaksi QRIS otomatis.' }
      ]
    });
  }

  // 3. Pamor Merek & Plang Fisik (Max 15 pts)
  if (has_physical_banner) {
    score += 15;
    breakdown.push({ item: 'Plang Merek / Spanduk Toko Jelas', points: 15, max: 15 });
  } else {
    recommendations.push({
      id: 'rec-physical-banner',
      text: 'Pasang Plang Merek / Spanduk Toko yang jelas untuk mendongkrak pamor & daya tarik pembeli lokal.',
      target_course_id: 'tut-001',
      course_title: 'Branding Toko Fisik & Visual Kredibilitas',
      category: 'Pamor & Branding',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      action_tab_id: 'audit-tab',
      action_button_label: '📸 Ambil Foto Plang Toko',
      steps: [
        { num: 1, title: 'Buat Spanduk / Plang Jelas', desc: 'Pastikan nama toko dan nomor WhatsApp terlihat dari jarak 10 meter.' },
        { num: 2, title: 'Foto Tampak Depan Toko', desc: 'Unggah foto plang toko ke profil lokasi Google Maps Anda.' }
      ]
    });
  }

  // 4. Promosi & Jangkauan Media Sosial (Max 15 pts)
  if (has_social_media) {
    score += 15;
    breakdown.push({ item: 'Promosi Aktif Media Sosial (IG/TikTok/FB)', points: 15, max: 15 });
  } else {
    recommendations.push({
      id: 'rec-social-media',
      text: 'Aktifkan Media Sosial (Instagram/TikTok) untuk memperluas jangkauan pembeli & pamor merek UMKM.',
      target_course_id: 'tut-004',
      course_title: 'Konten Viral Media Sosial untuk Usaha Lokal',
      category: 'Digital Marketing',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      action_tab_id: 'landing-tab',
      action_button_label: '🌐 Pasang Link Medsos di Katalog Web',
      steps: [
        { num: 1, title: 'Buat Akun Bisnis Instagram/TikTok', desc: 'Gunakan nama toko yang sama dengan lokasi Google Maps.' },
        { num: 2, title: 'Unggah Video Produk Pendek', desc: 'Upload 1-2 video produk per minggu dengan musik populer.' }
      ]
    });
  }

  // 5. Program Diskon & Repeat Order (Max 15 pts)
  if (has_promo_program) {
    score += 15;
    breakdown.push({ item: 'Program Promo / Paket Hemat / Loyalty', points: 15, max: 15 });
  } else {
    recommendations.push({
      id: 'rec-promo-program',
      text: 'Buat Program Promo Paket Hemat atau Voucher Ulasan untuk mendongkrak omset & repeat order.',
      target_course_id: 'tut-002',
      course_title: 'Strategi Promo Bundling untuk Menaikkan Omset 2x Lipat',
      category: 'Strategi Penjualan',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      action_tab_id: 'gmaps-tab',
      action_button_label: '🎟️ Buat Voucher Kupon Promo',
      steps: [
        { num: 1, title: 'Buat Paket Hemat Bundling', desc: 'Contoh: Beli 2 Produk Gratis 1 Minuman / Diskon Paket Hemat.' },
        { num: 2, title: 'Sebarkan Promo di WhatsApp', desc: 'Kirim info promo ke pelanggan via WhatsApp Business.' }
      ]
    });
  }

  // 6. Katalog Web & WhatsApp Business (Max 15 pts)
  if (has_website_or_catalog) {
    score += 8;
    breakdown.push({ item: 'Landing Page / Mini Katalog Aktif', points: 8, max: 8 });
  } else {
    recommendations.push({
      id: 'rec-landing-build',
      text: 'Terbitkan Website Sementara & Mini Catalog instan dalam 3 menit di fitur Builder.',
      target_course_id: 'tut-003',
      course_title: 'Masterclass WhatsApp Automation & Landing Page High Conversion',
      category: 'Digital Marketing',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      action_tab_id: 'landing-tab',
      action_button_label: '🌐 Buka Builder Website Sementara',
      steps: [
        { num: 1, title: 'Isi Profil & Katalog Usaha', desc: 'Buka menu Builder Website Sementara, masukkan nama toko, deskripsi, dan daftar produk.' },
        { num: 2, title: 'Tautkan Nomor WhatsApp', desc: 'Masukkan nomor WhatsApp toko agar pelanggan bisa klik tombol beli langsung kirim pesan WA.' },
        { num: 3, title: 'Terbitkan & Bagikan Link', desc: 'Klik "Terbitkan Website", lalu pasang link publik tersebut di bio Instagram & Google Maps!' }
      ]
    });
  }

  if (has_whatsapp_business) {
    score += 7;
    breakdown.push({ item: 'WhatsApp Business Hook Built-in', points: 7, max: 7 });
  } else {
    recommendations.push({
      id: 'rec-wa-business',
      text: 'Aktifkan WhatsApp Business resmi agar pembeli dari katalog web bisa langsung memesan instan.',
      target_course_id: 'tut-003',
      course_title: 'Masterclass WhatsApp Automation & Landing Page High Conversion',
      category: 'Digital Marketing',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      action_tab_id: 'landing-tab',
      action_button_label: '💬 Hubungkan WhatsApp Business ke Web',
      steps: [
        { num: 1, title: 'Download WA Business', desc: 'Unduh aplikasi WhatsApp Business resmi gratis dari Google Play Store / App Store.' },
        { num: 2, title: 'Atur Pesan Otomatis (Greeting)', desc: 'Aktifkan Salam Otomatis di menu Fitur Bisnis WhatsApp.' },
        { num: 3, title: 'Pasang Tautan di Katalog', desc: 'Salin nomor WA Anda ke Builder Website SuperUMKM untuk hook pesan instan.' }
      ]
    });
  }

  const business = db.businessProfiles.find(b => b.user_id === req.user.id);
  const businessName = business ? business.name : 'Usaha Anda';
  const businessCategory = business ? business.category : 'Kuliner & Retail';

  let statusGrade = 'EXCELLENT';
  if (score >= 80) {
    statusGrade = 'EXCELLENT';
  } else if (score >= 50) {
    statusGrade = 'NEEDS_OPTIMIZATION';
  } else {
    statusGrade = 'CRITICAL';
  }

  // Generate AI Model Diagnosis Summary
  const aiDiagnosisSummary = await generateBusinessAuditDiagnosis({
    score,
    answers: req.body,
    businessName,
    businessCategory
  });

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
