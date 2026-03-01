import type { SkiProfile } from '../types';

// ---- Private helpers ----

function optionalBetween(value: number, min: number, max: number, field: string): string | null {
  if (value > 0 && (value < min || value > max)) {
    return `${field} must be between ${min} and ${max} cm`;
  }
  return null;
}

function optionalMaxCmNum(value: number | undefined, max: number, field: string): string | null {
  if (value !== undefined && value > max) return `${field} must be ${max} cm or less`;
  return null;
}

function optionalMaxCmStr(value: string, max: number, field: string): string | null {
  if (value !== '' && Number(value) > max) return `${field} must be ${max} cm or less`;
  return null;
}

function optionalMaxNum(value: number | undefined, max: number, field: string): string | null {
  if (value !== undefined && value > max) return `${field} must be ${max} or less`;
  return null;
}

function optionalMaxStr(value: string, max: number, field: string): string | null {
  if (value !== '' && Number(value) > max) return `${field} must be ${max} or less`;
  return null;
}

function optionalBetweenStr(value: string, min: number, max: number, field: string): string | null {
  if (value !== '' && (Number(value) < min || Number(value) > max)) {
    return `${field} must be between ${min} and ${max} cm`;
  }
  return null;
}

// ---- Exported validators ----

export function validateHeight(cm: number): string | null {
  if (cm <= 0) return 'Height must be greater than 0';
  if (cm > 300) return 'Height must be 300 cm or less';
  return null;
}

export function validateWeight(kg: number): string | null {
  if (kg <= 0) return 'Weight must be greater than 0';
  if (kg > 300) return 'Weight must be 300 kg or less';
  return null;
}

/** MemberForm pattern: foot length stored as 0 when not set. Validates only when > 0. */
export function validateOptionalFootLength(cm: number, side: 'left' | 'right'): string | null {
  const label = side === 'left' ? 'Left foot length' : 'Right foot length';
  return optionalBetween(cm, 12, 30, label);
}

/** EditMeasurementEntryScreen pattern: foot length is required (must be > 0 and <= 30). */
export function validateRequiredFootLength(cm: number, side: 'left' | 'right' | 'single'): string | null {
  const label = side === 'single' ? 'Foot length' : side === 'left' ? 'Left foot length' : 'Right foot length';
  if (cm <= 0) return `${label} is required`;
  if (cm > 30) return `${label} must be 30 cm or less`;
  return null;
}

/** Accepts number (MemberForm) or string (EditMeasurementEntryScreen), or undefined. */
export function validateOptionalFootWidth(value: number | string | undefined, side: 'left' | 'right'): string | null {
  const label = side === 'left' ? 'Left foot width' : 'Right foot width';
  if (typeof value === 'string') return optionalMaxCmStr(value, 15, label);
  return optionalMaxCmNum(value, 15, label);
}

export function validateOptionalUsShoeSize(value: number | string | undefined): string | null {
  if (typeof value === 'string') return optionalMaxStr(value, 25, 'US shoe size');
  return optionalMaxNum(value, 25, 'US shoe size');
}

export function validateOptionalEuShoeSize(value: number | string | undefined): string | null {
  if (typeof value === 'string') return optionalMaxStr(value, 60, 'EU shoe size');
  return optionalMaxNum(value, 60, 'EU shoe size');
}

export function validateOptionalHeadCircumference(value: number | string | undefined): string | null {
  if (typeof value === 'string') return optionalBetweenStr(value, 40, 70, 'Head circumference');
  if (value !== undefined && (value < 40 || value > 70)) {
    return 'Head circumference must be between 40 and 70 cm';
  }
  return null;
}

export function validateOptionalHandSize(value: number | string | undefined): string | null {
  const field = 'Hand size';
  if (typeof value === 'string') {
    if (value !== '' && (Number(value) < 4 || Number(value) > 30)) {
      return `${field} must be between 4 and 30 cm`;
    }
    return null;
  }
  if (value !== undefined && (value < 4 || value > 30)) {
    return `${field} must be between 4 and 30 cm`;
  }
  return null;
}

export function validateOptionalArmLength(value: string): string | null {
  return optionalMaxCmStr(value, 120, 'Arm length');
}

export function validateOptionalInseam(value: string): string | null {
  return optionalMaxCmStr(value, 120, 'Inseam');
}

export function validateYear(year: string): string | null {
  if (!year) return null;
  const n = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(n) || n < 1980 || n > currentYear + 1) {
    return `Year must be between 1980 and ${currentYear + 1}`;
  }
  return null;
}

/** Returns parsed SkiProfile or null if any field is empty/non-numeric. */
export function parseSkiProfile(tip: string, waist: string, tail: string): SkiProfile | null {
  const tipN = parseInt(tip, 10);
  const waistN = parseInt(waist, 10);
  const tailN = parseInt(tail, 10);
  if (!tip || !waist || !tail || isNaN(tipN) || isNaN(waistN) || isNaN(tailN)) return null;
  return { tip: tipN, waist: waistN, tail: tailN };
}

export function validateDateOfBirth(dob: string): string | null {
  // Parse dob as UTC (YYYY-MM-DD strings are UTC per spec)
  const dobDate = new Date(dob);
  const now = new Date();
  // Build UTC-based comparison dates to match how Date parses "YYYY-MM-DD"
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const minDateUTC = new Date(Date.UTC(now.getUTCFullYear() - 120, now.getUTCMonth(), now.getUTCDate()));
  if (dobDate > todayUTC) return 'Date of birth cannot be in the future';
  if (dobDate < minDateUTC) return 'Date of birth is too far in the past';
  return null;
}
