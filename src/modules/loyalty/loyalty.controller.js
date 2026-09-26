const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate } = require('../../shared/utils/rbac');

/**
 * @route GET /api/v1/loyalty/contacts
 * @desc Get all customer contacts harvested automatically from receipts or review scans
 */
router.get('/contacts', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const contacts = db.customerContacts.filter(c => c.owner_id === ownerId);

  return res.json({
    success: true,
    total_contacts: contacts.length,
    data: contacts
  });
});

/**
 * @route POST /api/v1/loyalty/contacts
 * @desc Add or update customer contact record
 */
router.post('/contacts', authenticate, (req, res) => {
  const { customer_name, phone_number, source, spent_amount } = req.body;

  if (!customer_name || !phone_number) {
    return res.status(400).json({ success: false, error: 'Nama Pelanggan dan Nomor WhatsApp wajib diisi' });
  }

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  let contact = db.customerContacts.find(c => c.owner_id === ownerId && c.phone_number === phone_number);

  if (contact) {
    contact.customer_name = customer_name;
    contact.total_visits = (contact.total_visits || 1) + 1;
    contact.total_spent = (contact.total_spent || 0) + (Number(spent_amount) || 0);
    contact.last_visit_date = new Date().toISOString();
  } else {
    contact = {
      id: `cnt-${Date.now()}`,
      owner_id: ownerId,
      customer_name,
      phone_number,
      source: source || 'POS_RECEIPT',
      total_visits: 1,
      total_spent: Number(spent_amount) || 0,
      last_visit_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    db.customerContacts.push(contact);
  }

  return res.status(201).json({
    success: true,
    message: `Kontak pelanggan "${customer_name}" berhasil disimpan.`,
    data: contact
  });
});

/**
 * @route GET /api/v1/loyalty/churn-alerts
 * @desc Identify inactive customers (churn alert logic: days since last visit > threshold)
 */
router.get('/churn-alerts', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const thresholdDays = Number(req.query.days) || 14;

  const now = new Date();
  const contacts = db.customerContacts.filter(c => c.owner_id === ownerId);

  const churnedCustomers = contacts.filter(c => {
    const lastVisit = new Date(c.last_visit_date);
    const diffTime = Math.abs(now - lastVisit);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= thresholdDays;
  }).map(c => {
    const lastVisit = new Date(c.last_visit_date);
    const diffDays = Math.ceil(Math.abs(now - lastVisit) / (1000 * 60 * 60 * 24));
    return {
      ...c,
      days_inactive: diffDays,
      status_alert: diffDays > 30 ? 'CRITICAL_CHURN' : 'WARNING_CHURN'
    };
  });

  return res.json({
    success: true,
    threshold_days: thresholdDays,
    total_churned: churnedCustomers.length,
    data: churnedCustomers
  });
});

/**
 * @route POST /api/v1/loyalty/broadcast-link
 * @desc Generate wa.me promotional message link for targeted customer
 */
router.post('/broadcast-link', authenticate, (req, res) => {
  const { phone_number, customer_name, promo_title, promo_code, discount_text } = req.body;

  if (!phone_number || !customer_name) {
    return res.status(400).json({ success: false, error: 'Nomor WhatsApp dan Nama Pelanggan wajib diisi' });
  }

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const business = db.businessProfiles.find(b => b.user_id === ownerId);
  const bizName = business ? business.business_name : 'Toko Kami';

  const cleanPhone = phone_number.replace(/[^0-9]/g, '').replace(/^0/, '62');
  const title = promo_title || 'Kangen Belanja di Toko Kami!';
  const promo = promo_code || 'PROMO-KANGEN';
  const discount = discount_text || 'Diskon 10% / Gratis Ongkir';

  const message = `Halo Kak *${customer_name}*, ${title} 😊\n\n` +
    `Sudah lama nih Kakak tidak mampir ke *${bizName}*. Kami ada promo spesial khusus untuk Kakak:\n` +
    `🎟️ Kode Voucher: *${promo}*\n` +
    `🎁 Benefit: *${discount}*\n\n` +
    `Tunjukkan pesan ini saat transaksi kasir berikutnya ya Kak! Ditunggu kedatangannya. Terima kasih! 🙏`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return res.json({
    success: true,
    data: {
      customer_name,
      target_phone: cleanPhone,
      message_template: message,
      click_to_chat_url: waUrl
    }
  });
});

module.exports = router;
