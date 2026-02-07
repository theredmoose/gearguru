import { describe, it, expect } from 'vitest';
import {
  docToFamilyMember,
  docToGearItem,
  fromFirestoreTimestamp,
} from '../firebase';
import type { FirestoreTimestamp } from '../../types';

// Helper to create mock Firestore timestamps
const createTimestamp = (date: Date): FirestoreTimestamp => ({
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: 0,
});

describe('firebase service', () => {
  // ============================================
  // TIMESTAMP CONVERSION
  // ============================================
  describe('fromFirestoreTimestamp', () => {
    it('converts Firestore timestamp to ISO string', () => {
      const timestamp = createTimestamp(new Date('2024-01-15T10:30:00.000Z'));
      const result = fromFirestoreTimestamp(timestamp);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });

    it('handles epoch timestamp', () => {
      const timestamp = { seconds: 0, nanoseconds: 0 };
      const result = fromFirestoreTimestamp(timestamp);
      expect(result).toBe('1970-01-01T00:00:00.000Z');
    });
  });

  // ============================================
  // FAMILY MEMBER CONVERTER
  // ============================================
  describe('docToFamilyMember', () => {
    const mockTimestamp = createTimestamp(new Date('2024-01-15T10:00:00.000Z'));
    const baseMockData = {
      userId: 'user-123',
      name: 'John Doe',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      measurements: {
        height: 180,
        weight: 80,
        footLengthLeft: 27,
        footLengthRight: 27.5,
        measuredAt: '2024-01-15T10:00:00.000Z',
      },
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
    };

    it('maps all required fields correctly', () => {
      const result = docToFamilyMember('member-1', baseMockData);

      expect(result.id).toBe('member-1');
      expect(result.userId).toBe('user-123');
      expect(result.name).toBe('John Doe');
      expect(result.dateOfBirth).toBe('1990-05-15');
      expect(result.gender).toBe('male');
      expect(result.measurements).toEqual(baseMockData.measurements);
    });

    it('converts timestamps to ISO strings', () => {
      const result = docToFamilyMember('member-1', baseMockData);

      expect(result.createdAt).toBe('2024-01-15T10:00:00.000Z');
      expect(result.updatedAt).toBe('2024-01-15T10:00:00.000Z');
    });

    it('includes skillLevels when present', () => {
      const dataWithSkills = {
        ...baseMockData,
        skillLevels: {
          alpine: 'intermediate',
          'nordic-classic': 'beginner',
        },
      };
      const result = docToFamilyMember('member-1', dataWithSkills);

      expect(result.skillLevels).toEqual({
        alpine: 'intermediate',
        'nordic-classic': 'beginner',
      });
    });

    it('handles missing optional skillLevels field', () => {
      const result = docToFamilyMember('member-1', baseMockData);

      expect(result.skillLevels).toBeUndefined();
    });
  });

  // ============================================
  // GEAR ITEM CONVERTER
  // ============================================
  describe('docToGearItem', () => {
    const mockTimestamp = createTimestamp(new Date('2024-01-20T14:00:00.000Z'));
    const baseMockData = {
      userId: 'user-123',
      ownerId: 'member-1',
      sport: 'alpine',
      type: 'ski',
      brand: 'Rossignol',
      model: 'Experience 88',
      size: '172',
      condition: 'good',
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
    };

    it('maps all required fields correctly', () => {
      const result = docToGearItem('gear-1', baseMockData);

      expect(result.id).toBe('gear-1');
      expect(result.userId).toBe('user-123');
      expect(result.ownerId).toBe('member-1');
      expect(result.sport).toBe('alpine');
      expect(result.type).toBe('ski');
      expect(result.brand).toBe('Rossignol');
      expect(result.model).toBe('Experience 88');
      expect(result.size).toBe('172');
      expect(result.condition).toBe('good');
    });

    it('converts timestamps to ISO strings', () => {
      const result = docToGearItem('gear-1', baseMockData);

      expect(result.createdAt).toBe('2024-01-20T14:00:00.000Z');
      expect(result.updatedAt).toBe('2024-01-20T14:00:00.000Z');
    });

    it('includes optional year field when present', () => {
      const dataWithYear = { ...baseMockData, year: 2023 };
      const result = docToGearItem('gear-1', dataWithYear);

      expect(result.year).toBe(2023);
    });

    it('includes optional notes field when present', () => {
      const dataWithNotes = { ...baseMockData, notes: 'Great all-mountain ski' };
      const result = docToGearItem('gear-1', dataWithNotes);

      expect(result.notes).toBe('Great all-mountain ski');
    });

    it('includes photos array when present', () => {
      const dataWithPhotos = {
        ...baseMockData,
        photos: [
          { id: 'photo-1', type: 'fullView', url: 'https://example.com/photo.jpg', createdAt: '2024-01-20T14:00:00.000Z' },
          { id: 'photo-2', type: 'labelView', url: 'https://example.com/label.jpg', createdAt: '2024-01-20T14:00:00.000Z' },
        ],
      };
      const result = docToGearItem('gear-1', dataWithPhotos);

      expect(result.photos).toHaveLength(2);
      expect(result.photos?.[0].type).toBe('fullView');
      expect(result.photos?.[1].type).toBe('labelView');
    });

    it('includes extendedDetails when present', () => {
      const dataWithDetails = {
        ...baseMockData,
        extendedDetails: {
          type: 'alpineSki',
          details: {
            lengthCm: 172,
            profile: { tip: 130, waist: 88, tail: 112 },
            radiusM: 16,
            bindings: { brand: 'Look', model: 'SPX 12', dinRange: '4-12' },
          },
        },
      };
      const result = docToGearItem('gear-1', dataWithDetails);

      expect(result.extendedDetails).toBeDefined();
      expect(result.extendedDetails?.type).toBe('alpineSki');
      expect((result.extendedDetails as any)?.details?.radiusM).toBe(16);
    });

    it('handles missing optional fields gracefully', () => {
      const result = docToGearItem('gear-1', baseMockData);

      expect(result.year).toBeUndefined();
      expect(result.notes).toBeUndefined();
      expect(result.photos).toBeUndefined();
      expect(result.extendedDetails).toBeUndefined();
    });

    it('maps all gear conditions correctly', () => {
      const conditions = ['new', 'good', 'fair', 'worn'] as const;

      conditions.forEach((condition) => {
        const data = { ...baseMockData, condition };
        const result = docToGearItem('gear-1', data);
        expect(result.condition).toBe(condition);
      });
    });
  });
});
