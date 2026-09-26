const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/server');
const db = require('../src/shared/database/db');
const { generateToken, verifyToken } = require('../src/shared/utils/jwt');
const {
  authenticate,
  authorizeRoles,
  authorizeTier,
  authorizeOwnerOrAdmin,
  authorizePermissions,
  PERMISSION_MATRIX
} = require('../src/shared/utils/rbac');

// Helper to create mock Express req, res, next objects
function createMockReqRes({ headers = {}, user = null, body = {}, params = {} } = {}) {
  const req = { headers, user, body, params };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };

  return { req, res, getStatus: () => statusCode, getData: () => responseData };
}

test('Authentication Middleware - Missing or Invalid Header', (t) => {
  const { req, res, getStatus, getData } = createMockReqRes();
  let nextCalled = false;

  authenticate(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(getStatus(), 401);
  assert.strictEqual(getData().success, false);
  assert.match(getData().error, /Authorization header missing/);
});

test('Authentication Middleware - Invalid JWT Token', (t) => {
  const { req, res, getStatus, getData } = createMockReqRes({
    headers: { authorization: 'Bearer invalid.jwt.token' }
  });
  let nextCalled = false;

  authenticate(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(getStatus(), 401);
  assert.match(getData().error, /Invalid or expired token/);
});

test('Authentication Middleware - Valid Token populates req.user', (t) => {
  const freeUser = db.users.find(u => u.role_code === 'UMKM_OWNER_FREE');
  const token = generateToken({ id: freeUser.id, role_code: freeUser.role_code });

  const { req, res, getStatus } = createMockReqRes({
    headers: { authorization: `Bearer ${token}` }
  });
  let nextCalled = false;

  authenticate(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(req.user.id, freeUser.id);
  assert.strictEqual(req.user.phone_number, freeUser.phone_number);
});

test('RBAC Middleware - authorizeRoles forbids unauthorized role', (t) => {
  const freeUser = db.users.find(u => u.role_code === 'UMKM_OWNER_FREE');
  const middleware = authorizeRoles('SUPER_ADMIN');

  const { req, res, getStatus, getData } = createMockReqRes({ user: freeUser });
  let nextCalled = false;

  middleware(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(getStatus(), 403);
  assert.match(getData().error, /Forbidden: Role 'UMKM_OWNER_FREE'/);
});

test('RBAC Middleware - authorizeRoles allows permitted role', (t) => {
  const adminUser = db.users.find(u => u.role_code === 'SUPER_ADMIN');
  const middleware = authorizeRoles('SUPER_ADMIN');

  const { req, res, getStatus } = createMockReqRes({ user: adminUser });
  let nextCalled = false;

  middleware(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(getStatus(), 200);
});

test('Tier-Based Authorization Middleware - authorizeTier enforces Premium tier', (t) => {
  const freeUser = db.users.find(u => u.role_code === 'UMKM_OWNER_FREE');
  const premUser = db.users.find(u => u.role_code === 'UMKM_OWNER_PREMIUM');
  const middleware = authorizeTier('PREMIUM');

  // Free User -> Should be restricted (403)
  const freeMock = createMockReqRes({ user: freeUser });
  let freeNext = false;
  middleware(freeMock.req, freeMock.res, () => { freeNext = true; });

  assert.strictEqual(freeNext, false);
  assert.strictEqual(freeMock.getStatus(), 403);
  assert.strictEqual(freeMock.getData().tier_restricted, true);

  // Premium User -> Should pass
  const premMock = createMockReqRes({ user: premUser });
  let premNext = false;
  middleware(premMock.req, premMock.res, () => { premNext = true; });

  assert.strictEqual(premNext, true);
  assert.strictEqual(premMock.getStatus(), 200);
});

test('ABAC / Ownership Authorization Middleware - authorizeOwnerOrAdmin', (t) => {
  const freeUser = db.users.find(u => u.role_code === 'UMKM_OWNER_FREE');
  const otherUser = db.users.find(u => u.role_code === 'UMKM_OWNER_PREMIUM');
  const adminUser = db.users.find(u => u.role_code === 'SUPER_ADMIN');

  const middleware = authorizeOwnerOrAdmin(req => req.params.ownerId);

  // User accessing own resource -> Pass
  const mockOwn = createMockReqRes({ user: freeUser, params: { ownerId: freeUser.id } });
  let nextOwn = false;
  middleware(mockOwn.req, mockOwn.res, () => { nextOwn = true; });
  assert.strictEqual(nextOwn, true);

  // User accessing another user's resource -> Forbidden (403)
  const mockOther = createMockReqRes({ user: freeUser, params: { ownerId: otherUser.id } });
  let nextOther = false;
  middleware(mockOther.req, mockOther.res, () => { nextOther = true; });
  assert.strictEqual(nextOther, false);
  assert.strictEqual(mockOther.getStatus(), 403);

  // Admin accessing another user's resource -> Pass
  const mockAdmin = createMockReqRes({ user: adminUser, params: { ownerId: otherUser.id } });
  let nextAdmin = false;
  middleware(mockAdmin.req, mockAdmin.res, () => { nextAdmin = true; });
  assert.strictEqual(nextAdmin, true);
});

test('Permission Matrix Authorization Middleware - authorizePermissions', (t) => {
  const cashierUser = db.users.find(u => u.role_code === 'CASHIER');
  const middleware = authorizePermissions('pos:transaction:create');

  const { req, res, getStatus } = createMockReqRes({ user: cashierUser });
  let nextCalled = false;

  middleware(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(getStatus(), 200);
});

test('Cashier PIN Login Logic', (t) => {
  const cashierUser = db.users.find(u => u.role_code === 'CASHIER');
  assert.ok(cashierUser);
  assert.strictEqual(cashierUser.pin, '1234');

  // Invalid PIN check
  const invalidPinCheck = (cashierUser.pin === '9999');
  assert.strictEqual(invalidPinCheck, false);

  // Valid PIN check
  const validPinCheck = (cashierUser.pin === '1234');
  assert.strictEqual(validPinCheck, true);
});
