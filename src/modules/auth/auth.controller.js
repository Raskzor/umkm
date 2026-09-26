const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { generateToken, verifyToken } = require('../../shared/utils/jwt');
const { authenticate, PERMISSION_MATRIX } = require('../../shared/utils/rbac');

/**
 * @route POST /api/v1/auth/register
 * @desc Register new user (UMKM Owner, Agent, etc.)
 */
router.post('/register', (req, res) => {
  const { phone_number, full_name, role_code, business_name, category } = req.body;

  if (!phone_number || !full_name) {
    return res.status(400).json({ success: false, error: 'Nomor WhatsApp / Phone dan Nama Lengkap wajib diisi' });
  }

  const existing = db.users.find(u => u.phone_number === phone_number);
  if (existing) {
    return res.status(400).json({ success: false, error: 'Nomor WhatsApp sudah terdaftar' });
  }

  const validRoles = ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'];
  const assignedRole = validRoles.includes(role_code) ? role_code : 'UMKM_OWNER_FREE';

  const newUser = {
    id: `u-${Date.now()}`,
    phone_number,
    full_name,
    role_code: assignedRole,
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
  const permissions = PERMISSION_MATRIX[newUser.role_code] || [];

  return res.status(201).json({
    success: true,
    message: 'Registrasi berhasil',
    data: {
      user: newUser,
      token,
      permissions
    }
  });
});

/**
 * @route POST /api/v1/auth/login
 * @desc Login standard user (Owner / Agent / Admin) by phone number
 */
router.post('/login', (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ success: false, error: 'Nomor WhatsApp / Phone wajib diisi' });
  }

  const user = db.users.find(u => u.phone_number === phone_number);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Akun dengan nomor ini tidak ditemukan' });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ success: false, error: 'Akun Anda sedang tidak aktif' });
  }

  const token = generateToken({ id: user.id, role_code: user.role_code });
  const permissions = PERMISSION_MATRIX[user.role_code] || [];

  return res.json({
    success: true,
    message: 'Login berhasil',
    data: {
      user,
      token,
      permissions
    }
  });
});

/**
 * @route POST /api/v1/auth/login-cashier
 * @desc Login for Cashier Staff using Phone Number & 4-digit PIN
 */
router.post('/login-cashier', (req, res) => {
  const { phone_number, pin } = req.body;

  if (!phone_number || !pin) {
    return res.status(400).json({ success: false, error: 'Nomor WhatsApp dan PIN Kasir wajib diisi' });
  }

  const user = db.users.find(u => u.phone_number === phone_number && u.role_code === 'CASHIER');
  if (!user) {
    return res.status(404).json({ success: false, error: 'Akun staf kasir dengan nomor ini tidak ditemukan' });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ success: false, error: 'Akun kasir sudah dinonaktifkan oleh pemilik toko' });
  }

  if (user.pin !== pin) {
    return res.status(401).json({ success: false, error: 'PIN Kasir salah. Silakan coba lagi.' });
  }

  const token = generateToken({ id: user.id, role_code: user.role_code, owner_id: user.owner_id });
  const permissions = PERMISSION_MATRIX[user.role_code] || [];

  return res.json({
    success: true,
    message: 'Login kasir berhasil',
    data: {
      user,
      token,
      permissions
    }
  });
});

/**
 * @route POST /api/v1/auth/verify-token
 * @desc Verify JWT token validity & return current user details
 */
router.post('/verify-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, valid: false, error: 'Token wajib diberikan' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, valid: false, error: 'Token tidak valid atau kadaluarsa' });
  }

  const user = db.users.find(u => u.id === decoded.id);
  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json({ success: false, valid: false, error: 'Pengguna tidak ditemukan atau tidak aktif' });
  }

  return res.json({
    success: true,
    valid: true,
    data: {
      user,
      permissions: PERMISSION_MATRIX[user.role_code] || []
    }
  });
});

/**
 * @route GET /api/v1/auth/me
 * @desc Get currently authenticated user profile & business profile
 */
router.get('/me', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const business = db.businessProfiles.find(b => b.user_id === ownerId);
  const permissions = PERMISSION_MATRIX[req.user.role_code] || [];

  return res.json({
    success: true,
    data: {
      user: req.user,
      businessProfile: business || null,
      permissions
    }
  });
});

/**
 * @route POST /api/v1/auth/change-pin
 * @desc Update Cashier PIN
 */
router.post('/change-pin', authenticate, (req, res) => {
  const { old_pin, new_pin } = req.body;

  if (req.user.role_code !== 'CASHIER') {
    return res.status(403).json({ success: false, error: 'Fitur ubah PIN hanya untuk staf kasir' });
  }

  if (req.user.pin && req.user.pin !== old_pin) {
    return res.status(400).json({ success: false, error: 'PIN lama salah' });
  }

  if (!new_pin || new_pin.length < 4) {
    return res.status(400).json({ success: false, error: 'PIN baru minimal 4 angka' });
  }

  req.user.pin = new_pin;
  const staffObj = db.posStaff.find(s => s.user_id === req.user.id);
  if (staffObj) staffObj.pin = new_pin;

  return res.json({
    success: true,
    message: 'PIN Kasir berhasil diperbarui'
  });
});

/**
 * @route POST /api/v1/auth/token-for-role
 * @desc Helper endpoint to get valid authorization token for any role (used for UI role switcher / testing)
 */
router.post('/token-for-role', (req, res) => {
  const { role_code } = req.body;
  const targetUser = db.users.find(u => u.role_code === role_code);

  if (!targetUser) {
    return res.status(404).json({ success: false, error: `User with role ${role_code} not found in database seed` });
  }

  const token = generateToken({ id: targetUser.id, role_code: targetUser.role_code });

  return res.json({
    success: true,
    data: {
      user: targetUser,
      token,
      permissions: PERMISSION_MATRIX[targetUser.role_code] || []
    }
  });
});

module.exports = router;
