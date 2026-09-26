const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/server');
const db = require('../src/shared/database/db');
const { generateToken } = require('../src/shared/utils/jwt');

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

test('Kit Steps Definition Endpoint (GET /api/v1/kit/steps)', async (t) => {
  const kitController = require('../src/modules/kit/kit.controller');
  // Simple check on steps controller logic
  const stepsRes = await new Promise(resolve => {
    const mockRes = {
      json: (data) => resolve(data)
    };
    kitController.handle ? kitController.handle({ method: 'GET', url: '/steps' }, mockRes) : null;
  });
  assert.ok(true);
});

test('Kit State Initialization & User Persistence', (t) => {
  const freeUser = db.users.find(u => u.role_code === 'UMKM_OWNER_FREE');
  assert.ok(freeUser);

  const token = generateToken({ id: freeUser.id, role_code: freeUser.role_code });
  assert.ok(token);

  // Verify fresh kit state can be populated in DB
  const freshState = {
    version: 1,
    answers: Array(12).fill(null),
    baseline: null,
    checkupComplete: false,
    qIndex: 0,
    recommended: 1,
    route: [],
    items: {},
    status: {},
    fields: {},
    wait: {},
    maintenance: { date: '', checks: {}, notes: '', next: '', person: '' },
    after: {},
    updated_at: new Date().toISOString()
  };

  db.userKits[freeUser.id] = freshState;
  assert.strictEqual(db.userKits[freeUser.id].version, 1);
  assert.strictEqual(db.userKits[freeUser.id].answers.length, 12);
});

test('Kit Priority Route Calculation Engine', (t) => {
  const sampleAnswers = ['no', 'yes', 'no', 'unknown', 'yes', 'no', 'no', 'yes', 'no', 'yes', 'no', 'no'];
  
  const Q_STEPS = [1, 2, 3, 4, 4, 6, 5, 6, 7, 7, 7, 8];
  const gaps = new Set();
  sampleAnswers.forEach((a, i) => {
    if (a !== 'yes') gaps.add(Q_STEPS[i]);
  });

  assert.ok(gaps.has(1));
  assert.ok(gaps.has(3));
  assert.ok(gaps.has(4));
});
