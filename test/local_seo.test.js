const test = require('node:test');
const assert = require('node:assert');
const {
  generateLocalKeywords,
  getGMBMappingForCategory,
  calculateNAPConsistency,
  calculatePostScheduleStatus
} = require('../src/shared/utils/localSeoHelpers');

test('Local Keyword Injector - Generates Title & Description', (t) => {
  const result = generateLocalKeywords({
    business_name: 'Warung Sate Bu Siti',
    core_product: 'Sate Kambing Muda',
    location_street_or_district: 'Antasari'
  });

  assert.strictEqual(result.suggested_title, 'Warung Sate Bu Siti - Sate Kambing Muda Antasari');
  assert.ok(result.suggested_description.includes('Sate Kambing Muda'));
  assert.ok(result.suggested_description.includes('Antasari'));
  assert.ok(Array.isArray(result.keywords));
  assert.ok(result.keywords.length >= 3);
});

test('Category Optimizer - Standard GMB Mapping', (t) => {
  const fnbMapping = getGMBMappingForCategory('Kuliner / F&B');
  assert.strictEqual(fnbMapping.primary, 'Restaurant');
  assert.ok(fnbMapping.secondary_options.includes('Cafe'));

  const retailMapping = getGMBMappingForCategory('Retail & Sembako');
  assert.strictEqual(retailMapping.primary, 'Grocery Store');
});

test('NAP Consistency Detector - Matching Data', (t) => {
  const result = calculateNAPConsistency({
    localPhone: '081234567890',
    localAddress: 'Jl. Melati No. 12, Jakarta Selatan',
    gmapsPhone: '+6281234567890',
    gmapsAddress: 'Jl Melati No 12 Jakarta Selatan'
  });

  assert.strictEqual(result.is_consistent, true);
  assert.strictEqual(result.phone_matched, true);
  assert.ok(result.mismatch_percentage <= 20);
});

test('NAP Consistency Detector - Mismatched Phone & Address Penalty', (t) => {
  const result = calculateNAPConsistency({
    localPhone: '081234567890',
    localAddress: 'Jl. Melati No. 12',
    gmapsPhone: '089999999999',
    gmapsAddress: 'Jl. Sudirman No. 99'
  });

  assert.strictEqual(result.is_consistent, false);
  assert.strictEqual(result.phone_matched, false);
  assert.ok(result.mismatch_percentage > 20);
  assert.ok(result.mismatch_reason !== null);
});

test('Google Posts Scheduler - Routine Check', (t) => {
  const freshStatus = calculatePostScheduleStatus(new Date().toISOString());
  assert.strictEqual(freshStatus.post_reminder_due, false);
  assert.strictEqual(freshStatus.days_since_last_post, 0);

  const oldDate = new Date(Date.now() - 10 * 86400000).toISOString();
  const dueStatus = calculatePostScheduleStatus(oldDate);
  assert.strictEqual(dueStatus.post_reminder_due, true);
  assert.ok(dueStatus.days_since_last_post >= 10);
  assert.ok(dueStatus.reminder_message.includes('10 hari'));
});
