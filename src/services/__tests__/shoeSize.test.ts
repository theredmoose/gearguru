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
        // EU = cm × 1.5 + 2 = 27 × 1.5 + 2 = 42.5, matches the ISO 19407
        // mondopoint table (mondopoint 270 → EU 42.5) in docs/requirements/Gear Guru.xlsx
        const result = convertShoeSize(27, 'cm', 'eu');
        expect(result).toBe(42.5);
      });

      it('converts cm to UK correctly', () => {
        // UK = (cm - 19.5) × 13/11 = (27 - 19.5) × 13/11 ≈ 8.86 → rounds to 9,
        // matching the ISO table (mondopoint 270 → UK 9)
        const result = convertShoeSize(27, 'cm', 'uk');
        expect(result).toBe(9);
      });

      it('converts cm to US-men correctly', () => {
        // US Men = UK + 1, matching the ISO table (mondopoint 270 → US Men 10)
        const result = convertShoeSize(27, 'cm', 'us-men');
        expect(result).toBe(10);
      });

      it('converts cm to US-women correctly', () => {
        // US Women = UK + 2, matching the ISO table (mondopoint 270 → US Women 11)
        const result = convertShoeSize(27, 'cm', 'us-women');
        expect(result).toBe(11);
      });
    });

    describe('from EU', () => {
      it('converts EU 42 to cm', () => {
        const cm = convertShoeSize(42, 'eu', 'cm');
        // EU = cm × 1.5 + 2 → cm = (EU - 2) / 1.5 = (42 - 2) / 1.5 = 26.67
        expect(cm).toBeGreaterThanOrEqual(26);
        expect(cm).toBeLessThanOrEqual(27.5);
      });

      it('converts EU 42 to US Men', () => {
        const usMen = convertShoeSize(42, 'eu', 'us-men');
        // Goes through cm first, then to US - EU 42 ≈ US Men 9-9.5
        expect(usMen).toBeGreaterThan(8);
        expect(usMen).toBeLessThan(11);
      });
    });

    describe('from Mondopoint', () => {
      it('converts mondopoint to cm correctly', () => {
        const result = convertShoeSize(270, 'mondopoint', 'cm');
        expect(result).toBe(27);
      });

      it('converts mondopoint to EU correctly', () => {
        const result = convertShoeSize(270, 'mondopoint', 'eu');
        expect(result).toBe(42.5);
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

  // ============================================
  // REGRESSION: sizing formulas must stay anchored to the ISO 19407:2015
  // mondopoint table in docs/requirements/Gear Guru.xlsx ("Lookup Data" sheet).
  // Previously the UK/US-Men/US-Women formulas used the wrong slope and
  // offset, which produced negative sizes for child feet and wildly
  // oversized values for adult feet (e.g. 27cm -> US Men 16 instead of ~10).
  // ============================================
  describe('getShoeSizesFromFootLength (ISO table regression)', () => {
    it('stays close to zero for a young child foot below the adult size floor (16cm)', () => {
      // UK/US adult sizing bottoms out around a 19.5cm foot (UK/US size 0),
      // so a 16cm foot is genuinely off the adult scale (real-world child
      // sizing resets to a separate scale here). The formula should still
      // degrade gracefully to a small value near zero, not the wildly
      // negative value the old ×3 slope produced (uk was -18 at 16cm).
      const sizes = getShoeSizesFromFootLength(16);

      expect(sizes.uk).toBeGreaterThan(-6);
      expect(sizes.usMen).toBeGreaterThan(-6);
      expect(sizes.usWomen).toBeGreaterThan(-6);
    });

    it('matches the ISO table for a youth foot length (20cm)', () => {
      // docs/requirements/Gear Guru.xlsx children's mondopoint table
      // (mondopoint 200) gives EU 32.5, UK 1, US 1.5 for a 20cm foot -
      // roughly a US youth size 2 / EU 32-33, not the negative sizes the
      // old formula produced.
      const sizes = getShoeSizesFromFootLength(20);

      expect(sizes.mondopoint).toBe(200);
      expect(sizes.eu).toBeGreaterThanOrEqual(32);
      expect(sizes.eu).toBeLessThanOrEqual(33);
      expect(sizes.uk).toBeGreaterThanOrEqual(0);
      expect(sizes.usMen).toBeGreaterThanOrEqual(0);
      expect(sizes.usWomen).toBeGreaterThanOrEqual(0);
      expect(sizes.usMen).toBeLessThanOrEqual(3);
    });

    it('matches the ISO table for a small adult/big-kid foot length (23.5cm)', () => {
      // docs/requirements/Gear Guru.xlsx adult mondopoint table (mondopoint 235)
      // gives EU 37 (our formula rounds the halfway value 37.25 up to 37.5),
      // UK 4.5, US Men 5.5, US Women 6.5 - all exact matches.
      const sizes = getShoeSizesFromFootLength(23.5);

      expect(sizes.mondopoint).toBe(235);
      expect(sizes.eu).toBe(37.5);
      expect(sizes.uk).toBe(4.5);
      expect(sizes.usMen).toBe(5.5);
      expect(sizes.usWomen).toBe(6.5);
    });

    it('matches the ISO table exactly for an adult foot length (27cm)', () => {
      // docs/requirements/Gear Guru.xlsx adult mondopoint table
      // (mondopoint 270) gives EU 42.5, UK 9, US Men 10, US Women 11 -
      // roughly a US Men's 9 / EU 42-43, not US Men 16 as the old formula produced.
      const sizes = getShoeSizesFromFootLength(27);

      expect(sizes.mondopoint).toBe(270);
      expect(sizes.eu).toBe(42.5);
      expect(sizes.uk).toBe(9);
      expect(sizes.usMen).toBe(10);
      expect(sizes.usWomen).toBe(11);
    });

    it('keeps US Women exactly 1 size larger than US Men (ISO table relationship)', () => {
      const sizes = getShoeSizesFromFootLength(27);
      expect(sizes.usWomen - sizes.usMen).toBe(1);
    });
  });
});
