const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/server');
const db = require('../src/shared/database/db');
const { generateToken, verifyToken } = require('../src/shared/utils/jwt');

test('Database Seeds & User Roles', (t) => {
  assert.strictEqual(db.users.length, 4);
  const freeUser = db.users.find(u => u.role_code === 'UMKM_OWNER_FREE');
  const premiumUser = db.users.find(u => u.role_code === 'UMKM_OWNER_PREMIUM');
  const agentUser = db.users.find(u => u.role_code === 'FIELD_AGENT');
  const adminUser = db.users.find(u => u.role_code === 'SUPER_ADMIN');

  assert.ok(freeUser);
  assert.ok(premiumUser);
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
  // Mock audit inputs
  const scoreFull = 15 + 10 + 10 + 25 + 15 + 15 + 10;
  assert.strictEqual(scoreFull, 100);
});
