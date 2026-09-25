const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { generateToken } = require('../../shared/utils/jwt');
const { authenticate } = require('../../shared/utils/rbac');

// Register Endpoint
router.post('/register', (req, res) => {
  const { phone_number, full_name, role_code, business_name, category } = req.body;

  if (!phone_number || !full_name) {
    return res.status(400).json({ success: false, error: 'Nomor WhatsApp / Phone dan Nama Lengkap wajib diisi' });
  }

  const existing = db.users.find(u => u.phone_number === phone_number);
  if (existing) {
    return res.status(400).json({ success: false, error: 'Nomor WhatsApp sudah terdaftar' });
  }

  const newUser = {
    id: `u-${Date.now()}`,
    phone_number,
    full_name,
    role_code: role_code || 'UMKM_OWNER_FREE',
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);

  // If business info provided, create business profile
  if (business_name) {
    const slug = business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    db.businessProfiles.push({
      id: `bp-${Date.now()}`,
      user_id: newUser.id,
      business_name,
      category: category || 'Umum',
      address_text: 'Alamat belum diatur',
      latitude: -6.2000,
      longitude: 106.8166,
      gmaps_url: '',
      landing_page_slug: slug,
      updated_at: new Date().toISOString()
    });
  }

  const token = generateToken({ id: newUser.id, role_code: newUser.role_code });

  return res.status(201).json({
    success: true,
    data: {
      user: newUser,
      token
    }
  });
});

// Login Endpoint (Phone number based)
router.post('/login', (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ success: false, error: 'Nomor WhatsApp / Phone wajib diisi' });
  }

  const user = db.users.find(u => u.phone_number === phone_number);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Akun dengan nomor ini tidak ditemukan' });
  }

  const token = generateToken({ id: user.id, role_code: user.role_code });

  return res.json({
    success: true,
    data: {
      user,
      token
    }
  });
});

// Get Current Profile (/me)
router.get('/me', authenticate, (req, res) => {
  const business = db.businessProfiles.find(b => b.user_id === req.user.id);
  return res.json({
    success: true,
    data: {
      user: req.user,
      businessProfile: business || null
    }
  });
});

module.exports = router;
