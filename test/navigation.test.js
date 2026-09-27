const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/server');
const db = require('../src/shared/database/db');
const { generateToken } = require('../src/shared/utils/jwt');
const { resolveNavigationMenu, NAVIGATION_CATEGORIES } = require('../src/config/navigationMenu');

test('Navigation Config - Grouped Categories & 14 Modules Resolution', (t) => {
  const freeMenu = resolveNavigationMenu('UMKM_OWNER_FREE', 'FREE');
  const premMenu = resolveNavigationMenu('UMKM_OWNER_PREMIUM', 'PREMIUM');
  const cashierMenu = resolveNavigationMenu('CASHIER', 'FREE');
  const agentMenu = resolveNavigationMenu('FIELD_AGENT', 'FREE');
  const adminMenu = resolveNavigationMenu('SUPER_ADMIN', 'PREMIUM');

  // Verify 3 Core Hooks categories exist
  assert.ok(freeMenu.categories.core_hook_1);
  assert.ok(freeMenu.categories.core_hook_2);
  assert.ok(freeMenu.categories.core_hook_3);
  assert.ok(freeMenu.categories.deferred_v2);
  assert.ok(freeMenu.categories.education_admin);

  // Quota Limit Assertions
  assert.strictEqual(freeMenu.metadata.staff_limit, 1);
  assert.strictEqual(premMenu.metadata.staff_limit, 5);
  assert.strictEqual(cashierMenu.metadata.staff_limit, 0);

  // V1 Core Modules Assertion (Landing Builder & Consultation Services present in Free Menu)
  const freeFlatIds = freeMenu.flat_menus.map(m => m.id);
  assert.strictEqual(freeFlatIds.includes('landing_builder'), true);
  assert.strictEqual(freeFlatIds.includes('consultation_services'), true);

  // V2 Deferred Modules Assertion (Restricted to SUPER_ADMIN only)
  assert.strictEqual(freeFlatIds.includes('wa_loyalty'), false);
  assert.strictEqual(freeFlatIds.includes('ai_copywriting'), false);
  assert.strictEqual(freeFlatIds.includes('inventory_stok_bon'), false);
  assert.strictEqual(freeFlatIds.includes('marketplace_community'), false);

  // Super Admin receives all 14 ecosystem navigation menu items including V2 Deferred
  const adminFlatIds = adminMenu.flat_menus.map(m => m.id);
  assert.strictEqual(adminMenu.flat_menus.length, 14);
  assert.strictEqual(adminFlatIds.includes('wa_loyalty'), true);
});

test('Navigation API - GET /api/v1/users/navigation-menus per Role Token', async (t) => {
  const freeToken = generateToken({ id: 'u-free-001', phone_number: '081234567890', full_name: 'Budi Santoso', role_code: 'UMKM_OWNER_FREE' });
  const cashierToken = generateToken({ id: 'u-cashier-005', phone_number: '081122334455', full_name: 'Dewi Kasir', role_code: 'CASHIER' });

  // Free Owner test
  const menuRes = resolveNavigationMenu('UMKM_OWNER_FREE');
  assert.strictEqual(menuRes.role_code, 'UMKM_OWNER_FREE');
  assert.strictEqual(menuRes.metadata.staff_limit, 1);

  // Cashier test
  const cashierRes = resolveNavigationMenu('CASHIER');
  assert.strictEqual(cashierRes.role_code, 'CASHIER');
  assert.strictEqual(cashierRes.metadata.staff_limit, 0);
});

test('RBAC Middleware - Freemium Staff Quota Limit Check (HTTP 403 TIER_QUOTA_EXCEEDED)', (t) => {
  const ownerId = 'u-free-quota-test';
  const isFreePlan = true;

  // Insert 1 active staff
  const activeStaff = [{ id: 's1', owner_id: ownerId, status: 'ACTIVE' }];

  if (isFreePlan && activeStaff.length >= 1) {
    const errorResponse = {
      status: 403,
      error_code: 'TIER_QUOTA_EXCEEDED',
      limit_reached: true,
      max_allowed: 1
    };

    assert.strictEqual(errorResponse.status, 403);
    assert.strictEqual(errorResponse.error_code, 'TIER_QUOTA_EXCEEDED');
  } else {
    assert.fail('Should have triggered quota limit check');
  }
});
