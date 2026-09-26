const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate } = require('../../shared/utils/rbac');

/**
 * @route POST /api/v1/qris/generate
 * @desc Generate dynamic / static QRIS payment payload & QR Code SVG for POS checkout
 */
router.post('/generate', authenticate, (req, res) => {
  const { amount, transaction_id, is_dynamic } = req.body;

  if (!amount) {
    return res.status(400).json({ success: false, error: 'Jumlah Tagihan (amount) wajib diisi' });
  }

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const business = db.businessProfiles.find(b => b.user_id === ownerId);
  const bizName = business ? business.business_name : 'SuperUMKM Merchant';

  const txId = transaction_id || `qris-${Date.now()}`;
  const totalAmount = Number(amount) || 0;

  // National QRIS Spec EMVCo Format String Payload Generation
  const qrString = `00020101021226620016ID.CO.QRIS.WWW0118936009110000000000520454115303360540${totalAmount}5802ID59${bizName.length.toString().padStart(2, '0')}${bizName}6007Jakarta630488FF`;
  const qrCodeSvg = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;

  const qrisTx = {
    id: txId,
    owner_id: ownerId,
    amount: totalAmount,
    merchant_name: bizName,
    qr_string: qrString,
    qr_code_svg: qrCodeSvg,
    is_dynamic: is_dynamic !== false,
    status: 'PENDING',
    created_at: new Date().toISOString()
  };

  db.qrisTransactions.push(qrisTx);

  return res.status(201).json({
    success: true,
    message: `QRIS Dinamis Rp ${totalAmount.toLocaleString('id-ID')} berhasil dihasilkan`,
    data: qrisTx
  });
});

/**
 * @route POST /api/v1/qris/verify-mock
 * @desc Mock payment handler/listener auto-verifying payment status instantly without manual transfer check
 */
router.post('/verify-mock', authenticate, (req, res) => {
  const { qris_id, auto_approve } = req.body;

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const qrisTx = db.qrisTransactions.find(q => q.id === qris_id && q.owner_id === ownerId);

  if (!qrisTx) {
    return res.status(404).json({ success: false, error: 'Transaksi QRIS tidak ditemukan' });
  }

  if (auto_approve !== false) {
    qrisTx.status = 'SUCCESS';
    qrisTx.paid_at = new Date().toISOString();

    // Auto-record to Cashflow Pemasukan & POS Sale Transaction if not present
    db.cashflowRecords.push({
      id: `cf-${Date.now()}`,
      owner_id: ownerId,
      type: 'INCOME',
      category: 'PENJUALAN_QRIS',
      amount: qrisTx.amount,
      notes: `Pembayaran QRIS Berhasil (ID: ${qrisTx.id})`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    });
  }

  return res.json({
    success: true,
    message: `Verifikasi Pembayaran QRIS Selesai: STATUS ${qrisTx.status}`,
    data: {
      qris_id: qrisTx.id,
      amount: qrisTx.amount,
      status: qrisTx.status,
      paid_at: qrisTx.paid_at
    }
  });
});

/**
 * @route GET /api/v1/qris/status/:id
 * @desc Check current status of QRIS transaction
 */
router.get('/status/:id', authenticate, (req, res) => {
  const qrisId = req.params.id;
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;

  const qrisTx = db.qrisTransactions.find(q => q.id === qrisId && q.owner_id === ownerId);
  if (!qrisTx) {
    return res.status(404).json({ success: false, error: 'Transaksi QRIS tidak ditemukan' });
  }

  return res.json({
    success: true,
    data: qrisTx
  });
});

module.exports = router;
