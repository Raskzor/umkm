const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');
const { generateBusinessAuditDiagnosis } = require('../../shared/utils/ai.service');

// Execute AI-Powered Business Health Check Evaluation
router.post('/evaluate', authenticate, async (req, res) => {
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
    score += 10;
    breakdown.push({ item: 'Jumlah Review Pelanggan (>=20)', points: 10, max: 10 });
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

  if (photos_count >= 10) {
    score += 15;
    breakdown.push({ item: 'Foto Produk & Lokasi Lengkap (>=10)', points: 15, max: 15 });
  } else {
    recommendations.push({
      id: 'rec-photos-upload',
      text: 'Unggah foto produk & suasana tempat usaha berkualitas tinggi untuk menarik kepercayaan calon pembeli.',
      target_course_id: 'tut-004',
      course_title: 'Strategi Ads Lokal Radius 3KM untuk Kafe & Retail',
      category: 'Local Advertising',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      action_tab_id: 'services-tab',
      action_button_label: '🛠️ Minta Agen Lapangan Ambil Foto Geotag',
      steps: [
        { num: 1, title: 'Pencahayaan Terang', desc: 'Ambil foto produk di tempat terang (cahaya matahari pagi/siang).' },
        { num: 2, title: 'Foto Suasana Toko', desc: 'Foto bagian depan toko, area kasir, dan suasana saat ramah pembeli.' },
        { num: 3, title: 'Minta Bantuan Agen Wilayah', desc: 'Jika kesulitan, ajukan tiket jasa pendampingan agar agen datang mengambil foto geotag.' }
      ]
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
      category: 'Local Advertising',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      action_tab_id: 'gmaps-tab',
      action_button_label: '📍 Buka Google Maps Manager',
      steps: [
        { num: 1, title: 'Buat Promo Spesial Mingguan', desc: 'Tentukan promo sederhana (misal: "Diskon 10% Setiap Hari Jumat").' },
        { num: 2, title: 'Post di Google Profile', desc: 'Buka Google Maps -> Tambahkan Pembaruan / Postingan Promo.' },
        { num: 3, title: 'Update Foto Produk Baru', desc: 'Tambahkan 1-2 foto produk terbaru minggu ini agar lokasi dianggap aktif oleh Google.' }
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

module.exports = router;
