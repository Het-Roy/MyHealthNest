import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { generateId } from '../utils/id.utils.js';
import {
  calculateAge,
  formatDayMonth,
  formatDisplayDate,
  formatMonthYear,
  isValidISODate,
  toISODate,
} from '../utils/date.utils.js';
import { ProfileSchema, AllergySchema } from '../features/profile/profile.validation.js';
import { MedicalRecordSchema } from '../features/records/record.validation.js';
import {
  ALLERGY_CATEGORIES,
  ALLERGY_SEVERITIES,
  DEFAULT_METADATA,
  DEFAULT_SETTINGS,
  RECORD_TYPES,
} from '../types/common.types.js';

describe('Application Core Logic & Schema Integrity', () => {
  it('validates all supported medical record types', () => {
    for (const type of RECORD_TYPES) {
      const record = {
        id: generateId('rec'),
        title: `Test ${type}`,
        type,
        date: toISODate(),
        images: ['file:///documents/page-1.jpg'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = MedicalRecordSchema.safeParse(record);
      assert.equal(result.success, true);
    }
  });

  it('validates allergy severities and categories', () => {
    for (const category of ALLERGY_CATEGORIES) {
      for (const severity of ALLERGY_SEVERITIES) {
        const allergy = {
          id: generateId('alg'),
          name: `${category} allergy`,
          category,
          severity,
        };
        const result = AllergySchema.safeParse(allergy);
        assert.equal(result.success, true);
      }
    }
  });

  it('filters and sorts records chronologically in descending order', () => {
    const rawRecords = [
      { id: '1', title: 'Old Prescription', date: '2026-01-10', type: 'prescription' },
      { id: '2', title: 'Recent Blood Test', date: '2026-11-20', type: 'lab-report' },
      { id: '3', title: 'Mid-year Scan', date: '2026-06-15', type: 'scan' },
    ];

    const sorted = [...rawRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    assert.equal(sorted[0].id, '2');
    assert.equal(sorted[1].id, '3');
    assert.equal(sorted[2].id, '1');

    // Filter by type
    const labsOnly = sorted.filter((r) => r.type === 'lab-report');
    assert.equal(labsOnly.length, 1);
    assert.equal(labsOnly[0].title, 'Recent Blood Test');
  });

  it('computes correct monthly timeline grouping headers', () => {
    const dates = ['2026-11-25', '2026-11-18', '2026-10-21'];
    const headers = dates.map(formatMonthYear);
    assert.equal(headers[0], 'NOVEMBER 2026');
    assert.equal(headers[1], 'NOVEMBER 2026');
    assert.equal(headers[2], 'OCTOBER 2026');
  });

  it('verifies default settings and metadata invariants', () => {
    assert.equal(DEFAULT_SETTINGS.autoLockSeconds, 30);
    assert.equal(DEFAULT_SETTINGS.theme, 'system');
    assert.equal(DEFAULT_SETTINGS.biometricEnabled, true);
    assert.equal(DEFAULT_SETTINGS.notificationsEnabled, true);

    assert.equal(DEFAULT_METADATA.schemaVersion, 1);
    assert.equal(DEFAULT_METADATA.onboardingCompleted, false);
    assert.equal(DEFAULT_METADATA.emergencyCardConfig.showName, true);
  });
});
