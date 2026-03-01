// ============================================
// CORE TYPES - Family Members & Measurements
// ============================================

export interface FamilyMember {
  id: string;
  userId: string; // Firebase Auth user ID
  familyId?: string; // Scaffolding for future multi-family sharing (currently === userId)
  name: string;
  dateOfBirth: string; // ISO date string
  gender: 'male' | 'female' | 'other';
  measurements: Measurements;
  measurementHistory?: MeasurementEntry[];
  skillLevels?: Partial<Record<Sport, SkillLevel>>;
  createdAt: string;
  updatedAt: string;
}

export interface Measurements {
  // Basic body measurements (in cm unless noted)
  height: number;
  weight: number; // in kg

  // Foot measurements
  footLengthLeft: number; // in cm
  footLengthRight: number; // in cm
  footWidthLeft?: number; // in cm
  footWidthRight?: number; // in cm

  // Shoe sizes for reference
  usShoeSize?: number;
  euShoeSize?: number;

  // Optional additional measurements
  armLength?: number; // shoulder to wrist, for poles
  inseam?: number; // for stance width calculations
  headCircumference?: number; // cm, for helmet sizing
  handSize?: number; // cm, wrist to fingertip (single-foot mode; fallback)
  handSizeLeft?: number; // cm (separate L/R mode)
  handSizeRight?: number; // cm (separate L/R mode)

  // Last measured date
  measuredAt: string;
}

export interface MeasurementEntry {
  id: string;            // uuid - for targeting edits/deletes
  recordedAt: string;    // ISO date string - user-editable
  height: number;
  weight: number;
  footLengthLeft: number;
  footLengthRight: number;
  footWidthLeft?: number;
  footWidthRight?: number;
  usShoeSize?: number;
  euShoeSize?: number;
  armLength?: number;
  inseam?: number;
  headCircumference?: number;
  handSize?: number;
  handSizeLeft?: number;
  handSizeRight?: number;
}

// ============================================
// SPORT TYPES
// ============================================

export type Sport =
  | 'nordic-classic'
  | 'nordic-skate'
  | 'nordic-combi'
  | 'alpine'
  | 'snowboard'
  | 'hockey';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// ============================================
// GEAR TYPES & SIZING
// ============================================

// Sizing model — which manufacturer's chart / formula is used
export type SizingModel = 'generic' | 'fischer' | 'evosports';

export const SIZING_MODEL_LABELS: Record<SizingModel, string> = {
  generic:   'Generic',
  fischer:   'Fischer',
  evosports: 'Evosports',
};

// Alpine terrain preference — drives waist width recommendation
export type AlpineTerrain = 'groomed' | 'all-mountain' | 'powder';

export const ALPINE_TERRAIN_LABELS: Record<AlpineTerrain, string> = {
  'groomed':      'Groomed',
  'all-mountain': 'All-Mountain',
  'powder':       'Powder',
};

// Nordic Skiing
export interface NordicSkiSizing {
  sport: 'nordic-classic' | 'nordic-skate' | 'nordic-combi';
  skiLengthMin: number; // cm
  skiLengthMax: number; // cm
  skiLengthRecommended: number; // cm
  poleLengthMin: number; // cm
  poleLengthMax: number; // cm
  poleLengthRecommended: number; // cm
  // Model-specific extras (Fischer only)
  faValueRange?: { min: number; max: number }; // recommended ski stiffness in kg
  modelName?: string;
  modelNotes?: string[];
}

export interface NordicBootSizing {
  mondopoint: number; // mm (foot length cm × 10)
  euSize: number;
  usSize: number;
}

// Alpine Skiing
export interface AlpineSkiSizing {
  skiLengthMin: number; // cm
  skiLengthMax: number; // cm
  skiLengthRecommended: number; // cm
  din: { min: number; max: number }; // binding release setting
}

export interface AlpineBootSizing {
  mondopoint: number; // mm
  shellSize: number; // actual shell size (often differs from mondo)
  euSize: number;
  usSize: number;
  lastWidth: 'narrow' | 'medium' | 'wide' | 'extra-wide';
  lastWidthMm: number; // actual width in mm
  flexRating: { min: number; max: number }; // based on skill/weight
}

// Snowboarding
export interface SnowboardSizing {
  boardLengthMin: number; // cm
  boardLengthMax: number; // cm
  boardLengthRecommended: number; // cm
  waistWidthMin: number; // mm - based on boot size
  stanceWidth: { min: number; max: number }; // cm
}

export interface SnowboardBootSizing {
  usSize: number;
  euSize: number;
  mondopoint: number;
}

// Hockey
export interface HockeySkateSize {
  skateSizeUS: number;
  skateSizeEU: number;
  width: 'C' | 'D' | 'EE' | 'R' | 'W'; // C=narrow, D=standard, EE=wide
  brand: 'bauer' | 'ccm' | 'true' | 'other';
}

// ============================================
// GEAR PHOTOS
// ============================================

export type GearPhotoType = 'fullView' | 'labelView' | 'other';

export interface GearPhoto {
  id: string;
  type: GearPhotoType;
  url: string; // URL or base64 data URL
  caption?: string;
  createdAt: string;
}

// ============================================
// EXTENDED GEAR DETAILS
// ============================================

// Profile dimensions (tip/waist/tail in mm)
export interface SkiProfile {
  tip: number;
  waist: number;
  tail: number;
}

// Alpine ski specific details
export interface AlpineSkiDetails {
  lengthCm: number;
  profile?: SkiProfile;
  radiusM?: number; // Turn radius in meters (R value)
  bindings?: {
    brand: string;
    model: string;
    dinRange?: string;   // binding capacity, e.g. "4-13"
    dinSetting?: number; // actual release setting, e.g. 5.5
  };
  rocker?: string; // e.g., "tip rocker", "full rocker", "camber"
}

// Nordic ski specific details
export interface NordicSkiDetails {
  lengthCm: number;
  style?: 'classic' | 'skate' | 'combi';
  stiffness?: string; // e.g., "soft", "medium", "stiff" or FA value
  grip?: string; // e.g., "waxable", "skin", "zero"
}

// Snowboard specific details
export interface SnowboardDetails {
  lengthCm: number;
  profile?: SkiProfile;
  flex?: number; // 1-10 scale
  shape?: 'directional' | 'twin' | 'directional-twin';
  bindings?: {
    brand: string;
    model: string;
    size: string;
  };
}

// Boot specific details
export interface BootDetails {
  mondopoint?: number;
  flex?: number;
  lastWidth?: number; // mm
}

// Hockey skate specific details
export interface SkateDetails {
  sizeUS?: number;
  width?: 'C' | 'D' | 'EE' | 'R' | 'W';
  holder?: string; // blade holder model
  steel?: string; // blade steel type
}

// Union type for extended details
export type ExtendedGearDetails =
  | { type: 'alpineSki'; details: AlpineSkiDetails }
  | { type: 'nordicSki'; details: NordicSkiDetails }
  | { type: 'snowboard'; details: SnowboardDetails }
  | { type: 'boot'; details: BootDetails }
  | { type: 'skate'; details: SkateDetails };

// ============================================
// GEAR INVENTORY
// ============================================

export type GearStatus = 'active' | 'available' | 'outgrown' | 'to-sell' | 'sold' | 'needs-repair';

export interface GearItem {
  id: string;
  userId: string; // Firebase Auth user ID
  familyId?: string; // Scaffolding for future multi-family sharing (currently === userId)
  ownerId: string; // FamilyMember id
  sports: Sport[];  // required, min 1
  type: GearType;
  brand: string;
  model: string;
  size: string; // varies by gear type
  year?: number;
  condition: 'new' | 'good' | 'fair' | 'worn';
  status?: GearStatus;
  location?: string;
  checkedOutTo?: string;
  checkedOutDate?: string;
  notes?: string;
  photos?: GearPhoto[];
  extendedDetails?: ExtendedGearDetails;
  createdAt: string;
  updatedAt: string;
}

export type GearType =
  | 'ski'
  | 'pole'
  | 'boot'
  | 'binding'
  | 'snowboard'
  | 'skate'
  | 'helmet'
  | 'other';

// ============================================
// SIZING RECOMMENDATIONS
// ============================================

export interface SizingRecommendation {
  memberId: string;
  sport: Sport;
  skillLevel: SkillLevel;
  generatedAt: string;

  // Sport-specific sizing (only one will be populated)
  nordicSki?: NordicSkiSizing;
  nordicBoot?: NordicBootSizing;
  alpineSki?: AlpineSkiSizing;
  alpineBoot?: AlpineBootSizing;
  snowboard?: SnowboardSizing;
  snowboardBoot?: SnowboardBootSizing;
  hockeySkate?: HockeySkateSize;
}

// ============================================
// FIREBASE COLLECTION TYPES
// ============================================

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// For Firestore, we'll convert dates to timestamps
export type FirestoreFamilyMember = Omit<
  FamilyMember,
  'createdAt' | 'updatedAt'
> & {
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
};

export type FirestoreGearItem = Omit<GearItem, 'createdAt' | 'updatedAt'> & {
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
};

// ============================================
// SETTINGS TYPES
// ============================================

export type HeightUnit = 'cm' | 'ft-in';
export type WeightUnit = 'kg' | 'lbs';
export type SkiLengthUnit = 'cm' | 'in';
export type SizingDisplay = 'range' | 'single';
export type BootUnit = 'mp' | 'eu' | 'us-men' | 'us-women';

export interface DisplaySettings {
  showFoot: boolean;
  showHand: boolean;
  separateFeetHands: boolean;
}

export interface AppSettings {
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
  skiLengthUnit: SkiLengthUnit;
  defaultSport: Sport;
  display: DisplaySettings;
  sizingModel: SizingModel;
  sizingDisplay: SizingDisplay;
  bootUnit: BootUnit; // preferred unit shown in boot sizing cards
  defaultDIN?: number; // pre-fills the DIN setting field when adding alpine skis
  notificationsEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  heightUnit: 'cm',
  weightUnit: 'kg',
  skiLengthUnit: 'cm',
  defaultSport: 'alpine',
  display: {
    showFoot: true,
    showHand: true,
    separateFeetHands: false,
  },
  sizingModel: 'generic',
  sizingDisplay: 'range',
  bootUnit: 'mp',
  notificationsEnabled: true,
};

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'replace' | 'service' | 'old-gear';

export interface AppNotification {
  id: string;           // deterministic: e.g. "worn-{gearItemId}", "old-{gearItemId}"
  type: NotificationType;
  title: string;
  body: string;
  gearItemId?: string;
  memberId?: string;
  createdAt: string;    // ISO date string
}
