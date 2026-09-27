const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { generateToken } = require('../../shared/utils/jwt');
const { authenticate } = require('../../shared/utils/rbac');
const { resolveNavigationMenu } = require('../../config/navigationMenu');

/**
 * @route GET /api/v1/users/navigation-menus
 * @desc Dynamic Menu Resolver Endpoint returning accessible navigation tree & metadata limits based on user role & tier
 * @access Protected (JWT Authenticated)
 */
router.get('/navigation-menus', authenticate, (req, res) => {
  const userRole = req.user.role_code;
  const userTier = req.user.role_code === 'UMKM_OWNER_PREMIUM' ? 'PREMIUM' : 'FREE';

  const menuResolution = resolveNavigationMenu(userRole, userTier);

  return res.json({
    success: true,
    message: `Navigation menu resolved for role '${userRole}'`,
    data: menuResolution
  });
});

/**
 * @route GET /api/v1/users/subscription-plans
 * @desc Get Subscription Pricing Plans & Active Subscription Status
 * @access Protected (JWT Authenticated)
 */
router.get('/subscription-plans', authenticate, (req, res) => {
  const isPremium = req.user.role_code === 'UMKM_OWNER_PREMIUM' || req.user.subscription_tier === 'PREMIUM';

  const plans = [
    {
      id: 'FREE',
      name: 'Paket GRATIS',
      price_idr: 0,
      period: 'Selamanya',
      features: [
        'Diagnosis Business Health Audit 8-Dimensi',
        'Website Toko Instan 1 Katalog (/toko/:slug)',
        '1 Hak Akses Staf Kasir POS',
        'Static QRIS Kasir Payment'
      ],
      is_current: !isPremium
    },
    {
      id: 'PREMIUM',
      name: 'Paket SAAS PREMIUM',
      price_idr: 29000,
      period: 'per Bulan (Promo Peluncuran)',
      badge: 'PROMO 74.5% MARGIN',
      features: [
        'Hak Akses Kasir Staf TANPA BATAS (Unlimited)',
        'Dynamic QRIS Kasir + Instant Callback Verification',
        'Google Maps & QR Standee Acrylic Builder',
        'Ekspor Laporan P&L Saku via WhatsApp 1-Klik',
        'Akses Masterclass & Priority Video Tutorials'
      ],
      is_current: isPremium
    }
  ];

  return res.json({
    success: true,
    data: {
      active_tier: isPremium ? 'PREMIUM' : 'FREE',
      expires_at: req.user.subscription_expires_at || null,
      plans
    }
  });
});

/**
 * @route POST /api/v1/users/subscribe
 * @desc Upgrade User Subscription Plan to SaaS Premium
 * @access Protected (JWT Authenticated)
 */
router.post('/subscribe', authenticate, async (req, res) => {
  const { plan_tier = 'PREMIUM', payment_method = 'QRIS' } = req.body;

  if (plan_tier !== 'PREMIUM') {
    return res.status(400).json({ success: false, error: 'Paket langganan tidak valid' });
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 Days Subscription

  req.user.role_code = 'UMKM_OWNER_PREMIUM';
  req.user.subscription_tier = 'PREMIUM';
  req.user.subscription_expires_at = expiryDate.toISOString();

  // Sync with Supabase DB if configured
  if (db.isSupabaseConfigured) {
    await db.updateInSupabase('users', req.user.id, {
      role_code: 'UMKM_OWNER_PREMIUM',
      subscription_tier: 'PREMIUM',
      subscription_expires_at: expiryDate.toISOString()
    });
  }

  const token = generateToken({ id: req.user.id, role_code: req.user.role_code });

  return res.json({
    success: true,
    message: '🎉 Selamat! Akun Anda Berhasil Di-upgrade ke SaaS PREMIUM (Rp 29.000/bulan)!',
    data: {
      user: req.user,
      token,
      subscription: {
        tier: 'PREMIUM',
        payment_method,
        expires_at: expiryDate.toISOString()
      }
    }
  });
});

module.exports = router;
