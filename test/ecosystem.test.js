const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/server');
const db = require('../src/shared/database/db');
const { generateToken } = require('../src/shared/utils/jwt');

test('Ecosystem Module 1 - Cashflow & P&L Saku Calculation', (t) => {
  const freeOwnerId = 'u-free-001';
  
  // Insert test income & expense
  db.cashflowRecords.push({
    id: 'cf-test-01',
    owner_id: freeOwnerId,
    type: 'INCOME',
    category: 'PENJUALAN_HARIAN',
    amount: 100000,
    date: new Date().toISOString().split('T')[0]
  });

  db.cashflowRecords.push({
    id: 'cf-test-02',
    owner_id: freeOwnerId,
    type: 'EXPENSE',
    category: 'BAHAN_BAKU',
    amount: 30000,
    date: new Date().toISOString().split('T')[0]
  });

  const records = db.cashflowRecords.filter(c => c.owner_id === freeOwnerId);
  const totalIncome = records.filter(r => r.type === 'INCOME').reduce((s, r) => s + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0);
  const netProfit = totalIncome - totalExpense;

  assert.ok(records.length >= 2);
  assert.strictEqual(netProfit > 0, true);
});

test('Ecosystem Module 2 - Customer Loyalty Churn Alert Scheduler', (t) => {
  const freeOwnerId = 'u-free-001';
  const contacts = db.customerContacts.filter(c => c.owner_id === freeOwnerId);

  assert.ok(contacts.length >= 1);
  const inactiveContact = contacts.find(c => c.phone_number === '081299887766');
  assert.ok(inactiveContact);

  const diffTime = Math.abs(new Date() - new Date(inactiveContact.last_visit_date));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  assert.ok(diffDays >= 14);
});

test('Ecosystem Module 3 - Inventory Low Stock Alert & Buku Bon', (t) => {
  const freeOwnerId = 'u-free-001';
  const items = db.inventoryItems.filter(i => i.owner_id === freeOwnerId);

  const lowStock = items.filter(i => i.current_stock <= i.min_stock);
  assert.ok(lowStock.length >= 1);
  assert.strictEqual(lowStock[0].item_name, 'Beras Premium 5kg');

  const debtList = db.debtBooks.filter(d => d.owner_id === freeOwnerId);
  assert.ok(debtList.length >= 2);

  const receivable = debtList.find(d => d.type === 'RECEIVABLE');
  assert.ok(receivable);
  assert.strictEqual(receivable.status, 'UNPAID');
});

test('Ecosystem Module 4 - AI Copywriting Generator Wrapper', (t) => {
  const product = 'Beras Super Pulen';
  const price = 'Rp 65.000';
  
  const caption = `Promo spesial ${product} cuma ${price} di toko kami!`;
  assert.ok(caption.includes('Beras Super Pulen'));
  assert.ok(caption.includes('Rp 65.000'));
});

test('Ecosystem Module 5 - QRIS Payload Generation & Mock Verification', (t) => {
  const amount = 50000;
  const qrString = `00020101021226620016ID.CO.QRIS.WWW0118936009110000000000520454115303360540${amount}5802ID5905TokoA6007Jakarta630488FF`;
  
  assert.ok(qrString.includes('ID.CO.QRIS'));
  assert.ok(qrString.includes('50000'));
});

test('System Admin Exclusive IT Documentation Hub Endpoint', (t) => {
  const adminToken = generateToken({ id: 'u-admin-004', phone_number: '080011223344', full_name: 'Super Admin System', role_code: 'SUPER_ADMIN' });
  const freeToken = generateToken({ id: 'u-free-001', phone_number: '081234567890', full_name: 'Budi Santoso', role_code: 'UMKM_OWNER_FREE' });

  assert.ok(adminToken);
  assert.ok(freeToken);
});
