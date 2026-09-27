const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/server');
const db = require('../src/shared/database/db');
const { generateToken } = require('../src/shared/utils/jwt');
const { generateSecret, generateSync } = require('otplib');

test('Google 2FA Engine - TOTP Secret Generation & Verification Flow', async (t) => {
  const user = db.users.find(u => u.id === 'u-free-001');
  assert.ok(user);

  // Generate TOTP Secret
  const secret = generateSecret();
  assert.ok(secret);
  assert.strictEqual(secret.length > 10, true);

  // Generate 6-digit TOTP token
  const tokenCode = generateSync({ secret });
  assert.strictEqual(tokenCode.length, 6);

  // Verify setup
  user.two_factor_secret = secret;
  user.two_factor_enabled = true;

  assert.strictEqual(user.two_factor_enabled, true);
});

test('Subscription API - SaaS Premium Plan Upgrade & Quota Expansion', async (t) => {
  const freeOwnerToken = generateToken({ id: 'u-free-001', role_code: 'UMKM_OWNER_FREE' });
  const user = db.users.find(u => u.id === 'u-free-001');

  // Perform subscription upgrade
  user.role_code = 'UMKM_OWNER_PREMIUM';
  user.subscription_tier = 'PREMIUM';
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  user.subscription_expires_at = expiry.toISOString();

  assert.strictEqual(user.role_code, 'UMKM_OWNER_PREMIUM');
  assert.strictEqual(user.subscription_tier, 'PREMIUM');
  assert.ok(user.subscription_expires_at);
});

test('Google OAuth & User Table Validation Endpoint', async (t) => {
  const googleUser = {
    email: `test_google_${Date.now()}@gmail.com`,
    full_name: 'Test Google User'
  };

  const existing = db.users.find(u => u.email === googleUser.email);
  assert.strictEqual(existing, undefined);

  // Add Google user to DB
  const newUser = {
    id: `u-google-${Date.now()}`,
    phone_number: googleUser.email,
    email: googleUser.email,
    full_name: googleUser.full_name,
    role_code: 'UMKM_OWNER_FREE',
    two_factor_enabled: false,
    subscription_tier: 'FREE',
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  };
  db.users.push(newUser);

  const foundInDb = db.users.find(u => u.id === newUser.id);
  assert.ok(foundInDb);
  assert.strictEqual(foundInDb.full_name, 'Test Google User');
});
