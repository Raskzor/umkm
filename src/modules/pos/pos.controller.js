const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

// 1. Assign New Cashier / Staff (Anak Buah)
router.post('/staff', authenticate, authorizeRoles('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'), (req, res) => {
  const { staff_name, phone_number, address, role_title, pin, allowed_permissions } = req.body;

  if (!staff_name || !phone_number) {
    return res.status(400).json({
      success: false,
      error: 'Nama Staf / Anak Buah dan Nomor WhatsApp wajib diisi'
    });
  }

  const ownerId = req.user.id;
  const isFreePlan = req.user.role_code === 'UMKM_OWNER_FREE';

  // Count existing active staff assigned to this owner
  const activeStaff = db.posStaff.filter(s => s.owner_id === ownerId && s.status === 'ACTIVE');

  // Enforce Freemium Limit: Free Plan allows max 1 cashier staff
  if (isFreePlan && activeStaff.length >= 1) {
    return res.status(403).json({
      success: false,
      error_code: 'TIER_QUOTA_EXCEEDED',
      error: 'Batas maksimum Paket GRATIS adalah 1 Anak Buah / Kasir. Upgrade ke Paket PREMIUM untuk menambahkan Kasir tanpa batas!',
      limit_reached: true,
      max_allowed: 1,
      current_assigned: activeStaff.length,
      current_tier: 'UMKM_OWNER_FREE'
    });
  }

  // Create Cashier User & Staff Entry
  const newUserId = `u-cashier-${Date.now()}`;
  const newStaffId = `staff-${Date.now()}`;
  const staffPin = pin || '1234';

  const newUser = {
    id: newUserId,
    phone_number,
    full_name: `${staff_name} (${role_title || 'Kasir'})`,
    role_code: 'CASHIER',
    owner_id: ownerId,
    pin: staffPin,
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  };

  const newStaff = {
    id: newStaffId,
    owner_id: ownerId,
    user_id: newUserId,
    staff_name,
    phone_number,
    address: address || 'Tempat Tinggal Staf',
    role_title: role_title || 'Kasir Toko',
    pin: staffPin,
    allowed_permissions: Array.isArray(allowed_permissions) ? allowed_permissions : ['pos_instant', 'qris_payment'],
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  db.posStaff.push(newStaff);

  const updatedActiveStaff = db.posStaff.filter(s => s.owner_id === ownerId && s.status === 'ACTIVE');

  return res.status(201).json({
    success: true,
    message: `Berhasil menambahkan staf kasir "${staff_name}".`,
    data: {
      staff: newStaff,
      quota_summary: {
        assigned_count: updatedActiveStaff.length,
        max_allowed: isFreePlan ? 1 : 'UNLIMITED',
        current_tier: req.user.role_code
      }
    }
  });
});

// 2. Get Staff List & Plan Limit Metadata
router.get('/staff', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const ownerUser = db.users.find(u => u.id === ownerId) || req.user;
  const isFreePlan = ownerUser.role_code === 'UMKM_OWNER_FREE';

  let staffList = db.posStaff.filter(s => s.owner_id === ownerId || req.user.role_code === 'SUPER_ADMIN');

  return res.json({
    success: true,
    data: {
      staff_list: staffList,
      quota_summary: {
        assigned_count: staffList.filter(s => s.status === 'ACTIVE').length,
        max_allowed: isFreePlan ? 1 : 'UNLIMITED',
        is_free_tier: isFreePlan,
        can_add_more: !isFreePlan || staffList.filter(s => s.status === 'ACTIVE').length < 1
      }
    }
  });
});

// Update Staff & Access Permissions
router.put('/staff/:id', authenticate, authorizeRoles('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'), (req, res) => {
  const staffId = req.params.id;
  const staff = db.posStaff.find(s => s.id === staffId && (s.owner_id === req.user.id || req.user.role_code === 'SUPER_ADMIN'));

  if (!staff) {
    return res.status(404).json({ success: false, error: 'Data staf tidak ditemukan' });
  }

  const { staff_name, phone_number, address, role_title, pin, allowed_permissions, status } = req.body;

  if (staff_name) staff.staff_name = staff_name;
  if (phone_number) staff.phone_number = phone_number;
  if (address !== undefined) staff.address = address;
  if (role_title !== undefined) staff.role_title = role_title;
  if (pin) staff.pin = pin;
  if (allowed_permissions) staff.allowed_permissions = allowed_permissions;
  if (status) staff.status = status;

  return res.json({
    success: true,
    message: `Berhasil memperbarui data & hak akses staf "${staff.staff_name}".`,
    data: staff
  });
});

// 3. Delete / Deactivate Staff
router.delete('/staff/:id', authenticate, authorizeRoles('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'), (req, res) => {
  const staffId = req.params.id;
  const staffIndex = db.posStaff.findIndex(s => s.id === staffId && (s.owner_id === req.user.id || req.user.role_code === 'SUPER_ADMIN'));

  if (staffIndex === -1) {
    return res.status(404).json({ success: false, error: 'Data staf tidak ditemukan' });
  }

  const staff = db.posStaff[staffIndex];
  staff.status = 'INACTIVE';

  const userObj = db.users.find(u => u.id === staff.user_id);
  if (userObj) userObj.status = 'INACTIVE';

  return res.json({
    success: true,
    message: `Staf kasir "${staff.staff_name}" berhasil dinonaktifkan.`
  });
});

// 4. Process Sale Transaction (POS Checkout)
router.post('/transactions', authenticate, (req, res) => {
  const { items, payment_method, customer_name, customer_address, paid_amount, notes, discount_amount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Keranjang belanja tidak boleh kosong' });
  }

  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const business = db.businessProfiles.find(b => b.user_id === ownerId);
  const businessName = business ? business.business_name : 'Karis Jaya Shop';
  const businessAddress = business ? business.address_text : 'Jl. Dr. Ir. H. Soekarno No.19,Medokan Semampir Surabaya';
  const businessPhone = '0812345678';

  let totalQty = 0;
  let subtotal = 0;
  const formattedItems = items.map((item, idx) => {
    const itemQty = Number(item.qty) || 1;
    const itemPrice = Number(item.price) || 0;
    const itemSubtotal = itemQty * itemPrice;
    subtotal += itemSubtotal;
    totalQty += itemQty;
    return {
      index: idx + 1,
      name: item.name || 'Produk',
      price: itemPrice,
      qty: itemQty,
      unit: item.unit || 'pcs',
      subtotal: itemSubtotal
    };
  });

  const discount = Number(discount_amount) || 0;
  const totalAmount = Math.max(0, subtotal - discount);
  const paid = Number(paid_amount) || totalAmount;
  const change = Math.max(0, paid - totalAmount);

  const txCount = db.posTransactions.length + 1;
  const receiptNo = `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
  const queueNo = `No.0-${txCount}`;

  const cashierName = req.user.full_name || 'karis (Sheila)';

  const transaction = {
    id: `TX-${txCount}`,
    receipt_no: receiptNo,
    queue_no: queueNo,
    owner_id: ownerId,
    cashier_id: req.user.id,
    cashier_name: cashierName,
    business_name: businessName,
    business_address: businessAddress,
    business_phone: businessPhone,
    customer_name: customer_name || 'Sheila',
    customer_address: customer_address || 'Jl. Diponegoro 1, Sby',
    items: formattedItems,
    total_qty: totalQty,
    subtotal,
    discount,
    total_amount: totalAmount,
    paid_amount: paid,
    change_amount: change,
    payment_method: payment_method || 'Cash',
    notes: notes || '',
    created_at: new Date().toISOString()
  };

  db.posTransactions.push(transaction);

  return res.status(201).json({
    success: true,
    message: 'Transaksi berhasil diproses!',
    data: {
      receipt: transaction
    }
  });
});

// 5. Get Sales History & Summary Report
router.get('/transactions', authenticate, (req, res) => {
  const ownerId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;
  const history = db.posTransactions.filter(t => t.owner_id === ownerId || req.user.role_code === 'SUPER_ADMIN');

  const totalRevenue = history.reduce((sum, t) => sum + t.total_amount, 0);
  const totalOrders = history.length;

  return res.json({
    success: true,
    data: {
      transactions: history.reverse(),
      summary: {
        total_revenue: totalRevenue,
        total_orders: totalOrders
      }
    }
  });
});

module.exports = router;
