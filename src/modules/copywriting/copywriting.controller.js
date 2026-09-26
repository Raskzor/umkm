const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

/**
 * @route POST /api/v1/copywriting/generate
 * @desc AI prompt wrapper endpoint for generating promotional copy tailored for local UMKM
 */
router.post('/generate', authenticate, authorizeRoles('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'), async (req, res) => {
  const { promo_target, target_audience, tone_style, product_name, discount_price } = req.body;

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const business = db.businessProfiles.find(b => b.user_id === ownerId);
  const bizName = business ? business.business_name : 'Toko Kami';
  const category = business ? business.category : 'Kuliner & Retail';

  const product = product_name || 'Produk Unggulan Kami';
  const price = discount_price || 'Harga Promo Spesial';
  const tone = tone_style || 'SANTAI_LOKAL'; // SANTAI_LOKAL, FORMAL_RAMAH, ANTUSIAS_SERU

  let captionWAStatus = '';
  let captionMedsos = '';
  let hashtags = '';

  if (tone === 'SANTAI_LOKAL') {
    captionWAStatus = `Halo warga sekitar! 👋\n` +
      `Ada promo spesial nih hari ini di *${bizName}*! 🔥\n\n` +
      `📌 *${product}* lagi promo cuma *${price}* aja!\n` +
      `Cocok banget buat nemenin santai hari ini. Stok terbatas ya kak!\n\n` +
      `📍 Langsung mampir ke toko atau order via WA di sini ya! 👇`;

    captionMedsos = `Mampir yuk ke @${bizName.toLowerCase().replace(/[^a-z0-9]+/g, '')}! ☕✨\n\n` +
      `Promo spesial ${category} terbaik di area tempatmu:\n` +
      `✨ ${product} -> ${price}\n\n` +
      `Jangan sampai kehabisan promo terbatas minggu ini! Tautkan link di bio untuk order instan.`;
  } else if (tone === 'ANTUSIAS_SERU') {
    captionWAStatus = `🔥 PROMO BOMBANTIS HARI INI DI ${bizName.toUpperCase()}! 🔥\n\n` +
      `Buat kamu yang nyari ${category} berkualitas, nikmati promo *${product}* dengan harga spesial *${price}*!\n\n` +
      `⚡ Buruan samperin toko sebelum kehabisan!`;

    captionMedsos = `💥 PROMO SPESIAL UNTUKMU HARI INI! 💥\n\n` +
      `Dapatkan ${product} harga miring cuma ${price} di ${bizName}.\n` +
      `Ajak teman & keluargamu mampir sekarang juga!`;
  } else {
    captionWAStatus = `Selamat hari ini Kak! 🙏\n\n` +
      `Kami dari *${bizName}* menghadirkan promo penawaran istimewa *${product}* seharga *${price}*.\n\n` +
      `Silakan hubungi kami untuk reservasi / pemesanan instan. Terima kasih.`;

    captionMedsos = `Penawaran Istimewa dari ${bizName}.\n\n` +
      `Nikmati ketersediaan ${product} dengan harga spesial ${price}.\n` +
      `Informasi selengkapnya dapat diakses melalui link Google Maps di bio kami.`;
  }

  hashtags = `#${bizName.replace(/[^a-zA-Z0-9]+/g, '')} #UMKMNaikKelas #KulinerLokal #PromoUMKM #TokoLokal`;

  return res.json({
    success: true,
    data: {
      business_name: bizName,
      product_name: product,
      tone_style: tone,
      whatsapp_status_copy: captionWAStatus,
      social_media_caption: captionMedsos,
      suggested_hashtags: hashtags
    }
  });
});

/**
 * @route POST /api/v1/copywriting/promo-poster
 * @desc Data generator template for visual promo poster linking product photo, business name, and Google Maps URL
 */
router.post('/promo-poster', authenticate, authorizeRoles('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'), (req, res) => {
  const { product_name, promo_headline, discount_text, product_image_url } = req.body;

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const business = db.businessProfiles.find(b => b.user_id === ownerId);
  const bizName = business ? business.business_name : 'Toko UMKM';
  const gmapsUrl = business ? business.gmaps_url : 'https://maps.google.com';

  const posterData = {
    id: `poster-${Date.now()}`,
    business_name: bizName,
    product_name: product_name || 'Produk Unggulan',
    promo_headline: promo_headline || 'PROMO SPESIAL MINGGU INI',
    discount_text: discount_text || 'Diskon 20% / Paket Hemat',
    product_image_url: product_image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    gmaps_url: gmapsUrl,
    qr_code_gmaps: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gmapsUrl)}`,
    template_badge: 'PROMO_SEMBILAN_SEMISAL'
  };

  return res.json({
    success: true,
    data: posterData
  });
});

module.exports = router;
