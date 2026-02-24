import type { FamilyMember, MeasurementEntry } from '../../src/types';
import { MEASUREMENTS } from './measurements';

/**
 * Factory function to create test family members
 */
export const createFamilyMember = (
  overrides?: Partial<FamilyMember>
): FamilyMember => ({
  id: 'test-member-1',
  userId: 'test-user-1',
  name: 'John Doe',
  dateOfBirth: '1990-05-15',
  gender: 'male',
  measurements: MEASUREMENTS.adultMale,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  ...overrides,
});

/**
 * Pre-defined family members for different test scenarios
 */
export const FAMILY_MEMBERS = {
  // Adult male (John)
  john: createFamilyMember(),

  // Adult female (Jane)
  jane: createFamilyMember({
    id: 'test-member-2',
    name: 'Jane Doe',
    dateOfBirth: '1992-08-20',
    gender: 'female',
    measurements: MEASUREMENTS.adultFemale,
  }),

  // Child (Tommy)
  tommy: createFamilyMember({
    id: 'test-member-3',
    name: 'Tommy Doe',
    dateOfBirth: '2015-03-10',
    gender: 'male',
    measurements: MEASUREMENTS.child,
  }),

  // Heavy athlete
  athlete: createFamilyMember({
    id: 'test-member-4',
    name: 'Mike Strong',
    dateOfBirth: '1988-11-22',
    gender: 'male',
    measurements: MEASUREMENTS.heavyAthlete,
  }),

  // Light person
  light: createFamilyMember({
    id: 'test-member-5',
    name: 'Sara Light',
    dateOfBirth: '1995-04-18',
    gender: 'female',
    measurements: MEASUREMENTS.lightAthlete,
  }),
};

/**
 * Array of all family members for list testing
 */
export const ALL_FAMILY_MEMBERS = Object.values(FAMILY_MEMBERS);

/**
 * Helper to create a MeasurementEntry for tests
 */
export const createMeasurementEntry = (
  overrides?: Partial<MeasurementEntry>
): MeasurementEntry => ({
  id: 'test-entry-1',
  recordedAt: '2024-01-15T10:00:00.000Z',
  height: 175,
  weight: 70,
  footLengthLeft: 27,
  footLengthRight: 27.2,
  ...overrides,
});
