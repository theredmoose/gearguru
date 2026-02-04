import type {
  GearPhoto,
  GearType,
  Sport,
  AlpineSkiDetails,
  NordicSkiDetails,
  SnowboardDetails,
  BootDetails,
  SkateDetails,
  ExtendedGearDetails,
} from '../types';

// ============================================
// GEAR ANALYSIS RESULT TYPE
// ============================================

export interface GearAnalysisResult {
  // Basic info
  brand?: string;
  model?: string;
  size?: string;
  year?: number;
  condition?: 'new' | 'good' | 'fair' | 'worn';
  sport?: Sport;
  type?: GearType;

  // Extended details
  extendedDetails?: ExtendedGearDetails;

  // Confidence level (0-1)
  confidence: number;

  // Raw extracted text for reference
  rawText?: string;

  // Any notes or warnings
  notes?: string[];
}

// ============================================
// MOCK ANALYSIS (for development/demo)
// ============================================

export async function analyzeGearPhotos(
  photos: GearPhoto[],
  hints?: { sport?: Sport; type?: GearType }
): Promise<GearAnalysisResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const labelPhoto = photos.find((p) => p.type === 'labelView');
  const fullViewPhoto = photos.find((p) => p.type === 'fullView');

  const sport = hints?.sport;
  const type = hints?.type;

  const result: GearAnalysisResult = {
    confidence: 0.85,
    notes: [],
  };

  if (!labelPhoto && !fullViewPhoto) {
    result.confidence = 0.3;
    result.notes?.push('No photos provided - results may be inaccurate');
  }

  // Simulate different results based on gear type
  if (type === 'ski' && sport === 'alpine') {
    result.brand = 'Atomic';
    result.model = 'Redster X9';
    result.size = '170cm';
    result.year = 2023;
    result.condition = 'good';
    result.extendedDetails = {
      type: 'alpineSki',
      details: {
        lengthCm: 170,
        profile: { tip: 121, waist: 68, tail: 103 },
        radiusM: 15.5,
        bindings: {
          brand: 'Atomic',
          model: 'X12 GW',
          dinRange: '4-12',
        },
        rocker: 'tip rocker',
      } as AlpineSkiDetails,
    };
    result.notes?.push('Detected alpine ski with integrated bindings');
  } else if (type === 'ski' && (sport === 'nordic-classic' || sport === 'nordic-skate')) {
    result.brand = 'Fischer';
    result.model = 'RCS Skate';
    result.size = '186cm';
    result.year = 2022;
    result.condition = 'good';
    result.extendedDetails = {
      type: 'nordicSki',
      details: {
        lengthCm: 186,
        style: sport === 'nordic-skate' ? 'skate' : 'classic',
        stiffness: 'medium',
        grip: sport === 'nordic-classic' ? 'skin' : undefined,
      } as NordicSkiDetails,
    };
  } else if (type === 'snowboard') {
    result.brand = 'Burton';
    result.model = 'Custom';
    result.size = '156cm';
    result.year = 2023;
    result.condition = 'new';
    result.extendedDetails = {
      type: 'snowboard',
      details: {
        lengthCm: 156,
        profile: { tip: 295, waist: 252, tail: 290 },
        flex: 6,
        shape: 'directional-twin',
      } as SnowboardDetails,
    };
  } else if (type === 'boot') {
    result.brand = 'Tecnica';
    result.model = 'Mach1 MV 120';
    result.size = '27.5';
    result.year = 2023;
    result.condition = 'good';
    result.extendedDetails = {
      type: 'boot',
      details: {
        mondopoint: 275,
        flex: 120,
        lastWidth: 100,
      } as BootDetails,
    };
  } else if (type === 'skate') {
    result.brand = 'Bauer';
    result.model = 'Supreme 3S Pro';
    result.size = '8D';
    result.year = 2022;
    result.condition = 'good';
    result.extendedDetails = {
      type: 'skate',
      details: {
        sizeUS: 8,
        width: 'D',
        holder: 'Tuuk LS Pulse TI',
        steel: 'LS5',
      } as SkateDetails,
    };
  } else {
    result.brand = 'Unknown';
    result.model = 'Unknown';
    // Only set to 0.5 if not already lowered due to missing photos
    if (result.confidence > 0.5) {
      result.confidence = 0.5;
    }
    result.notes?.push('Unable to determine specific gear details');
  }

  return result;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function parseSkiSize(sizeString: string): number | null {
  const match = sizeString.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function parseProfile(profileString: string): { tip: number; waist: number; tail: number } | null {
  const match = profileString.match(/(\d+)[\/\-\s]+(\d+)[\/\-\s]+(\d+)/);
  if (match) {
    return {
      tip: parseInt(match[1], 10),
      waist: parseInt(match[2], 10),
      tail: parseInt(match[3], 10),
    };
  }
  return null;
}

export function parseRadius(radiusString: string): number | null {
  const match = radiusString.match(/R?(\d+(?:\.\d+)?)/i);
  return match ? parseFloat(match[1]) : null;
}

export function formatProfile(profile: { tip: number; waist: number; tail: number }): string {
  return `${profile.tip}/${profile.waist}/${profile.tail}`;
}

export function formatSkiDetails(details: AlpineSkiDetails): string {
  const parts: string[] = [];

  if (details.lengthCm) parts.push(`${details.lengthCm}cm`);
  if (details.profile) parts.push(formatProfile(details.profile));
  if (details.radiusM) parts.push(`R${details.radiusM}m`);

  return parts.join(' | ');
}
