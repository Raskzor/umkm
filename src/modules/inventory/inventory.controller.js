const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate } = require('../../shared/utils/rbac');

/**
 * @route GET /api/v1/inventory/items
 * @desc List all inventory items
 */
router.get('/items', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const items = db.inventoryItems.filter(i => i.owner_id === ownerId);

  return res.json({
    success: true,
    total_items: items.length,
    data: items
  });
});

/**
 * @route POST /api/v1/inventory/items
 * @desc Add or update inventory stock item
 */
router.post('/items', authenticate, (req, res) => {
  const { item_name, category, unit_price, current_stock, min_stock, supplier_name, supplier_phone } = req.body;

  if (!item_name || current_stock === undefined) {
    return res.status(400).json({ success: false, error: 'Nama Barang dan Jumlah Stok wajib diisi' });
  }

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  let item = db.inventoryItems.find(i => i.owner_id === ownerId && i.item_name.toLowerCase() === item_name.toLowerCase());

  if (item) {
    item.current_stock = Number(current_stock);
    item.unit_price = unit_price !== undefined ? Number(unit_price) : item.unit_price;
    item.min_stock = min_stock !== undefined ? Number(min_stock) : item.min_stock;
    item.supplier_name = supplier_name || item.supplier_name;
    item.supplier_phone = supplier_phone || item.supplier_phone;
    item.updated_at = new Date().toISOString();
  } else {
    item = {
      id: `inv-${Date.now()}`,
      owner_id: ownerId,
      item_name,
      category: category || 'Umum',
      unit_price: Number(unit_price) || 0,
      current_stock: Number(current_stock) || 0,
      min_stock: Number(min_stock) || 5,
      supplier_name: supplier_name || 'Distributor Utama',
      supplier_phone: supplier_phone || '',
      updated_at: new Date().toISOString()
    };
    db.inventoryItems.push(item);
  }

  return res.status(201).json({
    success: true,
    message: `Barang "${item_name}" berhasil disimpan. Stok saat ini: ${item.current_stock}`,
    data: item
  });
});

/**
 * @route GET /api/v1/inventory/low-stock-alerts
 * @desc Monitor stock levels and trigger Low Stock Alerts
 */
router.get('/low-stock-alerts', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const items = db.inventoryItems.filter(i => i.owner_id === ownerId);

  const lowStockItems = items.filter(i => i.current_stock <= i.min_stock).map(i => ({
    ...i,
    stock_status: i.current_stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK_WARNING',
    suggested_reorder_qty: Math.max(10, i.min_stock * 3)
  }));

  return res.json({
    success: true,
    low_stock_count: lowStockItems.length,
    data: lowStockItems
  });
});

/**
 * @route POST /api/v1/inventory/supplier-order-draft
 * @desc Generate automated re-order draft to WhatsApp supplier
 */
router.post('/supplier-order-draft', authenticate, (req, res) => {
  const { item_id, order_qty } = req.body;
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;

  const item = db.inventoryItems.find(i => i.id === item_id && i.owner_id === ownerId);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Barang inventaris tidak ditemukan' });
  }

  const business = db.businessProfiles.find(b => b.user_id === ownerId);
  const bizName = business ? business.business_name : 'Toko Kami';
  const qty = Number(order_qty) || Math.max(10, item.min_stock * 3);

  const cleanPhone = (item.supplier_phone || '081234567890').replace(/[^0-9]/g, '').replace(/^0/, '62');

  const draftText = `Halo *${item.supplier_name || 'Distributor'}*,\n` +
    `Saya dari *${bizName}* mau restock / pesan ulang barang berikut:\n\n` +
    `📦 Nama Barang: *${item.item_name}*\n` +
    `🔢 Jumlah Pesanan: *${qty} unit/pcs*\n` +
    `📍 Alamat Kirim: ${business ? business.address_text : 'Alamat Toko'}\n\n` +
    `Mohon infokan total ketersediaan & total tagihannya. Terima kasih! 🙏`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(draftText)}`;

  return res.json({
    success: true,
    data: {
      item_name: item.item_name,
      supplier_name: item.supplier_name,
      supplier_phone: cleanPhone,
      order_qty: qty,
      order_draft_text: draftText,
      whatsapp_order_url: waUrl
    }
  });
});

/**
 * @route GET /api/v1/inventory/debt-books
 * @desc Get debt/receivable books (Buku Bon Utang-Piutang)
 */
router.get('/debt-books', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const debts = db.debtBooks.filter(d => d.owner_id === ownerId);

  const totalReceivables = debts.filter(d => d.type === 'RECEIVABLE' && d.status === 'UNPAID').reduce((sum, d) => sum + d.amount, 0);
  const totalDebts = debts.filter(d => d.type === 'DEBT' && d.status === 'UNPAID').reduce((sum, d) => sum + d.amount, 0);

  return res.json({
    success: true,
    summary: {
      total_receivables_piutang: totalReceivables, // Orang ngutang ke toko
      total_debts_utang: totalDebts // Toko ngutang ke supplier
    },
    data: debts.reverse()
  });
});

/**
 * @route POST /api/v1/inventory/debt-books
 * @desc Record new debt/receivable entry ("Buku Bon")
 */
router.post('/debt-books', authenticate, (req, res) => {
  const { debtor_name, phone_number, type, amount, notes, due_date } = req.body;

  if (!debtor_name || !amount || !type) {
    return res.status(400).json({ success: false, error: 'Nama Pengutang, Jumlah (amount), dan Tipe (DEBT/RECEIVABLE) wajib diisi' });
  }

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const recorderName = req.user.full_name || 'Kasir Toko';

  const entry = {
    id: `debt-${Date.now()}`,
    owner_id: ownerId,
    debtor_name,
    phone_number: phone_number || '',
    type: type === 'DEBT' ? 'DEBT' : 'RECEIVABLE',
    amount: Number(amount) || 0,
    notes: notes || '',
    recorder_name: recorderName,
    due_date: due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'UNPAID',
    created_at: new Date().toISOString()
  };

  db.debtBooks.push(entry);

  return res.status(201).json({
    success: true,
    message: `Berhasil mencatat Buku Bon ${type === 'DEBT' ? 'Utang Toko' : 'Piutang Pelanggan'} a.n. "${debtor_name}" sebesar Rp ${Number(amount).toLocaleString('id-ID')}`,
    data: entry
  });
});

/**
 * @route PATCH /api/v1/inventory/debt-books/:id/pay
 * @desc Mark debt or receivable entry as PAID (Lunas)
 */
router.patch('/debt-books/:id/pay', authenticate, (req, res) => {
  const debtId = req.params.id;
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;

  const entry = db.debtBooks.find(d => d.id === debtId && d.owner_id === ownerId);
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Catatan Buku Bon tidak ditemukan' });
  }

  entry.status = 'PAID';
  entry.paid_at = new Date().toISOString();

  // Optionally add income transaction if receivable paid
  if (entry.type === 'RECEIVABLE') {
    db.cashflowRecords.push({
      id: `cf-${Date.now()}`,
      owner_id: ownerId,
      type: 'INCOME',
      category: 'PELUNASAN_BON',
      amount: entry.amount,
      notes: `Pelunasan Bon Piutang a.n. ${entry.debtor_name}`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    });
  }

  return res.json({
    success: true,
    message: `Buku Bon a.n. "${entry.debtor_name}" berhasil ditandai LUNAS!`,
    data: entry
  });
});

module.exports = router;
