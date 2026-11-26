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

describe('ID Generation Utils', () => {
  it('generates unique ids with custom prefix', () => {
    const id1 = generateId('rec');
    const id2 = generateId('rec');
    assert.ok(id1.startsWith('rec-'));
    assert.ok(id2.startsWith('rec-'));
    assert.notEqual(id1, id2);
  });
});

describe('Date Utilities', () => {
  it('validates ISO dates correctly', () => {
    assert.equal(isValidISODate('2026-11-26'), true);
    assert.equal(isValidISODate('invalid'), false);
    assert.equal(isValidISODate(''), false);
  });

  it('formats display dates correctly', () => {
    const formatted = formatDisplayDate('2026-11-25');
    assert.equal(formatted, '25 NOV 2026');
  });

  it('formats day and month correctly', () => {
    const dm = formatDayMonth('2026-11-25');
    assert.equal(dm, '25 NOV');
  });

  it('formats month and year grouping header', () => {
    const my = formatMonthYear('2026-11-25');
    assert.equal(my, 'NOVEMBER 2026');
  });

  it('calculates age accurately based on DOB and reference date', () => {
    const reference = new Date('2026-11-26');
    const age = calculateAge('1990-05-15', reference);
    assert.equal(age, 36);

    const birthdayTomorrow = calculateAge('1990-11-27', reference);
    assert.equal(birthdayTomorrow, 35);
  });
});

describe('Zod Validation Schemas', () => {
  it('validates valid profile data', () => {
    const validProfile = {
      id: 'prof-1',
      name: 'John Doe',
      dob: '1985-04-12',
      gender: 'Male',
      bloodGroup: 'O+',
      allergyIds: [],
      conditionIds: [],
      surgeries: ['Appendectomy'],
      vaccinations: ['Tetanus'],
    };
    const result = ProfileSchema.safeParse(validProfile);
    assert.equal(result.success, true);
  });

  it('rejects invalid profile without name or blood group', () => {
    const invalidProfile = {
      id: 'prof-1',
      name: '',
      bloodGroup: '',
    };
    const result = ProfileSchema.safeParse(invalidProfile);
    assert.equal(result.success, false);
  });

  it('validates medical records correctly', () => {
    const record = {
      id: 'rec-1',
      title: 'Blood Sugar Report',
      type: 'lab-report',
      date: '2026-11-20',
      images: ['file:///test/page-1.jpg'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const result = MedicalRecordSchema.safeParse(record);
    assert.equal(result.success, true);
  });

  it('rejects medical records with empty images array', () => {
    const record = {
      id: 'rec-2',
      title: 'Empty Report',
      type: 'prescription',
      date: '2026-11-20',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const result = MedicalRecordSchema.safeParse(record);
    assert.equal(result.success, false);
  });

  it('validates allergy severities and categories', () => {
    const allergy = {
      id: 'alg-1',
      name: 'Penicillin',
      category: 'drug',
      severity: 'severe',
      notes: 'Anaphylaxis',
    };
    const result = AllergySchema.safeParse(allergy);
    assert.equal(result.success, true);
  });
});
