const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

// Generate QR Code Review Config & PDF Preview Template
router.post('/qr-generate', authenticate, (req, res) => {
  const { business_name, gmaps_review_url, template_style, custom_text } = req.body;

  if (!business_name || !gmaps_review_url) {
    return res.status(400).json({ success: false, error: 'Nama Usaha dan Link Review Google Maps wajib diisi' });
  }

  // Check RBAC customization limits (Free vs Premium)
  const isPremium = req.user.role_code === 'UMKM_OWNER_PREMIUM' || req.user.role_code === 'SUPER_ADMIN';

  const qrData = {
    id: `qr-${Date.now()}`,
    user_id: req.user.id,
    business_name,
    gmaps_review_url,
    template_style: isPremium ? (template_style || 'MODERN_GOLD') : 'BASIC_STANDARD',
    custom_text: isPremium ? (custom_text || 'Beri Kami Ulasan Bintang 5 & Dapatkan Diskon!') : 'Pindai Saya untuk Ulasan Google',
    qr_code_svg_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(gmaps_review_url)}`,
    pdf_download_url: `/api/v1/gmaps/download-pdf?url=${encodeURIComponent(gmaps_review_url)}&name=${encodeURIComponent(business_name)}`,
    tier_level: isPremium ? 'PREMIUM_BRANDED' : 'STANDARD_FREE'
  };

  return res.json({
    success: true,
    data: qrData
  });
});

// Google Maps Optimization Checklist
router.get('/checklist', authenticate, (req, res) => {
  const checklist = [
    { id: 1, title: 'Klaim Nama & Alamat Toko di Google Business Profile', category: 'SETUP', status: 'REQUIRED' },
    { id: 2, title: 'Pin Lokasi Presisi di Peta (Gunakan Koordinat GPS)', category: 'LOCATION', status: 'REQUIRED' },
    { id: 3, title: 'Tambahkan Jam Operasional & Nomor WA Toko', category: 'CONTACT', status: 'REQUIRED' },
    { id: 4, title: 'Unggah Foto Depan Toko, Interior, & Menu/Katalog', category: 'MEDIA', status: 'RECOMMENDED' },
    { id: 5, title: 'Cetak Standee QR Review & Taruh di Meja Kasir', category: 'REVIEWS', status: 'HIGH_PRIORITY' },
    { id: 6, title: 'Balas Setiap Ulasan Pelanggan Dalam Maksimal 24 Jam', category: 'ENGAGEMENT', status: 'RECOMMENDED' }
  ];

  return res.json({
    success: true,
    data: checklist
  });
});

module.exports = router;
