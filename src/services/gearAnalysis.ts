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
// CLAUDE VISION ANALYSIS
// ============================================

const CLAUDE_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

const ANALYSIS_PROMPT = `You are analyzing photos of sports equipment (skis, snowboards, boots, hockey skates, poles, etc.).
Carefully examine every image for text, labels, brand logos, model names, size markings, and condition.

Return ONLY a valid JSON object — no markdown, no explanation — with these fields:
{
  "brand": string or null,
  "model": string or null,
  "size": string or null (e.g. "170cm", "27.5", "8.5D", "EU 42"),
  "year": number or null,
  "condition": "new" | "good" | "fair" | "worn" | null,
  "sport": "alpine" | "nordic-classic" | "nordic-skate" | "snowboard" | "hockey" | null,
  "type": "ski" | "pole" | "boot" | "binding" | "snowboard" | "skate" | "helmet" | "other" | null,
  "rawText": string (all text visible across all images, combined),
  "notes": string[],
  "confidence": number between 0 and 1,
  "extendedDetails": one of the following shapes, or null:
    {"type":"alpineSki","details":{"lengthCm":number,"profile":{"tip":number,"waist":number,"tail":number} or null,"radiusM":number or null,"bindings":{"brand":string,"model":string,"dinRange":string} or null,"rocker":string or null}}
    {"type":"nordicSki","details":{"lengthCm":number,"style":"classic"|"skate"|"combi","stiffness":"soft"|"medium"|"stiff" or null,"grip":"waxable"|"skin"|"zero" or null}}
    {"type":"snowboard","details":{"lengthCm":number,"profile":{"tip":number,"waist":number,"tail":number} or null,"flex":number or null,"shape":"directional"|"twin"|"directional-twin" or null}}
    {"type":"boot","details":{"mondopoint":number or null,"flex":number or null,"lastWidth":number or null}}
    {"type":"skate","details":{"sizeUS":number or null,"width":"C"|"D"|"EE"|"W"|"R" or null,"holder":string or null,"steel":string or null}}
}

Guidelines:
- Set confidence based on how much you can actually read. Label photos with clear text = 0.8-0.95. Blurry/no labels = 0.2-0.4.
- For condition: "new" = no wear marks, "good" = light use, "fair" = visible wear, "worn" = heavy use.
- If a field cannot be determined from the images, set it to null.`;

async function analyzeWithClaude(photos: GearPhoto[]): Promise<GearAnalysisResult> {
  // Build image content blocks from base64 data URLs
  const imageBlocks = photos
    .filter((p) => p.url.startsWith('data:'))
    .map((p) => {
      const [header, base64] = p.url.split(',');
      const mediaType = (header.match(/data:(image\/[^;]+)/) ?? [])[1] as
        | 'image/jpeg'
        | 'image/png'
        | 'image/gif'
        | 'image/webp';
      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: mediaType ?? 'image/jpeg',
          data: base64,
        },
      };
    });

  if (imageBlocks.length === 0) {
    return { confidence: 0.1, notes: ['No processable images found'] };
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY!,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            { type: 'text', text: ANALYSIS_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };
  const text = data.content.find((c) => c.type === 'text')?.text ?? '';

  // Strip any accidental markdown code fences
  const cleaned = text.replace(/^```[a-z]*\n?/m, '').replace(/\n?```$/m, '').trim();
  const parsed = JSON.parse(cleaned) as GearAnalysisResult;
  return parsed;
}

// ============================================
// MOCK ANALYSIS (fallback when no API key)
// ============================================

function mockAnalysis(
  photos: GearPhoto[],
  hints?: { sport?: Sport; type?: GearType }
): GearAnalysisResult {
  const labelPhoto = photos.find((p) => p.type === 'labelView');
  const fullViewPhoto = photos.find((p) => p.type === 'fullView');
  const sport = hints?.sport;
  const type = hints?.type;

  const result: GearAnalysisResult = { confidence: 0.85, notes: [] };

  if (!labelPhoto && !fullViewPhoto) {
    result.confidence = 0.3;
    result.notes?.push('No photos provided - results may be inaccurate');
  }

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
        bindings: { brand: 'Atomic', model: 'X12 GW', dinRange: '4-12' },
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
      details: { mondopoint: 275, flex: 120, lastWidth: 100 } as BootDetails,
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
    if (result.confidence > 0.5) result.confidence = 0.5;
    result.notes?.push('Unable to determine specific gear details');
  }

  return result;
}

// ============================================
// PUBLIC API
// ============================================

export async function analyzeGearPhotos(
  photos: GearPhoto[],
  hints?: { sport?: Sport; type?: GearType }
): Promise<GearAnalysisResult> {
  if (CLAUDE_API_KEY) {
    try {
      const result = await analyzeWithClaude(photos);
      // Fill in hints if Claude didn't detect them
      if (!result.sport && hints?.sport) result.sport = hints.sport;
      if (!result.type && hints?.type) result.type = hints.type;
      return result;
    } catch (err) {
      console.error('[GearGuru] Claude photo analysis failed, falling back to mock', err);
      const fallback = mockAnalysis(photos, hints);
      fallback.notes = [
        ...(fallback.notes ?? []),
        'AI analysis unavailable — showing demo data',
      ];
      return fallback;
    }
  }

  // No API key: use mock (development / demo mode)
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return mockAnalysis(photos, hints);
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
