/**
 * Shoe Size Conversion Utilities
 *
 * Conversions between measurement systems:
 * - US Men's / US Women's
 * - UK
 * - EU (European)
 * - Mondopoint (mm)
 * - CM (centimeters - foot length)
 *
 * Note: These are approximations. Actual sizing varies by brand.
 */

export type SizeSystem =
  | 'us-men'
  | 'us-women'
  | 'uk'
  | 'eu'
  | 'mondopoint'
  | 'cm';

export interface ShoeSize {
  system: SizeSystem;
  value: number;
}

export interface AllShoeSizes {
  usMen: number;
  usWomen: number;
  uk: number;
  eu: number;
  mondopoint: number;
  cm: number;
}

/**
 * Convert from any size system to centimeters (the base unit)
 */
function toCm(size: ShoeSize): number {
  switch (size.system) {
    case 'cm':
      return size.value;
    case 'mondopoint':
      return size.value / 10;
    case 'eu':
      // EU = (cm × 1.5) + 2 (ISO formula from docs/requirements/Gear Guru.xlsx:
      // (cm + 2×0.667) / 0.667), so cm = (EU - 2) / 1.5
      return (size.value - 2) / 1.5;
    case 'uk':
      // UK = (cm - 19.5) × 13/11, fit to the ISO 19407:2015 mondopoint
      // table in docs/requirements/Gear Guru.xlsx, so cm = (UK × 11/13) + 19.5
      return (size.value * 11) / 13 + 19.5;
    case 'us-men':
      // US Men = UK + 1
      return ((size.value - 1) * 11) / 13 + 19.5;
    case 'us-women':
      // US Women = UK + 2 (per the ISO table; US Women = US Men + 1)
      return ((size.value - 2) * 11) / 13 + 19.5;
  }
}

/**
 * Convert from centimeters to a specific size system
 */
function fromCm(cm: number, system: SizeSystem): number {
  switch (system) {
    case 'cm':
      return round(cm, 1);
    case 'mondopoint':
      return Math.round(cm * 10);
    case 'eu':
      return round(cm * 1.5 + 2, 0.5);
    case 'uk':
      return round((cm - 19.5) * (13 / 11), 0.5);
    case 'us-men':
      return round((cm - 19.5) * (13 / 11) + 1, 0.5);
    case 'us-women':
      return round((cm - 19.5) * (13 / 11) + 2, 0.5);
  }
}

/**
 * Round to nearest increment (0.5, 1, etc.)
 */
function round(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

/**
 * Convert between any two size systems
 */
export function convertShoeSize(
  fromSize: number,
  fromSystem: SizeSystem,
  toSystem: SizeSystem
): number {
  const cm = toCm({ system: fromSystem, value: fromSize });
  return fromCm(cm, toSystem);
}

/**
 * Get all size equivalents from a single measurement
 */
export function getAllShoeSizes(size: ShoeSize): AllShoeSizes {
  const cm = toCm(size);
  return {
    cm: fromCm(cm, 'cm'),
    mondopoint: fromCm(cm, 'mondopoint'),
    eu: fromCm(cm, 'eu'),
    uk: fromCm(cm, 'uk'),
    usMen: fromCm(cm, 'us-men'),
    usWomen: fromCm(cm, 'us-women'),
  };
}

/**
 * Get all sizes from foot length in cm
 */
export function getShoeSizesFromFootLength(footLengthCm: number): AllShoeSizes {
  return getAllShoeSizes({ system: 'cm', value: footLengthCm });
}

/**
 * Format size for display with system label
 */
export function formatShoeSize(system: SizeSystem, value: number): string {
  const labels: Record<SizeSystem, string> = {
    'us-men': 'US M',
    'us-women': 'US W',
    uk: 'UK',
    eu: 'EU',
    mondopoint: 'MP',
    cm: 'cm',
  };
  return `${labels[system]} ${value}`;
}

/**
 * Get display label for a size system
 */
export function getSizeSystemLabel(system: SizeSystem): string {
  const labels: Record<SizeSystem, string> = {
    'us-men': 'US Men',
    'us-women': 'US Women',
    uk: 'UK',
    eu: 'EU',
    mondopoint: 'Mondopoint',
    cm: 'Centimeters',
  };
  return labels[system];
}
