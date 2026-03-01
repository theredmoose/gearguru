import { describe, it, expect } from 'vitest';
import {
  validateHeight,
  validateWeight,
  validateOptionalFootLength,
  validateRequiredFootLength,
  validateOptionalFootWidth,
  validateOptionalUsShoeSize,
  validateOptionalEuShoeSize,
  validateOptionalHeadCircumference,
  validateOptionalHandSize,
  validateOptionalArmLength,
  validateOptionalInseam,
  validateYear,
  parseSkiProfile,
  validateDateOfBirth,
} from '../validation';

describe('validateHeight', () => {
  it('returns null for valid height', () => {
    expect(validateHeight(170)).toBeNull();
  });
  it('errors when height is 0', () => {
    expect(validateHeight(0)).toBe('Height must be greater than 0');
  });
  it('errors when height is negative', () => {
    expect(validateHeight(-1)).toBe('Height must be greater than 0');
  });
  it('accepts 300', () => {
    expect(validateHeight(300)).toBeNull();
  });
  it('errors when height exceeds 300', () => {
    expect(validateHeight(301)).toBe('Height must be 300 cm or less');
  });
});

describe('validateWeight', () => {
  it('returns null for valid weight', () => {
    expect(validateWeight(70)).toBeNull();
  });
  it('errors when weight is 0', () => {
    expect(validateWeight(0)).toBe('Weight must be greater than 0');
  });
  it('errors when weight exceeds 300', () => {
    expect(validateWeight(301)).toBe('Weight must be 300 kg or less');
  });
});

describe('validateOptionalFootLength (MemberForm — stores 0 when unset)', () => {
  it('returns null when 0 (not set)', () => {
    expect(validateOptionalFootLength(0, 'left')).toBeNull();
  });
  it('returns null for valid value', () => {
    expect(validateOptionalFootLength(27, 'left')).toBeNull();
  });
  it('errors when below 12', () => {
    expect(validateOptionalFootLength(11.9, 'left')).toBe(
      'Left foot length must be between 12 and 30 cm'
    );
  });
  it('accepts 12 (lower bound)', () => {
    expect(validateOptionalFootLength(12, 'right')).toBeNull();
  });
  it('accepts 30 (upper bound)', () => {
    expect(validateOptionalFootLength(30, 'right')).toBeNull();
  });
  it('errors when above 30', () => {
    expect(validateOptionalFootLength(30.1, 'right')).toBe(
      'Right foot length must be between 12 and 30 cm'
    );
  });
});

describe('validateRequiredFootLength (EditMeasurementEntryScreen — required)', () => {
  it('errors when 0', () => {
    expect(validateRequiredFootLength(0, 'single')).toBe('Foot length is required');
  });
  it('returns null for valid value', () => {
    expect(validateRequiredFootLength(27, 'left')).toBeNull();
  });
  it('errors when above 30', () => {
    expect(validateRequiredFootLength(30.1, 'right')).toBe(
      'Right foot length must be 30 cm or less'
    );
  });
  it('accepts 30 (upper bound)', () => {
    expect(validateRequiredFootLength(30, 'single')).toBeNull();
  });
});

describe('validateOptionalFootWidth', () => {
  it('returns null when undefined', () => {
    expect(validateOptionalFootWidth(undefined, 'left')).toBeNull();
  });
  it('returns null when empty string', () => {
    expect(validateOptionalFootWidth('', 'left')).toBeNull();
  });
  it('returns null for valid value', () => {
    expect(validateOptionalFootWidth(10, 'right')).toBeNull();
  });
  it('errors when above 15 (number)', () => {
    expect(validateOptionalFootWidth(15.1, 'left')).toBe(
      'Left foot width must be 15 cm or less'
    );
  });
  it('errors when above 15 (string)', () => {
    expect(validateOptionalFootWidth('16', 'right')).toBe(
      'Right foot width must be 15 cm or less'
    );
  });
  it('accepts 15 (upper bound)', () => {
    expect(validateOptionalFootWidth(15, 'left')).toBeNull();
  });
});

describe('validateOptionalUsShoeSize', () => {
  it('returns null when undefined', () => expect(validateOptionalUsShoeSize(undefined)).toBeNull());
  it('returns null when empty string', () => expect(validateOptionalUsShoeSize('')).toBeNull());
  it('returns null for valid size', () => expect(validateOptionalUsShoeSize(10)).toBeNull());
  it('errors above 25', () => expect(validateOptionalUsShoeSize(26)).toBe('US shoe size must be 25 or less'));
  it('errors above 25 (string)', () => expect(validateOptionalUsShoeSize('26')).toBe('US shoe size must be 25 or less'));
});

describe('validateOptionalEuShoeSize', () => {
  it('returns null when undefined', () => expect(validateOptionalEuShoeSize(undefined)).toBeNull());
  it('returns null for valid size', () => expect(validateOptionalEuShoeSize(42)).toBeNull());
  it('errors above 60', () => expect(validateOptionalEuShoeSize(61)).toBe('EU shoe size must be 60 or less'));
});

describe('validateOptionalHeadCircumference', () => {
  it('returns null when undefined', () => expect(validateOptionalHeadCircumference(undefined)).toBeNull());
  it('returns null when empty string', () => expect(validateOptionalHeadCircumference('')).toBeNull());
  it('returns null for valid value', () => expect(validateOptionalHeadCircumference(55)).toBeNull());
  it('errors below 40', () => expect(validateOptionalHeadCircumference(39)).toBe('Head circumference must be between 40 and 70 cm'));
  it('errors above 70', () => expect(validateOptionalHeadCircumference(71)).toBe('Head circumference must be between 40 and 70 cm'));
  it('accepts 40 (lower bound)', () => expect(validateOptionalHeadCircumference(40)).toBeNull());
  it('accepts 70 (upper bound)', () => expect(validateOptionalHeadCircumference(70)).toBeNull());
});

describe('validateOptionalHandSize', () => {
  it('returns null when undefined', () => expect(validateOptionalHandSize(undefined)).toBeNull());
  it('returns null when empty string', () => expect(validateOptionalHandSize('')).toBeNull());
  it('returns null for valid value', () => expect(validateOptionalHandSize(18)).toBeNull());
  it('errors below 4', () => expect(validateOptionalHandSize(3.9)).toBe('Hand size must be between 4 and 30 cm'));
  it('errors above 30', () => expect(validateOptionalHandSize(30.1)).toBe('Hand size must be between 4 and 30 cm'));
  it('errors below 4 (string)', () => expect(validateOptionalHandSize('3')).toBe('Hand size must be between 4 and 30 cm'));
  it('errors above 30 (string)', () => expect(validateOptionalHandSize('31')).toBe('Hand size must be between 4 and 30 cm'));
});

describe('validateOptionalArmLength', () => {
  it('returns null when empty string', () => expect(validateOptionalArmLength('')).toBeNull());
  it('returns null for valid value', () => expect(validateOptionalArmLength('75')).toBeNull());
  it('errors above 120', () => expect(validateOptionalArmLength('121')).toBe('Arm length must be 120 cm or less'));
});

describe('validateOptionalInseam', () => {
  it('returns null when empty string', () => expect(validateOptionalInseam('')).toBeNull());
  it('returns null for valid value', () => expect(validateOptionalInseam('80')).toBeNull());
  it('errors above 120', () => expect(validateOptionalInseam('121')).toBe('Inseam must be 120 cm or less'));
});

describe('validateYear', () => {
  const currentYear = new Date().getFullYear();

  it('returns null when empty (optional)', () => {
    expect(validateYear('')).toBeNull();
  });
  it('returns null for valid year', () => {
    expect(validateYear('2022')).toBeNull();
  });
  it('errors below 1980', () => {
    expect(validateYear('1979')).toBe(`Year must be between 1980 and ${currentYear + 1}`);
  });
  it('accepts 1980 (lower bound)', () => {
    expect(validateYear('1980')).toBeNull();
  });
  it('accepts currentYear + 1 (upper bound)', () => {
    expect(validateYear(String(currentYear + 1))).toBeNull();
  });
  it('errors above currentYear + 1', () => {
    expect(validateYear(String(currentYear + 2))).toBe(
      `Year must be between 1980 and ${currentYear + 1}`
    );
  });
  it('errors for non-numeric string', () => {
    expect(validateYear('abc')).toBe(`Year must be between 1980 and ${currentYear + 1}`);
  });
});

describe('parseSkiProfile', () => {
  it('returns profile when all values are valid integers', () => {
    expect(parseSkiProfile('120', '80', '110')).toEqual({ tip: 120, waist: 80, tail: 110 });
  });
  it('returns null when any field is empty', () => {
    expect(parseSkiProfile('', '80', '110')).toBeNull();
    expect(parseSkiProfile('120', '', '110')).toBeNull();
    expect(parseSkiProfile('120', '80', '')).toBeNull();
  });
  it('returns null when any field is non-numeric', () => {
    expect(parseSkiProfile('abc', '80', '110')).toBeNull();
    expect(parseSkiProfile('120', 'xyz', '110')).toBeNull();
  });
  it('returns null when all fields are empty', () => {
    expect(parseSkiProfile('', '', '')).toBeNull();
  });
  it('truncates decimal strings to integers (parseInt behavior)', () => {
    expect(parseSkiProfile('120.5', '80', '110')).toEqual({ tip: 120, waist: 80, tail: 110 });
  });
});

describe('validateDateOfBirth', () => {
  it('returns null for a valid past date', () => {
    expect(validateDateOfBirth('1990-06-15')).toBeNull();
  });
  it('errors when DOB is in the future', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(validateDateOfBirth(futureDate.toISOString().slice(0, 10))).toBe(
      'Date of birth cannot be in the future'
    );
  });
  it('errors when DOB is more than 120 years ago', () => {
    expect(validateDateOfBirth('1900-01-01')).toBe('Date of birth is too far in the past');
  });
  it('accepts a date exactly 120 years ago', () => {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    const result = validateDateOfBirth(minDate.toISOString().slice(0, 10));
    expect(result).toBeNull();
  });
  it('returns null for empty string (field is optional at this level)', () => {
    expect(validateDateOfBirth('')).toBeNull();
  });
  it('errors for invalid date string', () => {
    expect(validateDateOfBirth('not-a-date')).toBe('Date of birth is invalid');
  });
});
