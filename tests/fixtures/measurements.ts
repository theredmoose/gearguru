import type { Measurements } from '../../src/types';

/**
 * Factory function to create test measurements
 */
export const createMeasurements = (
  overrides?: Partial<Measurements>
): Measurements => ({
  height: 175,
  weight: 70,
  footLengthLeft: 27,
  footLengthRight: 27.2,
  footWidthLeft: 10,
  footWidthRight: 10.1,
  usShoeSize: 10,
  euShoeSize: 43,
  measuredAt: '2024-01-15T10:00:00.000Z',
  ...overrides,
});

/**
 * Pre-defined measurement sets for different test scenarios
 */
export const MEASUREMENTS = {
  // Standard adult male
  adultMale: createMeasurements({
    height: 180,
    weight: 80,
    footLengthLeft: 27.5,
    footLengthRight: 27.5,
  }),

  // Standard adult female
  adultFemale: createMeasurements({
    height: 165,
    weight: 60,
    footLengthLeft: 24,
    footLengthRight: 24,
    footWidthLeft: 9,
    footWidthRight: 9,
  }),

  // Child (10-12 years)
  child: createMeasurements({
    height: 140,
    weight: 35,
    footLengthLeft: 22,
    footLengthRight: 22,
    footWidthLeft: 8,
    footWidthRight: 8,
  }),

  // Heavy athlete (triggers weight adjustments)
  heavyAthlete: createMeasurements({
    height: 190,
    weight: 95,
    footLengthLeft: 29,
    footLengthRight: 29,
  }),

  // Light athlete (triggers weight adjustments)
  lightAthlete: createMeasurements({
    height: 165,
    weight: 52,
    footLengthLeft: 25,
    footLengthRight: 25,
  }),

  // Narrow feet
  narrowFeet: createMeasurements({
    height: 175,
    weight: 70,
    footLengthLeft: 27,
    footLengthRight: 27,
    footWidthLeft: 9,
    footWidthRight: 9,
  }),

  // Wide feet
  wideFeet: createMeasurements({
    height: 175,
    weight: 70,
    footLengthLeft: 27,
    footLengthRight: 27,
    footWidthLeft: 11.5,
    footWidthRight: 11.5,
  }),

  // Missing optional fields
  minimal: createMeasurements({
    height: 175,
    weight: 70,
    footLengthLeft: 27,
    footLengthRight: 27,
    footWidthLeft: undefined,
    footWidthRight: undefined,
    usShoeSize: undefined,
    euShoeSize: undefined,
  }),
};
