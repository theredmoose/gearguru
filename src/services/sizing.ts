import type {
  Measurements,
  SkillLevel,
  SizingModel,
  AlpineTerrain,
  NordicSkiSizing,
  NordicBootSizing,
  AlpineSkiSizing,
  AlpineBootSizing,
  SnowboardSizing,
  SnowboardBootSizing,
  HockeySkateSize,
} from '../types';
import { getShoeSizesFromFootLength } from './shoeSize';

// ============================================
// NORDIC SKIING
// ============================================

/**
 * Calculate Nordic ski and pole sizing
 *
 * Classic skis: height + 10-20cm (beginner shorter, expert longer)
 * Skate skis: height + 5-15cm
 * Combi skis: height + 5-10cm (versatile middle ground)
 *
 * Classic poles: height × 0.83-0.85
 * Skate poles: height × 0.89-0.91
 */
export function calculateNordicSkiSizing(
  measurements: Measurements,
  style: 'nordic-classic' | 'nordic-skate' | 'nordic-combi',
  skillLevel: SkillLevel
): NordicSkiSizing {
  const { height, weight } = measurements;

  // Skill level adjustments (higher skill = longer skis within range)
  const skillMultiplier: Record<SkillLevel, number> = {
    beginner: 0,
    intermediate: 0.33,
    advanced: 0.66,
    expert: 1,
  };
  const skill = skillMultiplier[skillLevel];

  let skiMin: number;
  let skiMax: number;
  let poleMultiplierMin: number;
  let poleMultiplierMax: number;

  switch (style) {
    case 'nordic-classic':
      skiMin = height + 10;
      skiMax = height + 20;
      poleMultiplierMin = 0.83;
      poleMultiplierMax = 0.85;
      break;
    case 'nordic-skate':
      skiMin = height + 5;
      skiMax = height + 15;
      poleMultiplierMin = 0.89;
      poleMultiplierMax = 0.91;
      break;
    case 'nordic-combi':
      skiMin = height + 5;
      skiMax = height + 10;
      poleMultiplierMin = 0.86;
      poleMultiplierMax = 0.88;
      break;
  }

  // Weight adjustment: heavier skiers benefit from slightly longer skis
  const weightAdjustment = weight > 80 ? 2 : weight < 60 ? -2 : 0;

  const skiRecommended = Math.round(
    skiMin + (skiMax - skiMin) * skill + weightAdjustment
  );

  const poleMin = Math.round(height * poleMultiplierMin);
  const poleMax = Math.round(height * poleMultiplierMax);
  const poleRecommended = Math.round(
    poleMin + (poleMax - poleMin) * skill
  );

  return {
    sport: style,
    skiLengthMin: skiMin,
    skiLengthMax: skiMax,
    skiLengthRecommended: skiRecommended,
    poleLengthMin: poleMin,
    poleLengthMax: poleMax,
    poleLengthRecommended: poleRecommended,
  };
}

/**
 * Fischer Nordic sizing chart.
 *
 * Fischer uses slightly wider length brackets (especially for performance
 * skiers) and adds FA Value — the recommended ski stiffness expressed as
 * a percentage of body weight in kg.
 *
 * Classic FA:  body weight × 0.85–0.95 kg  (skin/zero-kick skis)
 * Skate  FA:  body weight × 0.80–0.90 kg  (lighter flex for speed)
 *
 * Length ranges follow Fischer's published fit guide:
 *   Classic  beginner →expert : height +10 to +30 cm
 *   Skate    beginner →expert : height  +5 to +25 cm
 */
function calculateNordicSkiSizingFischer(
  measurements: Measurements,
  style: 'nordic-classic' | 'nordic-skate' | 'nordic-combi',
  skillLevel: SkillLevel
): NordicSkiSizing {
  const { height, weight } = measurements;

  const skillMultiplier: Record<SkillLevel, number> = {
    beginner: 0, intermediate: 0.33, advanced: 0.66, expert: 1,
  };
  const skill = skillMultiplier[skillLevel];

  let skiMin: number;
  let skiMax: number;
  let poleMultiplierMin: number;
  let poleMultiplierMax: number;

  switch (style) {
    case 'nordic-classic':
      skiMin = height + 10;
      skiMax = height + 30;
      poleMultiplierMin = 0.83;
      poleMultiplierMax = 0.87;
      break;
    case 'nordic-skate':
      skiMin = height + 5;
      skiMax = height + 25;
      poleMultiplierMin = 0.90;
      poleMultiplierMax = 0.93;
      break;
    default: // combi
      skiMin = height + 5;
      skiMax = height + 15;
      poleMultiplierMin = 0.86;
      poleMultiplierMax = 0.88;
  }

  const weightAdjustment = weight > 80 ? 3 : weight < 60 ? -2 : 0;
  const skiRecommended = Math.round(skiMin + (skiMax - skiMin) * skill + weightAdjustment);

  const poleMin = Math.round(height * poleMultiplierMin);
  const poleMax = Math.round(height * poleMultiplierMax);
  const poleRecommended = Math.round(poleMin + (poleMax - poleMin) * skill);

  // FA Value: recommended ski stiffness (spring load) in kg
  const faMin = style === 'nordic-skate'
    ? Math.round(weight * 0.80)
    : Math.round(weight * 0.85);
  const faMax = style === 'nordic-skate'
    ? Math.round(weight * 0.90)
    : Math.round(weight * 0.95);

  const notes: string[] = [
    `FA Value ${faMin}–${faMax} kg — confirm ski flex matches your body weight at a Fischer dealer.`,
  ];
  if (style === 'nordic-classic') {
    notes.push('Fischer recommends kick-zone testing (paper test) when selecting classic ski length.');
  }

  return {
    sport: style,
    skiLengthMin: skiMin,
    skiLengthMax: skiMax,
    skiLengthRecommended: skiRecommended,
    poleLengthMin: poleMin,
    poleLengthMax: poleMax,
    poleLengthRecommended: poleRecommended,
    faValueRange: { min: faMin, max: faMax },
    modelName: 'Fischer',
    modelNotes: notes,
  };
}

/**
 * Evosports Nordic sizing guide.
 *
 * Evosports (Canadian Nordic distributor/retailer) follows industry-standard
 * length tables but emphasises fit-first sizing — they recommend erring toward
 * the shorter end of a range for recreational skiers to maximise control.
 *
 * Lengths match the generic formula; the key differentiator is the pole
 * ratio (slightly longer skate poles for double-poling efficiency) and
 * a bias toward the lower half of the range for beginners/intermediate.
 */
function calculateNordicSkiSizingEvosports(
  measurements: Measurements,
  style: 'nordic-classic' | 'nordic-skate' | 'nordic-combi',
  skillLevel: SkillLevel
): NordicSkiSizing {
  const { height, weight } = measurements;

  const skillMultiplier: Record<SkillLevel, number> = {
    beginner: 0, intermediate: 0.25, advanced: 0.66, expert: 1,
  };
  const skill = skillMultiplier[skillLevel];

  let skiMin: number;
  let skiMax: number;
  let poleMultiplierMin: number;
  let poleMultiplierMax: number;

  switch (style) {
    case 'nordic-classic':
      skiMin = height + 10;
      skiMax = height + 20;
      poleMultiplierMin = 0.83;
      poleMultiplierMax = 0.85;
      break;
    case 'nordic-skate':
      skiMin = height + 5;
      skiMax = height + 15;
      poleMultiplierMin = 0.90;
      poleMultiplierMax = 0.92;
      break;
    default: // combi
      skiMin = height + 5;
      skiMax = height + 10;
      poleMultiplierMin = 0.86;
      poleMultiplierMax = 0.88;
  }

  const weightAdjustment = weight > 80 ? 2 : weight < 60 ? -2 : 0;
  // Evosports bias: recommend toward the shorter (more manageable) end
  const skiRecommended = Math.round(skiMin + (skiMax - skiMin) * skill * 0.85 + weightAdjustment);

  const poleMin = Math.round(height * poleMultiplierMin);
  const poleMax = Math.round(height * poleMultiplierMax);
  const poleRecommended = Math.round(poleMin + (poleMax - poleMin) * skill);

  const notes: string[] = [
    'Evosports recommends choosing the shorter end of the range for all-round recreational use.',
    'Longer skis offer more glide; shorter skis are easier to control in varied terrain.',
  ];

  return {
    sport: style,
    skiLengthMin: skiMin,
    skiLengthMax: skiMax,
    skiLengthRecommended: skiRecommended,
    poleLengthMin: poleMin,
    poleLengthMax: poleMax,
    poleLengthRecommended: poleRecommended,
    modelName: 'Evosports',
    modelNotes: notes,
  };
}

/**
 * Unified Nordic sizing dispatcher — routes to the correct model.
 */
export function calculateNordicSkiSizingByModel(
  measurements: Measurements,
  style: 'nordic-classic' | 'nordic-skate' | 'nordic-combi',
  skillLevel: SkillLevel,
  model: SizingModel = 'generic'
): NordicSkiSizing {
  switch (model) {
    case 'fischer':   return calculateNordicSkiSizingFischer(measurements, style, skillLevel);
    case 'evosports': return calculateNordicSkiSizingEvosports(measurements, style, skillLevel);
    default:          return calculateNordicSkiSizing(measurements, style, skillLevel);
  }
}

/**
 * Calculate Nordic boot sizing
 * Mondopoint = foot length in cm × 10
 */
export function calculateNordicBootSizing(
  measurements: Measurements
): NordicBootSizing {
  const footLength = Math.max(
    measurements.footLengthLeft,
    measurements.footLengthRight
  );

  const mondopoint = Math.round(footLength * 10);

  // EU size approximation: mondo / 10 * 1.5 + 2
  const euSize = Math.round(footLength * 1.5 + 2);

  // US size: EU - 32 for men (simplified)
  const usSize = euSize - 32;

  return {
    mondopoint,
    euSize,
    usSize: Math.max(usSize, 1),
  };
}

// ============================================
// ALPINE SKIING
// ============================================

/**
 * Calculate Alpine ski sizing
 *
 * General rule: chin to forehead height
 * - Beginners: chin height (height - 15 to 20cm)
 * - Intermediate: nose height (height - 10 to 15cm)
 * - Advanced: forehead/top of head (height - 5 to 10cm)
 * - Expert: at height or slightly above
 *
 * Weight affects stiffness needs and can shift length
 */
export function calculateAlpineSkiSizing(
  measurements: Measurements,
  skillLevel: SkillLevel,
  gender: 'male' | 'female' | 'other'
): AlpineSkiSizing {
  const { height, weight } = measurements;

  // Base ranges by skill
  const ranges: Record<SkillLevel, { min: number; max: number }> = {
    beginner: { min: -20, max: -15 },
    intermediate: { min: -15, max: -10 },
    advanced: { min: -10, max: -5 },
    expert: { min: -5, max: 5 },
  };

  const range = ranges[skillLevel];

  // Gender adjustment (women often prefer slightly shorter)
  const genderOffset = gender === 'female' ? -3 : 0;

  // Weight adjustment
  const weightAdjustment = weight > 85 ? 3 : weight < 55 ? -3 : 0;

  const skiMin = height + range.min + genderOffset;
  const skiMax = height + range.max + genderOffset + weightAdjustment;
  const skiRecommended = Math.round((skiMin + skiMax) / 2);

  // DIN settings based on weight and skill
  const din = calculateDIN(weight, skillLevel);

  return {
    skiLengthMin: Math.round(skiMin),
    skiLengthMax: Math.round(skiMax),
    skiLengthRecommended: skiRecommended,
    din,
  };
}

/**
 * Recommend alpine ski waist width range based on terrain preference.
 *
 * Waist width (the narrowest point of the ski) is the primary driver of
 * how a ski performs in different snow/terrain conditions:
 *   groomed      65–80 mm  — hardpack, carving, race
 *   all-mountain 80–96 mm  — versatile, mixed conditions
 *   powder       96–120 mm — off-piste, soft snow, freeride
 */
export function calculateAlpineWaistWidth(
  terrain: AlpineTerrain
): { min: number; max: number } {
  const ranges: Record<AlpineTerrain, { min: number; max: number }> = {
    'groomed':      { min: 65,  max: 80  },
    'all-mountain': { min: 80,  max: 96  },
    'powder':       { min: 96,  max: 120 },
  };
  return ranges[terrain];
}

/**
 * Check whether a stored DIN setting is within the recommended safe range
 * for a given member profile.
 *
 * - 'too-low'  → binding may pre-release during normal skiing (fall risk)
 * - 'safe'     → within recommended range
 * - 'too-high' → binding unlikely to release in a crash (injury risk)
 *
 * The recommendedRange should come from AlpineSkiSizing.din (calculateAlpineSkiSizing).
 */
export type DINSafetyStatus = 'too-low' | 'safe' | 'too-high';

export function checkDINSafety(
  dinSetting: number,
  recommendedRange: { min: number; max: number }
): DINSafetyStatus {
  if (dinSetting < recommendedRange.min) return 'too-low';
  if (dinSetting > recommendedRange.max) return 'too-high';
  return 'safe';
}

/**
 * Calculate DIN release setting
 * This is a simplified calculation - actual DIN should be set by a professional
 */
function calculateDIN(
  weight: number,
  skillLevel: SkillLevel
): { min: number; max: number } {
  // Base DIN from weight (very simplified)
  let baseDIN: number;
  if (weight < 50) baseDIN = 3;
  else if (weight < 60) baseDIN = 4;
  else if (weight < 70) baseDIN = 5;
  else if (weight < 80) baseDIN = 6;
  else if (weight < 90) baseDIN = 7;
  else baseDIN = 8;

  // Skill adjustment
  const skillOffset: Record<SkillLevel, number> = {
    beginner: -1,
    intermediate: 0,
    advanced: 1,
    expert: 2,
  };

  const adjusted = baseDIN + skillOffset[skillLevel];

  return {
    min: Math.max(adjusted - 1, 1),
    max: Math.min(adjusted + 1, 12),
  };
}

/**
 * Calculate Alpine boot sizing
 *
 * Mondopoint = foot length in cm × 10
 * Shell size often rounds down (e.g., mondo 270-275 = shell 27)
 * Flex rating based on weight, skill, and gender
 * Last width from foot width measurements
 */
export function calculateAlpineBootSizing(
  measurements: Measurements,
  skillLevel: SkillLevel,
  gender: 'male' | 'female' | 'other'
): AlpineBootSizing {
  const footLength = Math.max(
    measurements.footLengthLeft,
    measurements.footLengthRight
  );
  const footWidth = Math.max(
    measurements.footWidthLeft ?? 0,
    measurements.footWidthRight ?? 0
  );

  const mondopoint = Math.round(footLength * 10);

  // Shell size (typically in 1cm increments, round to nearest)
  const shellSize = Math.round(footLength);

  // EU/US conversions
  const euSize = Math.round(footLength * 1.5 + 2);
  const usSize = Math.max(euSize - 32, 1);

  // Last width determination
  const { lastWidth, lastWidthMm } = calculateLastWidth(footWidth);

  // Flex rating
  const flexRating = calculateFlexRating(
    measurements.weight,
    skillLevel,
    gender
  );

  return {
    mondopoint,
    shellSize,
    euSize,
    usSize,
    lastWidth,
    lastWidthMm,
    flexRating,
  };
}

function calculateLastWidth(
  footWidth: number
): { lastWidth: AlpineBootSizing['lastWidth']; lastWidthMm: number } {
  // If no width measurement, estimate based on typical proportions
  if (!footWidth) {
    return { lastWidth: 'medium', lastWidthMm: 100 };
  }

  // Convert foot width to last width (boot manufacturers use specific scales)
  // This is an approximation - foot width × ~10 gives approximate last
  const estimatedLast = Math.round(footWidth * 10);

  let lastWidth: AlpineBootSizing['lastWidth'];
  if (estimatedLast < 98) {
    lastWidth = 'narrow';
  } else if (estimatedLast < 101) {
    lastWidth = 'medium';
  } else if (estimatedLast < 104) {
    lastWidth = 'wide';
  } else {
    lastWidth = 'extra-wide';
  }

  return { lastWidth, lastWidthMm: estimatedLast };
}

function calculateFlexRating(
  weight: number,
  skillLevel: SkillLevel,
  gender: 'male' | 'female' | 'other'
): { min: number; max: number } {
  // Base flex from skill level
  const skillFlex: Record<SkillLevel, { min: number; max: number }> = {
    beginner: { min: 60, max: 80 },
    intermediate: { min: 80, max: 100 },
    advanced: { min: 100, max: 120 },
    expert: { min: 120, max: 140 },
  };

  let { min, max } = skillFlex[skillLevel];

  // Gender adjustment (women's boots typically 10-20 less)
  if (gender === 'female') {
    min -= 15;
    max -= 15;
  }

  // Weight adjustment
  if (weight > 85) {
    min += 10;
    max += 10;
  } else if (weight < 60) {
    min -= 10;
    max -= 10;
  }

  return {
    min: Math.max(min, 50),
    max: Math.min(max, 150),
  };
}

// ============================================
// SNOWBOARDING
// ============================================

/**
 * Calculate snowboard sizing
 *
 * General rule: board should reach between chin and nose
 * - Beginners: shorter (chin height, easier to control)
 * - Advanced: longer (more stability at speed)
 *
 * Weight is crucial - heavier riders need longer/stiffer boards
 * Waist width must accommodate boot size to prevent toe/heel drag
 */
export function calculateSnowboardSizing(
  measurements: Measurements,
  skillLevel: SkillLevel
): SnowboardSizing {
  const { height, weight } = measurements;
  const footLength = Math.max(
    measurements.footLengthLeft,
    measurements.footLengthRight
  );

  // Height-based range
  const heightBasedMin = height - 25;
  const heightBasedMax = height - 10;

  // Weight-based adjustment (more important than height for snowboards)
  let weightAdjustment = 0;
  if (weight < 55) weightAdjustment = -5;
  else if (weight < 65) weightAdjustment = -2;
  else if (weight > 80) weightAdjustment = 3;
  else if (weight > 90) weightAdjustment = 6;

  // Skill adjustment
  const skillOffset: Record<SkillLevel, number> = {
    beginner: -5,
    intermediate: 0,
    advanced: 3,
    expert: 5,
  };

  const boardMin = Math.round(heightBasedMin + weightAdjustment);
  const boardMax = Math.round(
    heightBasedMax + weightAdjustment + skillOffset[skillLevel]
  );
  const boardRecommended = Math.round((boardMin + boardMax) / 2);

  // Waist width based on boot size (Mondopoint)
  // Rough guide: boot size 260-265 = 250mm waist, larger boots need wider
  const mondopoint = footLength * 10;
  let waistWidthMin: number;
  if (mondopoint < 260) waistWidthMin = 245;
  else if (mondopoint < 275) waistWidthMin = 250;
  else if (mondopoint < 290) waistWidthMin = 255;
  else waistWidthMin = 260; // Wide board territory

  // Stance width: roughly shoulder width, typically 48-58cm
  const stanceMin = Math.round(height * 0.28);
  const stanceMax = Math.round(height * 0.33);

  return {
    boardLengthMin: boardMin,
    boardLengthMax: boardMax,
    boardLengthRecommended: boardRecommended,
    waistWidthMin,
    stanceWidth: { min: stanceMin, max: stanceMax },
  };
}

/**
 * Calculate snowboard boot sizing (similar to alpine)
 */
export function calculateSnowboardBootSizing(
  measurements: Measurements
): SnowboardBootSizing {
  const footLength = Math.max(
    measurements.footLengthLeft,
    measurements.footLengthRight
  );

  const mondopoint = Math.round(footLength * 10);
  const euSize = Math.round(footLength * 1.5 + 2);
  const usSize = Math.max(euSize - 32, 1);

  return {
    mondopoint,
    euSize,
    usSize,
  };
}

// ============================================
// HOCKEY
// ============================================

/**
 * Calculate hockey skate sizing
 *
 * Hockey skates typically run 1-1.5 sizes smaller than shoe size
 * Width varies by brand:
 * - Bauer: C (narrow), D (standard), EE (wide)
 * - CCM: C, D, EE, R (regular = D), W (wide = EE)
 *
 * Fit should be snug - toes lightly touching when standing,
 * slight gap when knees bent
 */
export function calculateHockeySkateSize(
  measurements: Measurements,
  brand: HockeySkateSize['brand'] = 'bauer'
): HockeySkateSize {
  const footLength = Math.max(
    measurements.footLengthLeft,
    measurements.footLengthRight
  );
  const footWidth = Math.max(
    measurements.footWidthLeft ?? 0,
    measurements.footWidthRight ?? 0
  );

  // US shoe size from foot length — use shared shoeSize service for consistency
  const shoeSizes = footLength > 0 ? getShoeSizesFromFootLength(footLength) : null;
  const usShoeSize = measurements.usShoeSize ?? shoeSizes?.usMen ?? 0;

  // Skate size is typically 1-1.5 smaller
  const skateSizeUS = Math.round((usShoeSize - 1.5) * 2) / 2; // Round to nearest 0.5

  // EU conversion (varies by brand, this is approximate)
  const skateSizeEU = Math.round(skateSizeUS + 33);

  // Width determination
  const width = determineSkateWidth(footWidth, footLength, brand);

  return {
    skateSizeUS: Math.max(skateSizeUS, 1),
    skateSizeEU,
    width,
    brand,
  };
}

function determineSkateWidth(
  footWidth: number,
  footLength: number,
  brand: HockeySkateSize['brand']
): HockeySkateSize['width'] {
  if (!footWidth) {
    return 'D'; // Default to standard
  }

  // Width ratio (foot width / foot length)
  const ratio = footWidth / footLength;

  // Thresholds derived from Bauer/CCM fit guide width categories:
  //   C (narrow):   ratio < 0.36  (~97 mm last on a 27 cm foot)
  //   D (standard): ratio 0.36–0.40 (~100 mm last)
  //   EE/W (wide):  ratio > 0.40  (~102+ mm last)
  if (ratio < 0.36) {
    return 'C';
  } else if (ratio < 0.40) {
    return 'D';
  } else {
    return brand === 'ccm' ? 'W' : 'EE';
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format a size range for display
 */
export function formatSizeRange(min: number, max: number, unit = 'cm'): string {
  if (min === max) {
    return `${min} ${unit}`;
  }
  return `${min}-${max} ${unit}`;
}

// ============================================
// HELMET SIZING
// ============================================

export type HelmetSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface HelmetSizing {
  size: HelmetSize;
  rangeMin: number; // cm
  rangeMax: number; // cm
}

/**
 * Calculate helmet sizing based on head circumference
 *
 * Size ranges:
 * - XS: 51-54cm
 * - S: 55-56cm
 * - M: 57-58cm
 * - L: 59-60cm
 * - XL: 61-62cm
 * - XXL: 63+cm
 */
export function calculateHelmetSizing(headCircumference: number): HelmetSizing {
  if (headCircumference < 55) {
    return { size: 'XS', rangeMin: 51, rangeMax: 54 };
  } else if (headCircumference < 57) {
    return { size: 'S', rangeMin: 55, rangeMax: 56 };
  } else if (headCircumference < 59) {
    return { size: 'M', rangeMin: 57, rangeMax: 58 };
  } else if (headCircumference < 61) {
    return { size: 'L', rangeMin: 59, rangeMax: 60 };
  } else if (headCircumference < 63) {
    return { size: 'XL', rangeMin: 61, rangeMax: 62 };
  } else {
    return { size: 'XXL', rangeMin: 63, rangeMax: 65 };
  }
}
