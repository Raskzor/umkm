const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');
const {
  generateLocalKeywords,
  GMB_CATEGORY_MAPPING,
  getGMBMappingForCategory,
  calculateNAPConsistency,
  calculatePostScheduleStatus
} = require('../../shared/utils/localSeoHelpers');

// Generate QR Code Review Config & PDF Preview Template
router.post('/qr-generate', authenticate, (req, res) => {
  const { business_name, gmaps_review_url, template_style, custom_text } = req.body;

  if (!business_name || !gmaps_review_url) {
    return res.status(400).json({ success: false, error: 'Nama Usaha dan Link Review Google Maps wajib diisi' });
  }

  const isPremium = req.user.role_code === 'UMKM_OWNER_PREMIUM' || req.user.role_code === 'SUPER_ADMIN';

  const qrData = {
    id: `qr-${Date.now()}`,
    user_id: req.user.id,
    business_name,
    gmaps_review_url,
    template_style: isPremium ? (template_style || 'MODERN_GOLD') : 'BASIC_STANDARD',
    custom_text: custom_text || 'Berikan Ulasan Jujur Anda',
    qr_code_svg_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(gmaps_review_url)}`,
    pdf_download_url: `/api/v1/gmaps/download-pdf?url=${encodeURIComponent(gmaps_review_url)}&name=${encodeURIComponent(business_name)}`,
    tier_level: isPremium ? 'PREMIUM_BRANDED' : 'STANDARD_FREE'
  };

  return res.json({
    success: true,
    data: qrData
  });
});

// AI Auto-Responder for Google Maps Reviews
router.post('/auto-reply', authenticate, (req, res) => {
  const { reviewer_name, rating, review_text, business_name } = req.body;

  if (!reviewer_name || !rating) {
    return res.status(400).json({ success: false, error: 'Nama penulas dan jumlah bintang rating wajib diisi' });
  }

  const bizName = business_name || 'toko kami';
  let suggestedReply = '';

  if (rating >= 4) {
    suggestedReply = `Terima kasih banyak kak ${reviewer_name} telah memberikan ulasan bintang ${rating} untuk ${bizName}! Senang sekali bisa melayani Anda dengan baik. Sampai jumpa di kunjungan berikutnya! 🙏😊`;
  } else {
    suggestedReply = `Halo kak ${reviewer_name}, mohon maaf atas ketidaknyamanan yang dialami di ${bizName}. Masukan Anda sangat berharga bagi kami untuk terus berbenah. Hubungi WhatsApp kami agar kami bisa memberikan solusi terbaik. Terima kasih.`;
  }

  const replyRecord = {
    id: `rep-${Date.now()}`,
    user_id: req.user.id,
    reviewer_name,
    rating,
    review_text: review_text || '',
    suggested_reply: suggestedReply,
    created_at: new Date().toISOString()
  };

  db.reviewReplies.push(replyRecord);

  return res.json({
    success: true,
    data: replyRecord
  });
});

// Review Loyalty Coupon Generator
router.post('/coupons', authenticate, (req, res) => {
  const { coupon_name, discount_text, valid_days } = req.body;

  const couponCode = `DISCOUNT-${Math.floor(1000 + Math.random() * 9000)}`;
  const coupon = {
    id: `coup-${Date.now()}`,
    user_id: req.user.id,
    code: couponCode,
    title: coupon_name || 'Voucher Ulasan Bintang 5',
    discount_text: discount_text || 'Potongan Rp 5.000 / Gratis Es Teh',
    valid_until: new Date(Date.now() + (valid_days || 30) * 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  db.coupons.push(coupon);

  return res.json({
    success: true,
    data: coupon
  });
});

// 1. Modul "Pandoman Kata Kunci Lokal" (Local Keyword Injector)
router.post('/keyword-optimizer', authenticate, (req, res) => {
  const { business_name, core_product, location_street_or_district } = req.body;

  if (!business_name || !core_product) {
    return res.status(400).json({ success: false, error: 'Nama Usaha dan Produk Utama wajib diisi' });
  }

  const result = generateLocalKeywords({
    business_name,
    core_product,
    location_street_or_district: location_street_or_district || 'Sekitar Toko'
  });

  return res.json({
    success: true,
    data: result
  });
});

// 2. Modul "Suluh Kategori Bisnis" (Category Optimizer)
router.get('/categories', authenticate, (req, res) => {
  const business = db.businessProfiles.find(b => b.user_id === req.user.id) || db.businessProfiles[0];
  const userCat = business ? business.category : 'Retail & Sembako';

  const mapping = getGMBMappingForCategory(userCat);

  return res.json({
    success: true,
    data: {
      user_category: userCat,
      primary_gmb_category: business ? (business.primary_gmb_category || mapping.primary) : mapping.primary,
      secondary_gmb_categories: business ? (business.secondary_gmb_categories || mapping.secondary_options.slice(0, 3)) : mapping.secondary_options.slice(0, 3),
      all_mappings: GMB_CATEGORY_MAPPING
    }
  });
});

router.post('/categories', authenticate, (req, res) => {
  const { primary_gmb_category, secondary_gmb_categories } = req.body;

  if (!primary_gmb_category) {
    return res.status(400).json({ success: false, error: '1 Kategori Primer (Wajib) harus dipilih' });
  }

  const secondaries = Array.isArray(secondary_gmb_categories) ? secondary_gmb_categories.slice(0, 3) : [];

  let business = db.businessProfiles.find(b => b.user_id === req.user.id);
  if (!business) business = db.businessProfiles[0];

  if (business) {
    business.primary_gmb_category = primary_gmb_category;
    business.secondary_gmb_categories = secondaries;
  }

  return res.json({
    success: true,
    message: 'Kategori Google Business Profile berhasil diperbarui',
    data: {
      primary_gmb_category,
      secondary_gmb_categories: secondaries
    }
  });
});

// 3. Modul Pengingat Posting Rutin (Google Posts Scheduler)
router.get('/posts-status', authenticate, (req, res) => {
  const business = db.businessProfiles.find(b => b.user_id === req.user.id) || db.businessProfiles[0];
  const lastPostAt = business ? business.last_post_at : null;

  const scheduleInfo = calculatePostScheduleStatus(lastPostAt);

  return res.json({
    success: true,
    data: scheduleInfo
  });
});

router.post('/posts-update', authenticate, (req, res) => {
  let business = db.businessProfiles.find(b => b.user_id === req.user.id);
  if (!business) business = db.businessProfiles[0];

  const nowStr = new Date().toISOString();
  if (business) {
    business.last_post_at = nowStr;
  }

  return res.json({
    success: true,
    message: 'Postingan Google Maps berhasil dicatat sebagai aktif',
    data: {
      last_post_at: nowStr,
      status: 'AKTIF & SEGAR'
    }
  });
});

// 4. Modul Deteksi Inkonsistensi NAP (Name, Address, Phone Check)
router.post('/nap-check', authenticate, (req, res) => {
  const { local_phone, local_address, gmaps_phone, gmaps_address } = req.body;

  const business = db.businessProfiles.find(b => b.user_id === req.user.id) || db.businessProfiles[0];

  const check = calculateNAPConsistency({
    localPhone: local_phone || req.user.phone_number || '081234567890',
    localAddress: local_address || (business ? business.address_text : 'Jl. Melati No. 12'),
    gmapsPhone: gmaps_phone || (business ? business.gmaps_phone_number : '081234567890'),
    gmapsAddress: gmaps_address || (business ? business.gmaps_address_text : 'Jl. Melati No. 12')
  });

  return res.json({
    success: true,
    data: check
  });
});

// 5. Modul Panduan Foto & Video (Visual Standardization)
router.get('/visual-checklist', authenticate, (req, res) => {
  const business = db.businessProfiles.find(b => b.user_id === req.user.id) || db.businessProfiles[0];

  const frontCount = business ? (business.front_photos_count || 2) : 2;
  const interiorCount = business ? (business.interior_photos_count || 3) : 3;
  const productCount = business ? (business.product_photos_count || 5) : 5;

  const items = [
    { id: 'vis-front', label: '2 Foto Tampak Depan Toko', required: 2, current: frontCount, completed: frontCount >= 2 },
    { id: 'vis-interior', label: '3 Foto Interior / Area Usaha', required: 3, current: interiorCount, completed: interiorCount >= 3 },
    { id: 'vis-product', label: '5 Foto Produk Utama', required: 5, current: productCount, completed: productCount >= 5 }
  ];

  const totalUploaded = frontCount + interiorCount + productCount;
  const isComplete = frontCount >= 2 && interiorCount >= 3 && productCount >= 5;

  return res.json({
    success: true,
    data: {
      is_complete: isComplete,
      total_uploaded: totalUploaded,
      items
    }
  });
});

router.post('/visual-checklist', authenticate, (req, res) => {
  const { front_photos_count, interior_photos_count, product_photos_count } = req.body;

  let business = db.businessProfiles.find(b => b.user_id === req.user.id);
  if (!business) business = db.businessProfiles[0];

  if (business) {
    if (front_photos_count !== undefined) business.front_photos_count = parseInt(front_photos_count);
    if (interior_photos_count !== undefined) business.interior_photos_count = parseInt(interior_photos_count);
    if (product_photos_count !== undefined) business.product_photos_count = parseInt(product_photos_count);
    
    business.photos_count = (business.front_photos_count || 0) + (business.interior_photos_count || 0) + (business.product_photos_count || 0);
  }

  return res.json({
    success: true,
    message: 'Status checklist visual foto & video berhasil diperbarui',
    data: {
      front_photos_count: business ? business.front_photos_count : front_photos_count,
      interior_photos_count: business ? business.interior_photos_count : interior_photos_count,
      product_photos_count: business ? business.product_photos_count : product_photos_count,
      total_photos: business ? (business.photos_count || 10) : 10
    }
  });
});

// Google Maps Optimization Checklist
router.get('/checklist', authenticate, (req, res) => {
  const checklist = [
    { id: 1, title: 'Klaim Nama & Alamat Toko di Google Business Profile', category: 'SETUP', status: 'REQUIRED' },
    { id: 2, title: 'Pin Lokasi Presisi di Peta (Gunakan Koordinat GPS)', category: 'LOCATION', status: 'REQUIRED' },
    { id: 3, title: 'Tambahkan Jam Operasional & Nomor WA Toko', category: 'CONTACT', status: 'REQUIRED' },
    { id: 4, title: 'Unggah 2 Foto Tampak Depan, 3 Interior, & 5 Produk Utama', category: 'MEDIA', status: 'RECOMMENDED' },
    { id: 5, title: 'Cetak Standee QR Review & Taruh di Meja Kasir', category: 'REVIEWS', status: 'HIGH_PRIORITY' },
    { id: 6, title: 'Balas Setiap Ulasan Pelanggan Dalam Maksimal 24 Jam', category: 'ENGAGEMENT', status: 'RECOMMENDED' }
  ];

  return res.json({
    success: true,
    data: checklist
  });
});

module.exports = router;
