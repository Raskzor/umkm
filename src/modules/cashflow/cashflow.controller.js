const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate } = require('../../shared/utils/rbac');

/**
 * @route POST /api/v1/cashflow/records
 * @desc Record new daily income or expense entry
 */
router.post('/records', authenticate, (req, res) => {
  const { type, category, amount, notes, date } = req.body;

  if (!type || !amount || !category) {
    return res.status(400).json({
      success: false,
      error: 'Tipe (INCOME/EXPENSE), Kategori, dan Jumlah (amount) wajib diisi'
    });
  }

  const validTypes = ['INCOME', 'EXPENSE'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ success: false, error: 'Tipe harus INCOME atau EXPENSE' });
  }

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;

  const record = {
    id: `cf-${Date.now()}`,
    owner_id: ownerId,
    type,
    category: category || 'LAINNYA',
    amount: Number(amount) || 0,
    notes: notes || '',
    date: date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  db.cashflowRecords.push(record);

  return res.status(201).json({
    success: true,
    message: `Berhasil mencatat ${type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'} sebesar Rp ${Number(amount).toLocaleString('id-ID')}`,
    data: record
  });
});

/**
 * @route GET /api/v1/cashflow/records
 * @desc Get list of cashflow records
 */
router.get('/records', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const records = db.cashflowRecords.filter(c => c.owner_id === ownerId);

  return res.json({
    success: true,
    data: records.reverse()
  });
});

/**
 * @route GET /api/v1/cashflow/pnl
 * @desc 1-Click P&L (Profit & Loss / Laba Rugi Saku) Summary Calculation
 */
router.get('/pnl', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const records = db.cashflowRecords.filter(c => c.owner_id === ownerId);

  // Combine POS transactions revenue into total income
  const posTx = db.posTransactions.filter(t => t.owner_id === ownerId);
  const posRevenue = posTx.reduce((sum, t) => sum + t.total_amount, 0);

  let totalIncome = posRevenue;
  let totalExpense = 0;

  const categoryBreakdown = {};

  records.forEach(r => {
    if (r.type === 'INCOME') {
      totalIncome += r.amount;
    } else {
      totalExpense += r.amount;
    }

    categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + r.amount;
  });

  const netProfit = totalIncome - totalExpense;
  const profitMarginPercent = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const business = db.businessProfiles ? db.businessProfiles.find(b => b.user_id === ownerId) : null;
  const businessName = business ? business.business_name : 'Toko UMKM';

  return res.json({
    success: true,
    data: {
      business_name: businessName,
      summary: {
        total_income: totalIncome,
        pos_revenue: posRevenue,
        total_expense: totalExpense,
        net_profit: netProfit,
        profit_margin_percent: profitMarginPercent,
        status: netProfit >= 0 ? 'UNTHUNTUNG (SURPLUS)' : 'RUGI (DEFISIT)'
      },
      category_breakdown: categoryBreakdown
    }
  });
});

/**
 * @route POST /api/v1/cashflow/export-wa
 * @desc Export P&L report text snippet formatted for WhatsApp sharing
 */
router.post('/export-wa', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const records = db.cashflowRecords.filter(c => c.owner_id === ownerId);
  const posTx = db.posTransactions.filter(t => t.owner_id === ownerId);
  const posRevenue = posTx.reduce((sum, t) => sum + t.total_amount, 0);

  let totalIncome = posRevenue;
  let totalExpense = 0;

  records.forEach(r => {
    if (r.type === 'INCOME') totalIncome += r.amount;
    else totalExpense += r.amount;
  });

  const netProfit = totalIncome - totalExpense;
  const business = db.businessProfiles.find(b => b.user_id === ownerId);
  const bizName = business ? business.business_name : 'Usaha UMKM';
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const text = `📊 *LAPORAN LABA/RUGI SAKU (P&L)*\n` +
    `🏪 Usaha: *${bizName}*\n` +
    `📅 Tanggal: ${dateStr}\n` +
    `----------------------------------------\n` +
    `🟢 Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}\n` +
    `🔴 Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}\n` +
    `----------------------------------------\n` +
    `💰 *LABA BERSIH*: Rp ${netProfit.toLocaleString('id-ID')} (${netProfit >= 0 ? 'UNTUNG ✅' : 'DEFISIT ⚠️'})\n\n` +
    `_Diproses via SuperUMKM Cashflow Engine_`;

  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

  return res.json({
    success: true,
    data: {
      report_text: text,
      whatsapp_share_url: waShareUrl
    }
  });
});

module.exports = router;
