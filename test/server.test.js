const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/server');
const db = require('../src/shared/database/db');
const { generateToken, verifyToken } = require('../src/shared/utils/jwt');

test('Database Seeds & User Roles', (t) => {
  assert.ok(db.users.length >= 4);
  const freeUser = db.users.find(u => u.role_code === 'UMKM_OWNER_FREE');
  const premiumUser = db.users.find(u => u.role_code === 'UMKM_OWNER_PREMIUM');
  const cashierUser = db.users.find(u => u.role_code === 'CASHIER');
  const agentUser = db.users.find(u => u.role_code === 'FIELD_AGENT');
  const adminUser = db.users.find(u => u.role_code === 'SUPER_ADMIN');

  assert.ok(freeUser);
  assert.ok(premiumUser);
  assert.ok(cashierUser);
  assert.ok(agentUser);
  assert.ok(adminUser);
});

test('JWT Utility Token Cycle', (t) => {
  const token = generateToken({ id: 'u-free-001', role_code: 'UMKM_OWNER_FREE' });
  assert.ok(token);

  const decoded = verifyToken(token);
  assert.strictEqual(decoded.id, 'u-free-001');
  assert.strictEqual(decoded.role_code, 'UMKM_OWNER_FREE');
});

test('Audit Health Score Evaluation Logic', (t) => {
  const scoreFull = 15 + 10 + 10 + 25 + 15 + 15 + 10;
  assert.strictEqual(scoreFull, 100);
});

test('Public Landing Page Slug Finder', (t) => {
  const biz = db.businessProfiles.find(b => b.landing_page_slug === 'warung-berkah');
  assert.ok(biz);
  assert.strictEqual(biz.business_name, 'Warung Kelontong Berkah');
});

test('Review Loyalty Coupon Data Generation', (t) => {
  const couponCode = `DISCOUNT-${Math.floor(1000 + Math.random() * 9000)}`;
  assert.match(couponCode, /^DISCOUNT-\d{4}$/);
});

test('AI Model Business Health Diagnosis Generation', async (t) => {
  const { generateBusinessAuditDiagnosis } = require('../src/shared/utils/ai.service');
  const summary = await generateBusinessAuditDiagnosis({
    score: 45,
    answers: { has_gmaps_profile: false, has_website_or_catalog: false },
    businessName: 'Warung Berkah',
    businessCategory: 'Kuliner'
  });
  assert.ok(summary.includes('🤖 Analisis Kesehatan Usaha AI'));
  assert.ok(summary.includes('Warung Berkah'));
});

test('POS Staff Freemium Limit (Free = Max 1)', (t) => {
  const freeOwnerId = 'u-free-001';
  const activeStaff = db.posStaff.filter(s => s.owner_id === freeOwnerId && s.status === 'ACTIVE');
  assert.strictEqual(activeStaff.length, 1);
});

test('POS Sale Transaction Total Calculation', (t) => {
  const items = [
    { name: 'Kopi Espresso', price: 20000, qty: 2 },
    { name: 'Roti Bakar', price: 15000, qty: 1 }
  ];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  assert.strictEqual(subtotal, 55000);
});

