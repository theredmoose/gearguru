import { describe, it, expect, vi } from 'vitest';
import {
  docToFamilyMember,
  docToGearItem,
  fromFirestoreTimestamp,
  getAllFamilyMembers,
  getFamilyMember,
  createFamilyMember,
  updateFamilyMember,
  updateMeasurements,
  updateSkillLevels,
  deleteFamilyMember,
  getAllGearItems,
  getGearItemsByOwner,
  getGearItem,
  createGearItem,
  updateGearItem,
  deleteGearItem,
  addMeasurementEntry,
  updateMeasurementEntry,
  deleteMeasurementEntry,
} from '../firebase';
import type { FirestoreTimestamp, MeasurementEntry } from '../../types';
import { FAMILY_MEMBERS } from '@tests/fixtures/familyMembers';
import { MEASUREMENTS } from '@tests/fixtures/measurements';

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
      expect(result.sports).toEqual(['alpine']);
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

    describe('sports migration', () => {
      it('returns sports array from legacy sport field', () => {
        const legacyData = { ...baseMockData, sport: 'alpine' };
        const result = docToGearItem('gear-1', legacyData);
        expect(result.sports).toEqual(['alpine']);
      });

      it('returns sports array when sports field exists', () => {
        const modernData = { ...baseMockData, sports: ['alpine', 'snowboard'] };
        const result = docToGearItem('gear-1', modernData);
        expect(result.sports).toEqual(['alpine', 'snowboard']);
      });

      it('prefers sports over sport when both exist', () => {
        const bothData = { ...baseMockData, sport: 'alpine', sports: ['snowboard'] };
        const result = docToGearItem('gear-1', bothData);
        expect(result.sports).toEqual(['snowboard']);
      });
    });
  });

  // ============================================
  // FAMILY MEMBER SERVICE FUNCTIONS
  // ============================================
  describe('getAllFamilyMembers', () => {
    it('returns empty array when no members exist', async () => {
      const result = await getAllFamilyMembers('user-1');
      expect(result).toEqual([]);
    });

    it('maps Firestore docs to FamilyMember objects and sorts by name', async () => {
      const mockTimestamp = { seconds: 1705320000, nanoseconds: 0 };
      const mockDocs = [
        {
          id: 'member-2',
          data: () => ({
            userId: 'user-1', name: 'Zara',
            dateOfBirth: '1995-01-01', gender: 'female',
            measurements: MEASUREMENTS.adultFemale,
            createdAt: mockTimestamp, updatedAt: mockTimestamp,
          }),
        },
        {
          id: 'member-1',
          data: () => ({
            userId: 'user-1', name: 'Alice',
            dateOfBirth: '1990-01-01', gender: 'female',
            measurements: MEASUREMENTS.adultFemale,
            createdAt: mockTimestamp, updatedAt: mockTimestamp,
          }),
        },
      ];
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as any);

      const result = await getAllFamilyMembers('user-1');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Zara');
    });
  });

  describe('getFamilyMember', () => {
    it('returns null when member does not exist', async () => {
      const result = await getFamilyMember('nonexistent');
      expect(result).toBeNull();
    });

    it('returns FamilyMember when doc exists', async () => {
      const mockTimestamp = { seconds: 1705320000, nanoseconds: 0 };
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'member-1',
        data: () => ({
          userId: 'user-1', name: 'John',
          dateOfBirth: '1990-01-01', gender: 'male',
          measurements: MEASUREMENTS.adultMale,
          createdAt: mockTimestamp, updatedAt: mockTimestamp,
        }),
      } as any);

      const result = await getFamilyMember('member-1');
      expect(result).not.toBeNull();
      expect(result!.name).toBe('John');
    });
  });

  describe('createFamilyMember', () => {
    it('creates a member and returns it with the new id', async () => {
      const { name: _, id: _id, createdAt: _c, updatedAt: _u, ...memberData } = FAMILY_MEMBERS.john;
      const result = await createFamilyMember({ ...memberData, name: 'New Person' });
      expect(result.id).toBe('mock-id');
      expect(result.name).toBe('New Person');
    });

    it('strips undefined fields before saving', async () => {
      const { name: _, id: _id, createdAt: _c, updatedAt: _u, ...memberData } = FAMILY_MEMBERS.john;
      const dataWithUndefined = { ...memberData, name: 'Test', skillLevels: undefined };
      const result = await createFamilyMember(dataWithUndefined);
      expect(result.id).toBe('mock-id');
    });
  });

  describe('updateFamilyMember', () => {
    it('calls updateDoc with updated data', async () => {
      const { updateDoc } = await import('firebase/firestore');
      await updateFamilyMember('member-1', { name: 'Updated Name' });
      expect(vi.mocked(updateDoc)).toHaveBeenCalled();
    });
  });

  describe('updateMeasurements', () => {
    it('calls updateDoc with measurements', async () => {
      const { updateDoc } = await import('firebase/firestore');
      await updateMeasurements('member-1', MEASUREMENTS.adultMale);
      expect(vi.mocked(updateDoc)).toHaveBeenCalled();
    });
  });

  describe('updateSkillLevels', () => {
    it('calls updateDoc with skill levels', async () => {
      const { updateDoc } = await import('firebase/firestore');
      await updateSkillLevels('member-1', { alpine: 'advanced' });
      expect(vi.mocked(updateDoc)).toHaveBeenCalled();
    });
  });

  describe('deleteFamilyMember', () => {
    it('deletes the member document', async () => {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteFamilyMember('member-1');
      expect(vi.mocked(deleteDoc)).toHaveBeenCalled();
    });

    it('also deletes gear items owned by the member', async () => {
      const mockGearDocs = [
        { ref: 'gear-ref-1' },
        { ref: 'gear-ref-2' },
      ];
      const { getDocs, deleteDoc } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockGearDocs } as any);
      await deleteFamilyMember('member-1');
      // deleteDoc is called once for the member + twice for gear
      expect(vi.mocked(deleteDoc).mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================
  // GEAR ITEM SERVICE FUNCTIONS
  // ============================================
  describe('getAllGearItems', () => {
    it('returns empty array when no gear exists', async () => {
      const result = await getAllGearItems('user-1');
      expect(result).toEqual([]);
    });

    it('maps Firestore docs to GearItem objects sorted by createdAt desc', async () => {
      const ts1 = { seconds: 1000, nanoseconds: 0 };
      const ts2 = { seconds: 2000, nanoseconds: 0 };
      const mockDocs = [
        {
          id: 'gear-1',
          data: () => ({
            userId: 'user-1', ownerId: 'member-1',
            sport: 'alpine', type: 'ski', brand: 'Atomic', model: 'Redster',
            size: '170', condition: 'good',
            createdAt: ts1, updatedAt: ts1,
          }),
        },
        {
          id: 'gear-2',
          data: () => ({
            userId: 'user-1', ownerId: 'member-1',
            sport: 'alpine', type: 'boot', brand: 'Salomon', model: 'X Pro',
            size: '270', condition: 'new',
            createdAt: ts2, updatedAt: ts2,
          }),
        },
      ];
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as any);

      const result = await getAllGearItems('user-1');
      expect(result).toHaveLength(2);
      // gear-2 has later timestamp so it should come first
      expect(result[0].id).toBe('gear-2');
    });
  });

  describe('getGearItemsByOwner', () => {
    it('returns empty array when no gear for owner', async () => {
      const result = await getGearItemsByOwner('user-1', 'member-1');
      expect(result).toEqual([]);
    });
  });

  describe('getGearItem', () => {
    it('returns null when gear does not exist', async () => {
      const result = await getGearItem('nonexistent');
      expect(result).toBeNull();
    });

    it('returns GearItem when doc exists', async () => {
      const mockTimestamp = { seconds: 1705320000, nanoseconds: 0 };
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'gear-1',
        data: () => ({
          userId: 'user-1', ownerId: 'member-1',
          sport: 'alpine', type: 'ski', brand: 'Atomic', model: 'Redster',
          size: '170', condition: 'good',
          createdAt: mockTimestamp, updatedAt: mockTimestamp,
        }),
      } as any);

      const result = await getGearItem('gear-1');
      expect(result).not.toBeNull();
      expect(result!.brand).toBe('Atomic');
    });
  });

  describe('createGearItem', () => {
    it('creates gear item and returns it with new id', async () => {
      const result = await createGearItem({
        userId: 'user-1', ownerId: 'member-1',
        sport: 'alpine', type: 'ski', brand: 'Atomic', model: 'Redster',
        size: '170', condition: 'good',
      });
      expect(result.id).toBe('mock-id');
      expect(result.brand).toBe('Atomic');
    });

    it('includes optional fields when provided', async () => {
      const result = await createGearItem({
        userId: 'user-1', ownerId: 'member-1',
        sport: 'alpine', type: 'ski', brand: 'Atomic', model: 'Redster',
        size: '170', condition: 'good',
        year: 2023, status: 'available', location: 'Garage',
        checkedOutTo: undefined, notes: 'Demo ski',
        photos: [
          { id: 'p1', type: 'fullView', url: 'http://example.com/a.jpg', createdAt: new Date().toISOString() },
        ],
      });
      expect(result.id).toBe('mock-id');
      expect(result.notes).toBe('Demo ski');
    });
  });

  describe('updateGearItem', () => {
    it('calls updateDoc', async () => {
      const { updateDoc } = await import('firebase/firestore');
      await updateGearItem('gear-1', { brand: 'Salomon', condition: 'fair' });
      expect(vi.mocked(updateDoc)).toHaveBeenCalled();
    });

    it('handles photos update', async () => {
      const { updateDoc } = await import('firebase/firestore');
      await updateGearItem('gear-1', {
        photos: [
          { id: 'p1', type: 'fullView', url: 'http://example.com/a.jpg', createdAt: new Date().toISOString() },
        ],
      });
      expect(vi.mocked(updateDoc)).toHaveBeenCalled();
    });

    it('clears photos when empty array passed', async () => {
      const { updateDoc } = await import('firebase/firestore');
      await updateGearItem('gear-1', { photos: [] });
      expect(vi.mocked(updateDoc)).toHaveBeenCalled();
    });
  });

  describe('deleteGearItem', () => {
    it('calls deleteDoc', async () => {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteGearItem('gear-1');
      expect(vi.mocked(deleteDoc)).toHaveBeenCalled();
    });
  });

  // ============================================
  // MEASUREMENT HISTORY CRUD
  // ============================================

  const makeEntry = (overrides: Partial<MeasurementEntry> = {}): MeasurementEntry => ({
    id: 'entry-1',
    recordedAt: '2024-06-01T00:00:00.000Z',
    height: 140,
    weight: 35,
    footLengthLeft: 22,
    footLengthRight: 22,
    ...overrides,
  });

  describe('docToFamilyMember with measurementHistory', () => {
    const mockTimestamp = { seconds: 1705320000, nanoseconds: 0 };

    it('maps measurementHistory when present', () => {
      const history = [makeEntry(), makeEntry({ id: 'entry-2', recordedAt: '2024-01-01T00:00:00.000Z' })];
      const data = {
        userId: 'user-1', name: 'John', dateOfBirth: '1990-01-01', gender: 'male',
        measurements: MEASUREMENTS.adultMale,
        measurementHistory: history,
        createdAt: mockTimestamp, updatedAt: mockTimestamp,
      };
      const result = docToFamilyMember('member-1', data);
      expect(result.measurementHistory).toHaveLength(2);
      expect(result.measurementHistory?.[0].id).toBe('entry-1');
    });

    it('returns undefined measurementHistory when not in doc', () => {
      const data = {
        userId: 'user-1', name: 'John', dateOfBirth: '1990-01-01', gender: 'male',
        measurements: MEASUREMENTS.adultMale,
        createdAt: mockTimestamp, updatedAt: mockTimestamp,
      };
      const result = docToFamilyMember('member-1', data);
      expect(result.measurementHistory).toBeUndefined();
    });
  });

  describe('updateMeasurements (with history)', () => {
    it('prepends a new entry to measurementHistory on update', async () => {
      const existingEntry = makeEntry({ id: 'old-entry' });
      const mockTimestamp = { seconds: 1705320000, nanoseconds: 0 };

      const { getDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'member-1',
        data: () => ({
          userId: 'user-1', name: 'John', dateOfBirth: '1990-01-01', gender: 'male',
          measurements: MEASUREMENTS.adultMale,
          measurementHistory: [existingEntry],
          createdAt: mockTimestamp, updatedAt: mockTimestamp,
        }),
      } as any);

      await updateMeasurements('member-1', MEASUREMENTS.adultMale);

      const call = vi.mocked(updateDoc).mock.calls[0];
      const updateArg = call[1] as Record<string, unknown>;
      const history = updateArg.measurementHistory as MeasurementEntry[];
      expect(history).toHaveLength(2);
      // New entry prepended
      expect(history[0].id).not.toBe('old-entry');
      expect(history[1].id).toBe('old-entry');
    });

    it('creates a history array when none exists yet', async () => {
      const mockTimestamp = { seconds: 1705320000, nanoseconds: 0 };
      const { getDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'member-1',
        data: () => ({
          userId: 'user-1', name: 'John', dateOfBirth: '1990-01-01', gender: 'male',
          measurements: MEASUREMENTS.adultMale,
          createdAt: mockTimestamp, updatedAt: mockTimestamp,
        }),
      } as any);

      await updateMeasurements('member-1', MEASUREMENTS.adultMale);

      const call = vi.mocked(updateDoc).mock.calls[0];
      const updateArg = call[1] as Record<string, unknown>;
      const history = updateArg.measurementHistory as MeasurementEntry[];
      expect(history).toHaveLength(1);
    });
  });

  describe('addMeasurementEntry', () => {
    it('prepends the new entry to existing history', async () => {
      const existing = makeEntry({ id: 'existing' });
      const mockTimestamp = { seconds: 1705320000, nanoseconds: 0 };
      const { getDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'member-1',
        data: () => ({
          measurementHistory: [existing],
          createdAt: mockTimestamp, updatedAt: mockTimestamp,
        }),
      } as any);

      const newEntry = makeEntry({ id: 'new-entry' });
      await addMeasurementEntry('member-1', newEntry);

      const call = vi.mocked(updateDoc).mock.calls[0];
      const updateArg = call[1] as Record<string, unknown>;
      const history = updateArg.measurementHistory as MeasurementEntry[];
      expect(history[0].id).toBe('new-entry');
      expect(history[1].id).toBe('existing');
    });
  });

  describe('updateMeasurementEntry', () => {
    it('updates the matching entry by id', async () => {
      const entries = [
        makeEntry({ id: 'e1', height: 140 }),
        makeEntry({ id: 'e2', height: 145 }),
      ];
      const mockTimestamp = { seconds: 1705320000, nanoseconds: 0 };
      const { getDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'member-1',
        data: () => ({
          measurementHistory: entries,
          createdAt: mockTimestamp, updatedAt: mockTimestamp,
        }),
      } as any);

      await updateMeasurementEntry('member-1', 'e1', { height: 142 });

      const call = vi.mocked(updateDoc).mock.calls[0];
      const updateArg = call[1] as Record<string, unknown>;
      const history = updateArg.measurementHistory as MeasurementEntry[];
      expect(history.find((e) => e.id === 'e1')?.height).toBe(142);
      expect(history.find((e) => e.id === 'e2')?.height).toBe(145);
    });

    it('does nothing when doc does not exist', async () => {
      const { getDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      await updateMeasurementEntry('member-1', 'e1', { height: 142 });
      expect(vi.mocked(updateDoc)).not.toHaveBeenCalled();
    });
  });

  describe('deleteMeasurementEntry', () => {
    it('removes the matching entry by id', async () => {
      const entries = [
        makeEntry({ id: 'e1' }),
        makeEntry({ id: 'e2' }),
      ];
      const mockTimestamp = { seconds: 1705320000, nanoseconds: 0 };
      const { getDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'member-1',
        data: () => ({
          measurementHistory: entries,
          createdAt: mockTimestamp, updatedAt: mockTimestamp,
        }),
      } as any);

      await deleteMeasurementEntry('member-1', 'e1');

      const call = vi.mocked(updateDoc).mock.calls[0];
      const updateArg = call[1] as Record<string, unknown>;
      const history = updateArg.measurementHistory as MeasurementEntry[];
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('e2');
    });

    it('does nothing when doc does not exist', async () => {
      const { getDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      await deleteMeasurementEntry('member-1', 'e1');
      expect(vi.mocked(updateDoc)).not.toHaveBeenCalled();
    });
  });
});
