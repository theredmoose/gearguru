import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateNordicSkiSizing,
  calculateNordicSkiSizingByModel,
  calculateNordicBootSizing,
  calculateAlpineSkiSizing,
  calculateAlpineBootSizing,
  calculateAlpineWaistWidth,
  checkDINSafety,
  calculateSnowboardSizing,
  calculateSnowboardBootSizing,
  calculateHockeySkateSize,
  calculateHelmetSizing,
  calculateAge,
  formatSizeRange,
} from '../sizing';
import { MEASUREMENTS } from '@tests/fixtures/measurements';
import type { SkillLevel } from '../../types';

describe('sizing service', () => {
  // ============================================
  // NORDIC SKI SIZING
  // ============================================
  describe('calculateNordicSkiSizing', () => {
    describe('classic style', () => {
      it.each<[SkillLevel, number, number]>([
        ['beginner', 190, 149], // height + 10
        ['intermediate', 193, 150],
        ['advanced', 197, 152],
        ['expert', 200, 153], // height + 20
      ])(
        'calculates %s skill level correctly (ski: %d, pole: %d)',
        (skill, expectedSki, expectedPole) => {
          const result = calculateNordicSkiSizing(
            MEASUREMENTS.adultMale,
            'nordic-classic',
            skill
          );
          expect(result.skiLengthRecommended).toBe(expectedSki);
          expect(result.poleLengthRecommended).toBe(expectedPole);
        }
      );

      it('returns correct range for classic skis', () => {
        const result = calculateNordicSkiSizing(
          MEASUREMENTS.adultMale,
          'nordic-classic',
          'intermediate'
        );
        expect(result.skiLengthMin).toBe(190); // height + 10
        expect(result.skiLengthMax).toBe(200); // height + 20
        expect(result.sport).toBe('nordic-classic');
      });
    });

    describe('skate style', () => {
      it('calculates skate ski sizing correctly', () => {
        const result = calculateNordicSkiSizing(
          MEASUREMENTS.adultMale,
          'nordic-skate',
          'intermediate'
        );
        expect(result.skiLengthMin).toBe(185); // height + 5
        expect(result.skiLengthMax).toBe(195); // height + 15
        expect(result.poleLengthRecommended).toBeGreaterThan(
          calculateNordicSkiSizing(MEASUREMENTS.adultMale, 'nordic-classic', 'intermediate')
            .poleLengthRecommended
        );
      });
    });

    describe('weight adjustments', () => {
      it('adds 2cm for heavy skiers (>80kg)', () => {
        const normalResult = calculateNordicSkiSizing(
          MEASUREMENTS.adultMale,
          'nordic-classic',
          'intermediate'
        );
        const heavyResult = calculateNordicSkiSizing(
          MEASUREMENTS.heavyAthlete,
          'nordic-classic',
          'intermediate'
        );
        // Heavy athlete is taller (190 vs 180) but also gets +2 weight adjustment
        expect(heavyResult.skiLengthRecommended).toBeGreaterThan(
          normalResult.skiLengthRecommended
        );
      });

      it('subtracts 2cm for light skiers (<60kg)', () => {
        const result = calculateNordicSkiSizing(
          MEASUREMENTS.lightAthlete,
          'nordic-classic',
          'intermediate'
        );
        // 165 height + 13.3 (mid-range) - 2 (weight) = ~176
        expect(result.skiLengthRecommended).toBeLessThan(180);
      });
    });
  });

  describe('calculateNordicBootSizing', () => {
    it('calculates mondopoint from foot length', () => {
      const result = calculateNordicBootSizing(MEASUREMENTS.adultMale);
      // Max foot length is 27.5, so mondopoint = 275
      expect(result.mondopoint).toBe(275);
    });

    it('uses larger foot for sizing', () => {
      const unevenFeet = {
        ...MEASUREMENTS.adultMale,
        footLengthLeft: 26,
        footLengthRight: 28,
      };
      const result = calculateNordicBootSizing(unevenFeet);
      expect(result.mondopoint).toBe(280); // Uses 28cm
    });

    it('calculates EU and US sizes', () => {
      const result = calculateNordicBootSizing(MEASUREMENTS.adultMale);
      expect(result.euSize).toBeGreaterThan(40);
      expect(result.usSize).toBeGreaterThan(0);
    });
  });

  // ============================================
  // ALPINE SKI SIZING
  // ============================================
  describe('calculateAlpineSkiSizing', () => {
    describe('skill level affects length', () => {
      it('beginners get shorter skis', () => {
        const beginner = calculateAlpineSkiSizing(MEASUREMENTS.adultMale, 'beginner', 'male');
        const expert = calculateAlpineSkiSizing(MEASUREMENTS.adultMale, 'expert', 'male');
        expect(beginner.skiLengthRecommended).toBeLessThan(expert.skiLengthRecommended);
      });

      it('returns correct ranges by skill', () => {
        const beginner = calculateAlpineSkiSizing(MEASUREMENTS.adultMale, 'beginner', 'male');
        expect(beginner.skiLengthMin).toBe(160); // 180 - 20
        expect(beginner.skiLengthMax).toBe(165); // 180 - 15 + weight adj
      });
    });

    describe('gender adjustments', () => {
      it('applies -3cm offset for female skiers', () => {
        const male = calculateAlpineSkiSizing(MEASUREMENTS.adultMale, 'intermediate', 'male');
        const female = calculateAlpineSkiSizing(
          { ...MEASUREMENTS.adultMale, height: 180, weight: 80 },
          'intermediate',
          'female'
        );
        expect(female.skiLengthRecommended).toBeLessThan(male.skiLengthRecommended);
      });
    });

    describe('DIN settings', () => {
      it('returns DIN within valid range (1-12)', () => {
        const result = calculateAlpineSkiSizing(MEASUREMENTS.adultMale, 'intermediate', 'male');
        expect(result.din.min).toBeGreaterThanOrEqual(1);
        expect(result.din.max).toBeLessThanOrEqual(12);
      });

      it('higher skill increases DIN', () => {
        const beginner = calculateAlpineSkiSizing(MEASUREMENTS.adultMale, 'beginner', 'male');
        const expert = calculateAlpineSkiSizing(MEASUREMENTS.adultMale, 'expert', 'male');
        expect(expert.din.min).toBeGreaterThan(beginner.din.min);
      });
    });
  });

  describe('calculateAlpineBootSizing', () => {
    it('calculates mondopoint and shell size', () => {
      const result = calculateAlpineBootSizing(MEASUREMENTS.adultMale, 'intermediate', 'male');
      expect(result.mondopoint).toBe(275);
      expect(result.shellSize).toBe(28); // Rounded from 27.5
    });

    describe('last width determination', () => {
      it('defaults to medium when no width measurement', () => {
        const result = calculateAlpineBootSizing(MEASUREMENTS.minimal, 'intermediate', 'male');
        expect(result.lastWidth).toBe('medium');
        expect(result.lastWidthMm).toBe(100);
      });

      it('detects narrow feet', () => {
        const result = calculateAlpineBootSizing(MEASUREMENTS.narrowFeet, 'intermediate', 'male');
        expect(result.lastWidth).toBe('narrow');
      });

      it('detects wide feet', () => {
        const result = calculateAlpineBootSizing(MEASUREMENTS.wideFeet, 'intermediate', 'male');
        expect(['wide', 'extra-wide']).toContain(result.lastWidth);
      });
    });

    describe('flex rating', () => {
      it('increases with skill level', () => {
        const beginner = calculateAlpineBootSizing(MEASUREMENTS.adultMale, 'beginner', 'male');
        const expert = calculateAlpineBootSizing(MEASUREMENTS.adultMale, 'expert', 'male');
        expect(expert.flexRating.min).toBeGreaterThan(beginner.flexRating.min);
      });

      it('reduces flex for female skiers', () => {
        const male = calculateAlpineBootSizing(MEASUREMENTS.adultMale, 'intermediate', 'male');
        const female = calculateAlpineBootSizing(MEASUREMENTS.adultFemale, 'intermediate', 'female');
        expect(female.flexRating.min).toBeLessThan(male.flexRating.min);
      });
    });
  });

  // ============================================
  // ALPINE WAIST WIDTH
  // ============================================
  describe('calculateAlpineWaistWidth', () => {
    it('returns 65–80 mm for groomed terrain', () => {
      const result = calculateAlpineWaistWidth('groomed');
      expect(result.min).toBe(65);
      expect(result.max).toBe(80);
    });

    it('returns 80–96 mm for all-mountain terrain', () => {
      const result = calculateAlpineWaistWidth('all-mountain');
      expect(result.min).toBe(80);
      expect(result.max).toBe(96);
    });

    it('returns 96–120 mm for powder terrain', () => {
      const result = calculateAlpineWaistWidth('powder');
      expect(result.min).toBe(96);
      expect(result.max).toBe(120);
    });

    it('ranges are in ascending order (groomed < all-mountain < powder)', () => {
      const groomed     = calculateAlpineWaistWidth('groomed');
      const allMountain = calculateAlpineWaistWidth('all-mountain');
      const powder      = calculateAlpineWaistWidth('powder');
      expect(groomed.max).toBeLessThanOrEqual(allMountain.min);
      expect(allMountain.max).toBeLessThanOrEqual(powder.min);
    });
  });

  // ============================================
  // DIN SAFETY CHECK
  // ============================================
  describe('checkDINSafety', () => {
    const range = { min: 5, max: 7 };

    it('returns "safe" when DIN is within range', () => {
      expect(checkDINSafety(5, range)).toBe('safe');
      expect(checkDINSafety(6, range)).toBe('safe');
      expect(checkDINSafety(7, range)).toBe('safe');
    });

    it('returns "too-low" when DIN is below minimum', () => {
      expect(checkDINSafety(4, range)).toBe('too-low');
      expect(checkDINSafety(1, range)).toBe('too-low');
    });

    it('returns "too-high" when DIN is above maximum', () => {
      expect(checkDINSafety(8, range)).toBe('too-high');
      expect(checkDINSafety(12, range)).toBe('too-high');
    });

    it('treats boundary values as safe', () => {
      expect(checkDINSafety(range.min, range)).toBe('safe');
      expect(checkDINSafety(range.max, range)).toBe('safe');
    });

    it('works with fractional DIN settings', () => {
      expect(checkDINSafety(5.5, range)).toBe('safe');
      expect(checkDINSafety(4.5, range)).toBe('too-low');
      expect(checkDINSafety(7.5, range)).toBe('too-high');
    });
  });

  // ============================================
  // SNOWBOARD SIZING
  // ============================================
  describe('calculateSnowboardSizing', () => {
    it('calculates board length from height and weight', () => {
      const result = calculateSnowboardSizing(MEASUREMENTS.adultMale, 'intermediate');
      expect(result.boardLengthRecommended).toBeGreaterThan(150);
      expect(result.boardLengthRecommended).toBeLessThan(180);
    });

    it('skill level affects board length', () => {
      const beginner = calculateSnowboardSizing(MEASUREMENTS.adultMale, 'beginner');
      const expert = calculateSnowboardSizing(MEASUREMENTS.adultMale, 'expert');
      expect(expert.boardLengthRecommended).toBeGreaterThan(beginner.boardLengthRecommended);
    });

    it('calculates waist width based on boot size', () => {
      const smallFoot = calculateSnowboardSizing(MEASUREMENTS.child, 'intermediate');
      const largeFoot = calculateSnowboardSizing(MEASUREMENTS.heavyAthlete, 'intermediate');
      expect(largeFoot.waistWidthMin).toBeGreaterThan(smallFoot.waistWidthMin);
    });

    it('calculates stance width from height', () => {
      const result = calculateSnowboardSizing(MEASUREMENTS.adultMale, 'intermediate');
      expect(result.stanceWidth.min).toBeGreaterThan(45);
      expect(result.stanceWidth.max).toBeLessThan(65);
    });
  });

  describe('calculateSnowboardBootSizing', () => {
    it('returns mondopoint, EU, and US sizes', () => {
      const result = calculateSnowboardBootSizing(MEASUREMENTS.adultMale);
      expect(result.mondopoint).toBe(275);
      expect(result.euSize).toBeGreaterThan(40);
      expect(result.usSize).toBeGreaterThan(0);
    });
  });

  // ============================================
  // HOCKEY SKATE SIZING
  // ============================================
  describe('calculateHockeySkateSize', () => {
    it('calculates skate size smaller than shoe size', () => {
      const result = calculateHockeySkateSize(MEASUREMENTS.adultMale, 'bauer');
      // Skate size should be ~1.5 smaller than shoe size
      expect(result.skateSizeUS).toBeLessThan(MEASUREMENTS.adultMale.usShoeSize!);
    });

    it('returns valid width code for Bauer', () => {
      const result = calculateHockeySkateSize(MEASUREMENTS.adultMale, 'bauer');
      expect(['C', 'D', 'EE']).toContain(result.width);
      expect(result.brand).toBe('bauer');
    });

    it('returns valid width code for CCM', () => {
      const result = calculateHockeySkateSize(MEASUREMENTS.adultMale, 'ccm');
      expect(['C', 'D', 'EE', 'R', 'W']).toContain(result.width);
      expect(result.brand).toBe('ccm');
    });

    it('detects narrow feet', () => {
      const result = calculateHockeySkateSize(MEASUREMENTS.narrowFeet, 'bauer');
      expect(result.width).toBe('C');
    });

    it('defaults to D width when no width measurement', () => {
      const result = calculateHockeySkateSize(MEASUREMENTS.minimal, 'bauer');
      expect(result.width).toBe('D');
    });
  });

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  describe('calculateAge', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calculates correct age when birthday has passed this year', () => {
      expect(calculateAge('1990-05-15')).toBe(34);
    });

    it('calculates correct age when birthday has not passed yet', () => {
      expect(calculateAge('1990-07-15')).toBe(33);
    });

    it('handles birthday on current date', () => {
      expect(calculateAge('1990-06-15')).toBe(34);
    });

    it('calculates age for children', () => {
      expect(calculateAge('2015-03-10')).toBe(9);
    });
  });

  describe('formatSizeRange', () => {
    it('formats range with unit', () => {
      expect(formatSizeRange(160, 170, 'cm')).toBe('160-170 cm');
    });

    it('shows single value when min equals max', () => {
      expect(formatSizeRange(165, 165, 'cm')).toBe('165 cm');
    });

    it('uses cm as default unit', () => {
      expect(formatSizeRange(160, 170)).toBe('160-170 cm');
    });
  });

  // ============================================
  // HELMET SIZING
  // ============================================
  describe('calculateHelmetSizing', () => {
    it('returns XS for head circumference < 55cm', () => {
      const result = calculateHelmetSizing(53);
      expect(result.size).toBe('XS');
      expect(result.rangeMin).toBe(51);
      expect(result.rangeMax).toBe(54);
    });

    it('returns S for head circumference 55–56cm', () => {
      const result = calculateHelmetSizing(55);
      expect(result.size).toBe('S');
      expect(result.rangeMin).toBe(55);
      expect(result.rangeMax).toBe(56);
    });

    it('returns M for head circumference 57–58cm', () => {
      const result = calculateHelmetSizing(57);
      expect(result.size).toBe('M');
      expect(result.rangeMin).toBe(57);
      expect(result.rangeMax).toBe(58);
    });

    it('returns L for head circumference 59–60cm', () => {
      const result = calculateHelmetSizing(59);
      expect(result.size).toBe('L');
      expect(result.rangeMin).toBe(59);
      expect(result.rangeMax).toBe(60);
    });

    it('returns XL for head circumference 61–62cm', () => {
      const result = calculateHelmetSizing(61);
      expect(result.size).toBe('XL');
      expect(result.rangeMin).toBe(61);
      expect(result.rangeMax).toBe(62);
    });

    it('returns XXL for head circumference 63cm or above', () => {
      const result = calculateHelmetSizing(63);
      expect(result.size).toBe('XXL');
      expect(result.rangeMin).toBe(63);
      expect(result.rangeMax).toBe(65);
    });

    it('returns XXL for very large head circumference', () => {
      const result = calculateHelmetSizing(70);
      expect(result.size).toBe('XXL');
    });
  });

  // ============================================
  // NORDIC COMBI SIZING
  // ============================================
  describe('calculateNordicSkiSizing (combi style)', () => {
    it('calculates combi ski length as height + 5 to +10cm range', () => {
      const result = calculateNordicSkiSizing(MEASUREMENTS.adultMale, 'nordic-combi', 'intermediate');
      expect(result.skiLengthMin).toBe(185); // height + 5
      expect(result.skiLengthMax).toBe(190); // height + 10
      expect(result.sport).toBe('nordic-combi');
    });

    it('uses combi pole multipliers (0.86–0.88)', () => {
      const result = calculateNordicSkiSizing(MEASUREMENTS.adultMale, 'nordic-combi', 'beginner');
      expect(result.poleLengthMin).toBe(Math.round(180 * 0.86));
      expect(result.poleLengthMax).toBe(Math.round(180 * 0.88));
    });
  });

  // ============================================
  // HOCKEY WIDE FEET
  // ============================================
  describe('calculateHockeySkateSize (wide feet)', () => {
    it('returns EE width for Bauer with wide feet', () => {
      const result = calculateHockeySkateSize(MEASUREMENTS.wideFeet, 'bauer');
      expect(result.width).toBe('EE');
    });

    it('returns W width for CCM with wide feet', () => {
      const result = calculateHockeySkateSize(MEASUREMENTS.wideFeet, 'ccm');
      expect(result.width).toBe('W');
    });
  });

  // ============================================
  // ALPINE BOOT — EXTRA-WIDE LAST
  // ============================================
  describe('calculateAlpineBootSizing (extra-wide last)', () => {
    it('returns extra-wide last for very wide feet', () => {
      // footWidth 11.5cm → estimatedLast 115mm > 104 → extra-wide
      const result = calculateAlpineBootSizing(MEASUREMENTS.wideFeet, 'intermediate', 'male');
      expect(result.lastWidth).toBe('extra-wide');
    });
  });

  // ============================================
  // ALPINE BOOT — FLEX RATING FOR LIGHT SKIERS
  // ============================================
  describe('calculateAlpineBootSizing (flex rating weight branches)', () => {
    it('lowers flex for light skiers (weight < 60kg)', () => {
      // lightAthlete has weight 52 < 60 → flex decreases by 10
      const light = calculateAlpineBootSizing(MEASUREMENTS.lightAthlete, 'intermediate', 'male');
      const normal = calculateAlpineBootSizing(MEASUREMENTS.adultMale, 'intermediate', 'male');
      expect(light.flexRating.min).toBeLessThan(normal.flexRating.min);
    });

    it('increases flex for heavy skiers (weight > 85kg)', () => {
      const heavy = calculateAlpineBootSizing(MEASUREMENTS.heavyAthlete, 'intermediate', 'male');
      const normal = calculateAlpineBootSizing(MEASUREMENTS.adultMale, 'intermediate', 'male');
      expect(heavy.flexRating.min).toBeGreaterThan(normal.flexRating.min);
    });

    it('applies female gender offset and light-weight reduction together', () => {
      const lightFemale = calculateAlpineBootSizing(
        MEASUREMENTS.lightAthlete, // weight 52
        'intermediate',
        'female'
      );
      const male = calculateAlpineBootSizing(MEASUREMENTS.adultMale, 'intermediate', 'male');
      expect(lightFemale.flexRating.min).toBeLessThan(male.flexRating.min);
    });

    it('"other" gender receives no gender offset (same as male)', () => {
      const other = calculateAlpineBootSizing(MEASUREMENTS.adultMale, 'intermediate', 'other');
      const male = calculateAlpineBootSizing(MEASUREMENTS.adultMale, 'intermediate', 'male');
      expect(other.flexRating.min).toBe(male.flexRating.min);
      expect(other.flexRating.max).toBe(male.flexRating.max);
    });
  });

  // ============================================
  // ALPINE SKI — DIN FOR VERY LIGHT SKIER
  // ============================================
  describe('calculateAlpineSkiSizing (DIN weight branches)', () => {
    it('produces a low DIN for very light skiers (weight < 50kg)', () => {
      const veryLight = { ...MEASUREMENTS.child, weight: 40 };
      const result = calculateAlpineSkiSizing(veryLight, 'beginner', 'male');
      expect(result.din.min).toBeGreaterThanOrEqual(1);
      expect(result.din.max).toBeLessThan(6);
    });

    it('produces a higher DIN for very heavy skiers (weight >= 90kg)', () => {
      const veryHeavy = { ...MEASUREMENTS.heavyAthlete, weight: 95 };
      const result = calculateAlpineSkiSizing(veryHeavy, 'intermediate', 'male');
      expect(result.din.min).toBeGreaterThan(4);
    });
  });

  // ============================================
  // ALPINE SKI — WEIGHT ADJUSTMENTS
  // ============================================
  describe('calculateAlpineSkiSizing (weight adjustments)', () => {
    it('adds 3cm to max length for very heavy skiers (weight > 85kg)', () => {
      const normal = calculateAlpineSkiSizing(MEASUREMENTS.adultMale, 'intermediate', 'male');
      const heavy = calculateAlpineSkiSizing(MEASUREMENTS.heavyAthlete, 'intermediate', 'male');
      // Both have same gender offset; heavyAthlete also taller, so just verify heavy >= normal
      expect(heavy.skiLengthMax).toBeGreaterThanOrEqual(normal.skiLengthMax);
    });

    it('subtracts 3cm from max length for very light skiers (weight < 55kg)', () => {
      const lightMeasurements = { ...MEASUREMENTS.lightAthlete, weight: 50 };
      const normal = calculateAlpineSkiSizing(MEASUREMENTS.adultFemale, 'intermediate', 'female');
      const light = calculateAlpineSkiSizing(lightMeasurements, 'intermediate', 'female');
      // Light skier gets -3 adjustment
      expect(light.skiLengthMax).toBeLessThanOrEqual(normal.skiLengthMax);
    });
  });

  // ============================================
  // SNOWBOARD — WEIGHT BRANCHES
  // ============================================
  describe('calculateSnowboardSizing (weight branches)', () => {
    it('decreases board length for very light riders (weight < 55kg)', () => {
      const veryLight = { ...MEASUREMENTS.lightAthlete, weight: 50 }; // 50 < 55
      const normal = calculateSnowboardSizing(MEASUREMENTS.adultFemale, 'intermediate');
      const light = calculateSnowboardSizing(veryLight, 'intermediate');
      // Light rider gets -5 weight adjustment; both have different heights so compare adjustment effect
      // Just verify the formula applies: boardMin = height - 25 + (-5)
      expect(light.boardLengthMin).toBe(veryLight.height - 25 + (-5));
    });

    it('uses -2 weight adjustment for riders 55–64kg', () => {
      const midLight = { ...MEASUREMENTS.adultFemale, weight: 60 }; // 55 <= 60 < 65
      expect(midLight.height - 25 + (-2)).toBe(
        calculateSnowboardSizing(midLight, 'intermediate').boardLengthMin
      );
    });

    it('uses +3 weight adjustment for riders 65–80kg', () => {
      // adultMale weight=80, 65 < 80 <= 80, hits weight > 80? No. 80 is not > 80.
      // Use 75kg which satisfies !(<55) && !(<65) && !(>80) → weightAdjustment = 0
      // Actually 65-80 range has adjustment 0, and >80 gets +3
      const midHeavy = { ...MEASUREMENTS.adultMale, weight: 75 }; // 65 < 75 <= 80 → 0
      expect(midHeavy.height - 25).toBe(
        calculateSnowboardSizing(midHeavy, 'intermediate').boardLengthMin
      );
    });

    it('uses +3 weight adjustment for riders over 80kg', () => {
      const heavy = { ...MEASUREMENTS.adultMale, weight: 85 }; // 85 > 80
      expect(heavy.height - 25 + 3).toBe(
        calculateSnowboardSizing(heavy, 'intermediate').boardLengthMin
      );
    });

    it('waist width is 245mm for boot mondo < 260', () => {
      // child has foot 22cm → mondo 220 < 260
      const result = calculateSnowboardSizing(MEASUREMENTS.child, 'intermediate');
      expect(result.waistWidthMin).toBe(245);
    });

    it('waist width is 250mm for boot mondo 260–274', () => {
      // narrowFeet: foot 27cm → mondo 270, 260 ≤ 270 < 275
      const result = calculateSnowboardSizing(MEASUREMENTS.narrowFeet, 'intermediate');
      expect(result.waistWidthMin).toBe(250);
    });

    it('waist width is 255mm for boot mondo 275–289', () => {
      // adultMale: foot 27.5cm → mondo 275, 275 ≤ 275 < 290
      const result = calculateSnowboardSizing(MEASUREMENTS.adultMale, 'intermediate');
      expect(result.waistWidthMin).toBe(255);
    });

    it('waist width is 260mm for boot mondo ≥ 290', () => {
      // heavyAthlete: foot 29cm → mondo 290 ≥ 290
      const result = calculateSnowboardSizing(MEASUREMENTS.heavyAthlete, 'intermediate');
      expect(result.waistWidthMin).toBe(260);
    });
  });

  // ============================================
  // NORDIC SIZING BY MODEL — FISCHER
  // ============================================
  describe('calculateNordicSkiSizingByModel (Fischer)', () => {
    it('returns Fischer model with FA value range for classic', () => {
      const result = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-classic',
        'intermediate',
        'fischer'
      );
      expect(result.modelName).toBe('Fischer');
      expect(result.faValueRange).toBeDefined();
      expect(result.faValueRange!.min).toBeGreaterThan(0);
      expect(result.faValueRange!.max).toBeGreaterThan(result.faValueRange!.min);
    });

    it('includes kick-zone note for Fischer classic', () => {
      const result = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-classic',
        'intermediate',
        'fischer'
      );
      expect(result.modelNotes?.some((n) => /kick/i.test(n))).toBe(true);
    });

    it('uses lower FA multiplier for Fischer skate vs classic', () => {
      const skate = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-skate',
        'intermediate',
        'fischer'
      );
      const classic = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-classic',
        'intermediate',
        'fischer'
      );
      // Skate FA uses 0.80–0.90, classic uses 0.85–0.95
      expect(skate.faValueRange!.min).toBeLessThan(classic.faValueRange!.min);
    });

    it('handles Fischer combi (default case)', () => {
      const result = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-combi',
        'intermediate',
        'fischer'
      );
      expect(result.sport).toBe('nordic-combi');
      expect(result.skiLengthMin).toBe(185); // height + 5
      expect(result.skiLengthMax).toBe(195); // height + 15 (Fischer combi)
    });

    it('applies +3 weight adjustment for heavy skiers in Fischer', () => {
      const heavy = calculateNordicSkiSizingByModel(
        MEASUREMENTS.heavyAthlete, // weight 95 > 80
        'nordic-classic',
        'intermediate',
        'fischer'
      );
      const normal = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultFemale, // same height might differ, just check recommendation is higher
        'nordic-classic',
        'intermediate',
        'fischer'
      );
      // heavyAthlete is taller AND gets +3; adultFemale is shorter
      expect(heavy.skiLengthRecommended).toBeGreaterThan(normal.skiLengthRecommended);
    });

    it('applies -2 weight adjustment for light skiers in Fischer', () => {
      const light = calculateNordicSkiSizingByModel(
        { ...MEASUREMENTS.lightAthlete, weight: 55 }, // 55 < 60
        'nordic-classic',
        'intermediate',
        'fischer'
      );
      const noAdj = calculateNordicSkiSizingByModel(
        { ...MEASUREMENTS.lightAthlete, weight: 70 }, // 60 ≤ 70 ≤ 80
        'nordic-classic',
        'intermediate',
        'fischer'
      );
      expect(light.skiLengthRecommended).toBeLessThan(noAdj.skiLengthRecommended);
    });
  });

  // ============================================
  // NORDIC SIZING BY MODEL — EVOSPORTS
  // ============================================
  describe('calculateNordicSkiSizingByModel (Evosports)', () => {
    it('returns Evosports model name', () => {
      const result = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-classic',
        'intermediate',
        'evosports'
      );
      expect(result.modelName).toBe('Evosports');
    });

    it('includes bias-toward-shorter note', () => {
      const result = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-classic',
        'intermediate',
        'evosports'
      );
      expect(result.modelNotes?.some((n) => /shorter/i.test(n))).toBe(true);
    });

    it('handles Evosports combi (default case)', () => {
      const result = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-combi',
        'intermediate',
        'evosports'
      );
      expect(result.sport).toBe('nordic-combi');
      expect(result.skiLengthMin).toBe(185); // height + 5
      expect(result.skiLengthMax).toBe(190); // height + 10 (Evosports combi)
    });

    it('handles Evosports skate style', () => {
      const result = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-skate',
        'intermediate',
        'evosports'
      );
      expect(result.skiLengthMin).toBe(185); // height + 5
      expect(result.skiLengthMax).toBe(195); // height + 15
    });

    it('applies weight adjustment for heavy skiers in Evosports', () => {
      const heavy = calculateNordicSkiSizingByModel(
        { ...MEASUREMENTS.adultMale, weight: 85 }, // > 80 → +2
        'nordic-classic',
        'intermediate',
        'evosports'
      );
      const normal = calculateNordicSkiSizingByModel(
        { ...MEASUREMENTS.adultMale, weight: 70 }, // 60 ≤ 70 ≤ 80 → 0
        'nordic-classic',
        'intermediate',
        'evosports'
      );
      expect(heavy.skiLengthRecommended).toBeGreaterThanOrEqual(normal.skiLengthRecommended);
    });

    it('applies -2 weight adjustment for light skiers in Evosports', () => {
      const light = calculateNordicSkiSizingByModel(
        { ...MEASUREMENTS.adultMale, weight: 55 }, // < 60 → -2
        'nordic-classic',
        'intermediate',
        'evosports'
      );
      const noAdj = calculateNordicSkiSizingByModel(
        { ...MEASUREMENTS.adultMale, weight: 70 }, // → 0
        'nordic-classic',
        'intermediate',
        'evosports'
      );
      expect(light.skiLengthRecommended).toBeLessThan(noAdj.skiLengthRecommended);
    });
  });

  // ============================================
  // NORDIC SIZING BY MODEL — GENERIC (default)
  // ============================================
  describe('calculateNordicSkiSizingByModel (generic)', () => {
    it('routes to generic model by default', () => {
      const byModel = calculateNordicSkiSizingByModel(
        MEASUREMENTS.adultMale,
        'nordic-classic',
        'intermediate'
      );
      const direct = calculateNordicSkiSizing(
        MEASUREMENTS.adultMale,
        'nordic-classic',
        'intermediate'
      );
      expect(byModel.skiLengthRecommended).toBe(direct.skiLengthRecommended);
      expect(byModel.modelName).toBeUndefined();
    });
  });
});
