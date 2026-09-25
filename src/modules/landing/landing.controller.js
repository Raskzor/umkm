const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate } = require('../../shared/utils/rbac');

// Create or Update Landing Page Catalog
router.post('/create', authenticate, (req, res) => {
  const {
    business_name,
    category,
    description,
    whatsapp_number,
    banner_url,
    social_links,
    items
  } = req.body;

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
      category: category || 'Umum',
      address_text: 'Jl. Melati No. 12, Jakarta Selatan',
      latitude: -6.2088,
      longitude: 106.8456,
      gmaps_url: 'https://maps.google.com/?q=' + encodeURIComponent(business_name),
      landing_page_slug: slug,
      updated_at: new Date().toISOString()
    };
    db.businessProfiles.push(business);
  } else {
    business.business_name = business_name;
    business.category = category || business.category;
    business.landing_page_slug = slug;
    business.updated_at = new Date().toISOString();
  }

  // Store rich landing page content
  business.landing_data = {
    description: description || 'Selamat datang di katalog resmi usaha kami!',
    whatsapp_number,
    banner_url: banner_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    social_links: social_links || {
      instagram: '',
      tiktok: '',
      facebook: '',
      shopee: '',
      tokopedia: ''
    },
    items: (items && items.length > 0) ? items : [
      {
        name: 'Produk Unggulan 1',
        price: 'Rp 25.000',
        description: 'Bahan berkualitas tinggi & siap kirim',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
      },
      {
        name: 'Produk Unggulan 2',
        price: 'Rp 50.000',
        description: 'Paling diminati pelanggan setia',
        image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
      }
    ]
  };

  const publicUrl = `/landing.html?slug=${slug}`;

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
        banner_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        social_links: { instagram: '', tiktok: '', facebook: '', shopee: '', tokopedia: '' },
        items: []
      }
    }
  });
});

module.exports = router;
