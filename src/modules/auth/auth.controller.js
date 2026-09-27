const express = require('express');
const router = express.Router();
const { generateSecret, generateURI, verifySync } = require('otplib');
const qrcode = require('qrcode');
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
    two_factor_enabled: false,
    subscription_tier: assignedRole === 'UMKM_OWNER_PREMIUM' ? 'PREMIUM' : 'FREE',
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

  // 2FA Google Authenticator Check
  if (user.two_factor_enabled && user.two_factor_secret) {
    return res.json({
      success: true,
      requires_2fa: true,
      phone_number: user.phone_number,
      message: '🔑 Verifikasi 2FA Google Authenticator Diperlukan. Masukkan Kode 6-Digit.'
    });
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
 * @route POST /api/v1/auth/google
 * @desc Login or Register via Google OAuth
 */
router.post('/google', async (req, res) => {
  const { email, full_name, google_id } = req.body;

  if (!email && !google_id) {
    return res.status(400).json({ success: false, error: 'Email atau Google Account wajib diisi' });
  }

  const userEmail = email || `google_${Date.now()}@gmail.com`;
  const name = full_name || 'Pengguna Google';

  // Check if user exists by phone or email or id
  let user = db.users.find(u => u.email === userEmail || u.phone_number === userEmail);

  if (!user) {
    user = {
      id: `u-google-${Date.now()}`,
      phone_number: userEmail,
      email: userEmail,
      full_name: name,
      role_code: 'UMKM_OWNER_FREE',
      two_factor_enabled: false,
      subscription_tier: 'FREE',
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };
    db.users.push(user);

    if (db.isSupabaseConfigured) {
      await db.insertToSupabase('users', user);
    }
  }

  const token = generateToken({ id: user.id, role_code: user.role_code });
  const permissions = PERMISSION_MATRIX[user.role_code] || [];

  return res.json({
    success: true,
    message: '🔑 Login Google Berhasil',
    data: {
      user,
      token,
      permissions
    }
  });
});

/**
 * @route GET /api/v1/auth/me
 * @desc Verify session & ensure user exists in Table User
 */
router.get('/me', authenticate, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User tidak ditemukan di Table User' });
  }

  return res.json({
    success: true,
    data: {
      user,
      permissions: PERMISSION_MATRIX[user.role_code] || []
    }
  });
});

/**
 * @route POST /api/v1/auth/2fa/generate
 * @desc Generate Google 2FA Secret & QR Code for Authenticator App
 */
router.post('/2fa/generate', authenticate, async (req, res) => {
  try {
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      label: req.user.phone_number || req.user.full_name,
      issuer: 'BenPayu SuperUMKM',
      secret
    });
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
    req.user.two_factor_temp_secret = secret;

    return res.json({
      success: true,
      message: 'QR Code 2FA berhasil dibuat',
      data: {
        secret,
        otpauth_url: otpauthUrl,
        qr_code_url: qrCodeDataUrl
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Gagal membuat QR Code 2FA: ' + err.message });
  }
});

/**
 * @route POST /api/v1/auth/2fa/verify-setup
 * @desc Verify initial TOTP 6-digit code to enable 2FA
 */
router.post('/2fa/verify-setup', authenticate, async (req, res) => {
  const { token_code } = req.body;
  const secret = req.user.two_factor_temp_secret || req.user.two_factor_secret;

  if (!secret || !token_code) {
    return res.status(400).json({ success: false, error: 'Kode 2FA 6-digit wajib diisi' });
  }

  const result = verifySync({ token: token_code, secret });
  if (!result || !result.valid) {
    return res.status(400).json({ success: false, error: 'Kode 2FA Google Authenticator tidak valid atau kadaluarsa' });
  }

  req.user.two_factor_secret = secret;
  req.user.two_factor_enabled = true;
  delete req.user.two_factor_temp_secret;

  if (db.isSupabaseConfigured) {
    await db.updateInSupabase('users', req.user.id, {
      two_factor_secret: secret,
      two_factor_enabled: true
    });
  }

  return res.json({
    success: true,
    message: '🎉 Google 2FA Authenticator Berhasil Diaktifkan!'
  });
});

/**
 * @route POST /api/v1/auth/2fa/verify-login
 * @desc Verify 6-digit 2FA code during login
 */
router.post('/2fa/verify-login', async (req, res) => {
  const { phone_number, token_code } = req.body;

  if (!phone_number || !token_code) {
    return res.status(400).json({ success: false, error: 'Nomor WhatsApp dan Kode 2FA wajib diisi' });
  }

  const user = db.users.find(u => u.phone_number === phone_number);
  if (!user || !user.two_factor_secret) {
    return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan atau 2FA belum aktif' });
  }

  const result = verifySync({ token: token_code, secret: user.two_factor_secret });
  if (!result || !result.valid) {
    return res.status(401).json({ success: false, error: 'Kode 2FA Google Authenticator salah atau kadaluarsa' });
  }

  const token = generateToken({ id: user.id, role_code: user.role_code });
  const permissions = PERMISSION_MATRIX[user.role_code] || [];

  return res.json({
    success: true,
    message: 'Verifikasi 2FA berhasil! Selamat datang kembali',
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
