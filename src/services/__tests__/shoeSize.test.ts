import { describe, it, expect } from 'vitest';
import {
  convertShoeSize,
  getAllShoeSizes,
  getShoeSizesFromFootLength,
  formatShoeSize,
  getSizeSystemLabel,
  type SizeSystem,
} from '../shoeSize';

describe('shoeSize service', () => {
  // ============================================
  // CONVERSION TESTS
  // ============================================
  describe('convertShoeSize', () => {
    describe('from CM', () => {
      it('converts cm to mondopoint correctly', () => {
        expect(convertShoeSize(27, 'cm', 'mondopoint')).toBe(270);
      });

      it('converts cm to EU correctly', () => {
        // EU = (cm + 1.5) × 1.5 = (27 + 1.5) × 1.5 = 42.75 → rounds to 43
        const result = convertShoeSize(27, 'cm', 'eu');
        expect(result).toBeGreaterThanOrEqual(42);
        expect(result).toBeLessThanOrEqual(44);
      });

      it('converts cm to UK correctly', () => {
        // UK = (cm - 22) × 3 = (27 - 22) × 3 = 15
        const result = convertShoeSize(27, 'cm', 'uk');
        expect(result).toBeGreaterThanOrEqual(14);
        expect(result).toBeLessThanOrEqual(16);
      });

      it('converts cm to US-men correctly', () => {
        // US Men = UK + 1
        const result = convertShoeSize(27, 'cm', 'us-men');
        expect(result).toBeGreaterThanOrEqual(15);
        expect(result).toBeLessThanOrEqual(17);
      });

      it('converts cm to US-women correctly', () => {
        // US Women = US Men + 1.5
        const result = convertShoeSize(27, 'cm', 'us-women');
        expect(result).toBeGreaterThanOrEqual(16);
        expect(result).toBeLessThanOrEqual(19);
      });
    });

    describe('from EU', () => {
      it('converts EU 42 to cm', () => {
        const cm = convertShoeSize(42, 'eu', 'cm');
        // EU = (cm + 1.5) × 1.5 → cm = EU / 1.5 - 1.5 = 42 / 1.5 - 1.5 = 26.5
        // But rounding may give 27
        expect(cm).toBeGreaterThanOrEqual(26);
        expect(cm).toBeLessThanOrEqual(27.5);
      });

      it('converts EU 42 to US Men', () => {
        const usMen = convertShoeSize(42, 'eu', 'us-men');
        // Goes through cm first, then to US
        expect(usMen).toBeGreaterThan(12);
        expect(usMen).toBeLessThan(17);
      });
    });

    describe('from Mondopoint', () => {
      it('converts mondopoint to cm correctly', () => {
        const result = convertShoeSize(270, 'mondopoint', 'cm');
        expect(result).toBe(27);
      });

      it('converts mondopoint to EU correctly', () => {
        const result = convertShoeSize(270, 'mondopoint', 'eu');
        expect(result).toBeCloseTo(43, 1);
      });
    });

    describe('round-trip accuracy', () => {
      it.each<SizeSystem>(['eu', 'uk', 'us-men', 'us-women', 'mondopoint'])(
        'maintains accuracy through %s round-trip',
        (system) => {
          const original = 27;
          const converted = convertShoeSize(original, 'cm', system);
          const backToCm = convertShoeSize(converted, system, 'cm');
          // Allow for rounding differences
          expect(backToCm).toBeCloseTo(original, 0);
        }
      );
    });

    describe('identity conversion', () => {
      it('returns same value for same system', () => {
        expect(convertShoeSize(42, 'eu', 'eu')).toBe(42);
        expect(convertShoeSize(27, 'cm', 'cm')).toBe(27);
        expect(convertShoeSize(270, 'mondopoint', 'mondopoint')).toBe(270);
      });
    });
  });

  // ============================================
  // GET ALL SIZES
  // ============================================
  describe('getAllShoeSizes', () => {
    it('returns all size systems from cm input', () => {
      const sizes = getAllShoeSizes({ system: 'cm', value: 27 });

      expect(sizes).toHaveProperty('cm');
      expect(sizes).toHaveProperty('mondopoint');
      expect(sizes).toHaveProperty('eu');
      expect(sizes).toHaveProperty('uk');
      expect(sizes).toHaveProperty('usMen');
      expect(sizes).toHaveProperty('usWomen');
    });

    it('all values are numbers', () => {
      const sizes = getAllShoeSizes({ system: 'cm', value: 27 });

      expect(typeof sizes.cm).toBe('number');
      expect(typeof sizes.mondopoint).toBe('number');
      expect(typeof sizes.eu).toBe('number');
      expect(typeof sizes.uk).toBe('number');
      expect(typeof sizes.usMen).toBe('number');
      expect(typeof sizes.usWomen).toBe('number');
    });

    it('values are consistent regardless of input system', () => {
      const fromCm = getAllShoeSizes({ system: 'cm', value: 27 });
      const fromMondo = getAllShoeSizes({ system: 'mondopoint', value: 270 });

      expect(fromCm.cm).toBeCloseTo(fromMondo.cm, 0);
      expect(fromCm.mondopoint).toBe(fromMondo.mondopoint);
    });
  });

  describe('getShoeSizesFromFootLength', () => {
    it('returns all sizes from foot length in cm', () => {
      const sizes = getShoeSizesFromFootLength(27);

      expect(sizes.cm).toBe(27);
      expect(sizes.mondopoint).toBe(270);
      expect(sizes.eu).toBeGreaterThan(40);
    });

    it('matches getAllShoeSizes with cm input', () => {
      const fromHelper = getShoeSizesFromFootLength(27);
      const fromGeneral = getAllShoeSizes({ system: 'cm', value: 27 });

      expect(fromHelper).toEqual(fromGeneral);
    });
  });

  // ============================================
  // FORMATTING FUNCTIONS
  // ============================================
  describe('formatShoeSize', () => {
    it.each<[SizeSystem, number, string]>([
      ['eu', 42, 'EU 42'],
      ['uk', 8, 'UK 8'],
      ['us-men', 9, 'US M 9'],
      ['us-women', 10.5, 'US W 10.5'],
      ['mondopoint', 270, 'MP 270'],
      ['cm', 27, 'cm 27'],
    ])('formats %s size correctly', (system, value, expected) => {
      expect(formatShoeSize(system, value)).toBe(expected);
    });
  });

  describe('getSizeSystemLabel', () => {
    it.each<[SizeSystem, string]>([
      ['eu', 'EU'],
      ['uk', 'UK'],
      ['us-men', 'US Men'],
      ['us-women', 'US Women'],
      ['mondopoint', 'Mondopoint'],
      ['cm', 'Centimeters'],
    ])('returns correct label for %s', (system, expected) => {
      expect(getSizeSystemLabel(system)).toBe(expected);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================
  describe('edge cases', () => {
    it('handles small foot sizes (children)', () => {
      const sizes = getShoeSizesFromFootLength(18); // Small child

      expect(sizes.mondopoint).toBe(180);
      expect(sizes.eu).toBeGreaterThan(25);
      expect(sizes.eu).toBeLessThan(35);
    });

    it('handles large foot sizes', () => {
      const sizes = getShoeSizesFromFootLength(32); // Very large

      expect(sizes.mondopoint).toBe(320);
      expect(sizes.eu).toBeGreaterThan(48);
    });

    it('handles half sizes correctly', () => {
      const sizes = getShoeSizesFromFootLength(26.5);

      // EU sizes should round to nearest 0.5
      expect(sizes.eu % 0.5).toBe(0);
    });
  });
});
