const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate } = require('../../shared/utils/rbac');

// Create or Update Landing Page Catalog
router.post('/create', authenticate, (req, res) => {
  const { business_name, category, description, whatsapp_number, template_theme, items } = req.body;

  if (!business_name || !whatsapp_number) {
    return res.status(400).json({ success: false, error: 'Nama Usaha & Nomor WhatsApp wajib diisi' });
  }

  const slug = business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  let business = db.businessProfiles.find(b => b.user_id === req.user.id);
  if (!business) {
    business = {
      id: `bp-${Date.now()}`,
      user_id: req.user.id,
      business_name,
      category: category || 'General',
      address_text: 'Belum diatur',
      latitude: -6.2000,
      longitude: 106.8166,
      gmaps_url: '',
      landing_page_slug: slug,
      updated_at: new Date().toISOString()
    };
    db.businessProfiles.push(business);
  } else {
    business.business_name = business_name;
    business.landing_page_slug = slug;
    business.updated_at = new Date().toISOString();
  }

  // Store page content
  business.landing_data = {
    description: description || 'Selamat datang di katalog resmi kami!',
    whatsapp_number,
    template_theme: template_theme || 'MODERN_EMERALD',
    items: items || [
      { name: 'Produk / Layanan Unggulan 1', price: 'Rp 25.000', description: 'Kualitas terbaik & siap pesan' },
      { name: 'Produk / Layanan Unggulan 2', price: 'Rp 50.000', description: 'Paling diminati pelanggan' }
    ]
  };

  const publicUrl = `/public/landing.html?slug=${slug}`;

  return res.json({
    success: true,
    data: {
      slug,
      publicUrl,
      landing_data: business.landing_data
    }
  });
});

// Public GET Endpoint for Mini Catalog Landing Page
router.get('/:slug', (req, res) => {
  const slug = req.params.slug;
  const business = db.businessProfiles.find(b => b.landing_page_slug === slug);

  if (!business) {
    return res.status(404).json({ success: false, error: 'Halaman katalog UMKM tidak ditemukan' });
  }

  return res.json({
    success: true,
    data: {
      business_name: business.business_name,
      category: business.category,
      address_text: business.address_text,
      gmaps_url: business.gmaps_url,
      landing_data: business.landing_data || {
        description: 'Selamat datang di toko kami!',
        whatsapp_number: '081234567890',
        template_theme: 'MODERN_EMERALD',
        items: []
      }
    }
  });
});

module.exports = router;
