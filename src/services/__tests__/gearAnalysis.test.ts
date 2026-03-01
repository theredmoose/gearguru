import { describe, it, expect } from 'vitest';
import {
  analyzeGearPhotos,
  parseSkiSize,
  parseProfile,
  parseRadius,
  formatProfile,
  formatSkiDetails,
} from '../gearAnalysis';
import type { GearPhoto, AlpineSkiDetails } from '../../types';

describe('gearAnalysis', () => {
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  describe('parseSkiSize', () => {
    it('extracts number from size string with cm suffix', () => {
      expect(parseSkiSize('170cm')).toBe(170);
    });

    it('extracts number from plain numeric string', () => {
      expect(parseSkiSize('186')).toBe(186);
    });

    it('extracts number from string with spaces', () => {
      expect(parseSkiSize('175 cm')).toBe(175);
    });

    it('returns null for invalid string', () => {
      expect(parseSkiSize('abc')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseSkiSize('')).toBeNull();
    });
  });

  describe('parseProfile', () => {
    it('parses profile with forward slashes', () => {
      expect(parseProfile('121/68/103')).toEqual({
        tip: 121,
        waist: 68,
        tail: 103,
      });
    });

    it('parses profile with dashes', () => {
      expect(parseProfile('121-68-103')).toEqual({
        tip: 121,
        waist: 68,
        tail: 103,
      });
    });

    it('parses profile with spaces around separators', () => {
      expect(parseProfile('121 / 68 / 103')).toEqual({
        tip: 121,
        waist: 68,
        tail: 103,
      });
    });

    it('returns null for invalid format', () => {
      expect(parseProfile('121-68')).toBeNull();
    });

    it('returns null for non-numeric values', () => {
      expect(parseProfile('abc/def/ghi')).toBeNull();
    });
  });

  describe('parseRadius', () => {
    it('parses radius with R prefix', () => {
      expect(parseRadius('R15.5')).toBe(15.5);
    });

    it('parses radius with lowercase r prefix', () => {
      expect(parseRadius('r15.5')).toBe(15.5);
    });

    it('parses radius with m suffix', () => {
      expect(parseRadius('15.5m')).toBe(15.5);
    });

    it('parses plain numeric radius', () => {
      expect(parseRadius('15.5')).toBe(15.5);
    });

    it('parses integer radius', () => {
      expect(parseRadius('16')).toBe(16);
    });

    it('returns null for invalid string', () => {
      expect(parseRadius('abc')).toBeNull();
    });
  });

  describe('formatProfile', () => {
    it('formats profile as tip/waist/tail', () => {
      expect(formatProfile({ tip: 121, waist: 68, tail: 103 })).toBe('121/68/103');
    });
  });

  describe('formatSkiDetails', () => {
    it('formats complete ski details', () => {
      const details: AlpineSkiDetails = {
        lengthCm: 170,
        profile: { tip: 121, waist: 68, tail: 103 },
        radiusM: 15.5,
      };
      expect(formatSkiDetails(details)).toBe('170cm | 121/68/103 | R15.5m');
    });

    it('formats details without profile', () => {
      const details: AlpineSkiDetails = {
        lengthCm: 170,
        radiusM: 15.5,
      };
      expect(formatSkiDetails(details)).toBe('170cm | R15.5m');
    });

    it('formats details without radius', () => {
      const details: AlpineSkiDetails = {
        lengthCm: 170,
        profile: { tip: 121, waist: 68, tail: 103 },
      };
      expect(formatSkiDetails(details)).toBe('170cm | 121/68/103');
    });

    it('formats details with only length', () => {
      const details: AlpineSkiDetails = {
        lengthCm: 170,
      };
      expect(formatSkiDetails(details)).toBe('170cm');
    });
  });

  // ============================================
  // ANALYZE GEAR PHOTOS
  // ============================================
  describe('analyzeGearPhotos', () => {
    const mockPhoto: GearPhoto = {
      id: 'photo-1',
      type: 'labelView',
      url: 'data:image/jpeg;base64,test',
      createdAt: new Date().toISOString(),
    };

    it('returns a result with confidence score', async () => {
      const result = await analyzeGearPhotos([mockPhoto], { sport: 'alpine', type: 'ski' });
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('returns alpine ski details for alpine ski hints', async () => {
      const result = await analyzeGearPhotos([mockPhoto], { sport: 'alpine', type: 'ski' });
      expect(result.brand).toBeDefined();
      expect(result.model).toBeDefined();
      expect(result.size).toBeDefined();
      expect(result.extendedDetails?.type).toBe('alpineSki');
    });

    it('includes profile for alpine skis', async () => {
      const result = await analyzeGearPhotos([mockPhoto], { sport: 'alpine', type: 'ski' });
      if (result.extendedDetails?.type === 'alpineSki') {
        expect(result.extendedDetails.details.profile).toBeDefined();
        expect(result.extendedDetails.details.profile?.tip).toBeGreaterThan(0);
        expect(result.extendedDetails.details.profile?.waist).toBeGreaterThan(0);
        expect(result.extendedDetails.details.profile?.tail).toBeGreaterThan(0);
      }
    });

    it('includes radius for alpine skis', async () => {
      const result = await analyzeGearPhotos([mockPhoto], { sport: 'alpine', type: 'ski' });
      if (result.extendedDetails?.type === 'alpineSki') {
        expect(result.extendedDetails.details.radiusM).toBeGreaterThan(0);
      }
    });

    it('includes bindings for alpine skis', async () => {
      const result = await analyzeGearPhotos([mockPhoto], { sport: 'alpine', type: 'ski' });
      if (result.extendedDetails?.type === 'alpineSki') {
        expect(result.extendedDetails.details.bindings).toBeDefined();
        expect(result.extendedDetails.details.bindings?.brand).toBeDefined();
      }
    });

    it('returns nordic ski details for nordic hints', async () => {
      const result = await analyzeGearPhotos([mockPhoto], { sport: 'nordic-skate', type: 'ski' });
      expect(result.extendedDetails?.type).toBe('nordicSki');
    });

    it('returns snowboard details for snowboard hints', async () => {
      const result = await analyzeGearPhotos([mockPhoto], { sport: 'snowboard', type: 'snowboard' });
      expect(result.extendedDetails?.type).toBe('snowboard');
    });

    it('returns boot details for boot type', async () => {
      const result = await analyzeGearPhotos([mockPhoto], { sport: 'alpine', type: 'boot' });
      expect(result.extendedDetails?.type).toBe('boot');
    });

    it('returns skate details for hockey skates', async () => {
      const result = await analyzeGearPhotos([mockPhoto], { sport: 'hockey', type: 'skate' });
      expect(result.extendedDetails?.type).toBe('skate');
    });

    it('returns lower confidence when no photos provided', async () => {
      const result = await analyzeGearPhotos([]);
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.notes).toContain('No photos provided - results may be inaccurate');
    });

    it('returns generic result when no hints provided', async () => {
      const result = await analyzeGearPhotos([mockPhoto]);
      expect(result.confidence).toBeLessThanOrEqual(0.5);
    });

    it('returns nordic-classic ski details with skin grip', async () => {
      const result = await analyzeGearPhotos([mockPhoto], {
        sport: 'nordic-classic',
        type: 'ski',
      });
      expect(result.extendedDetails?.type).toBe('nordicSki');
      if (result.extendedDetails?.type === 'nordicSki') {
        expect(result.extendedDetails.details.style).toBe('classic');
        expect(result.extendedDetails.details.grip).toBe('skin');
      }
    });

    it('returns lower confidence when photos have no recognisable content', async () => {
      // No labelView or fullView photo — only "other" type
      const otherPhoto: GearPhoto = {
        id: 'photo-other',
        type: 'other',
        url: 'data:image/jpeg;base64,test',
        createdAt: new Date().toISOString(),
      };
      const result = await analyzeGearPhotos([otherPhoto]);
      // With no label/full view and no hints → Unknown branch → confidence ≤ 0.5
      expect(result.confidence).toBeLessThanOrEqual(0.5);
    });
  });

  // ============================================
  // ANALYZE WITH CLAUDE (API key path)
  // ============================================
  describe('analyzeGearPhotos (with CLAUDE_API_KEY)', () => {
    beforeEach(async () => {
      vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'sk-test-key');
      vi.resetModules();
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.resetModules();
      vi.restoreAllMocks();
    });

    it('calls the Anthropic API when key is present', async () => {
      const mockResult = { brand: 'Atomic', model: 'Test', confidence: 0.9 };
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: JSON.stringify(mockResult) }],
          }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const { analyzeGearPhotos: analyzeWithKey } = await import('../gearAnalysis');
      const photo: GearPhoto = {
        id: 'p1',
        type: 'labelView',
        url: 'data:image/jpeg;base64,abc123',
        createdAt: '',
      };
      const result = await analyzeWithKey([photo], { sport: 'alpine', type: 'ski' });

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(result.brand).toBe('Atomic');
    });

    it('fills in sport/type hints when Claude omits them', async () => {
      const mockResult = { confidence: 0.8 }; // no sport or type
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: JSON.stringify(mockResult) }],
          }),
      }));

      const { analyzeGearPhotos: analyzeWithKey } = await import('../gearAnalysis');
      const photo: GearPhoto = {
        id: 'p2',
        type: 'labelView',
        url: 'data:image/jpeg;base64,abc123',
        createdAt: '',
      };
      const result = await analyzeWithKey([photo], { sport: 'snowboard', type: 'snowboard' });

      expect(result.sport).toBe('snowboard');
      expect(result.type).toBe('snowboard');
    });

    it('falls back to mock when the API call fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }));

      const { analyzeGearPhotos: analyzeWithKey } = await import('../gearAnalysis');
      const photo: GearPhoto = {
        id: 'p3',
        type: 'labelView',
        url: 'data:image/jpeg;base64,abc123',
        createdAt: '',
      };
      const result = await analyzeWithKey([photo], { sport: 'alpine', type: 'ski' });

      expect(result.notes).toContain('AI analysis unavailable — showing demo data');
      expect(result.brand).toBeDefined(); // mock result populated
    });

    it('returns low confidence when no base64 photos are provided (API key set)', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const { analyzeGearPhotos: analyzeWithKey } = await import('../gearAnalysis');
      const photo: GearPhoto = {
        id: 'p4',
        type: 'labelView',
        url: 'https://example.com/photo.jpg', // not a data: URL → filtered out
        createdAt: '',
      };
      const result = await analyzeWithKey([photo]);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.confidence).toBe(0.1);
    });
  });
});
