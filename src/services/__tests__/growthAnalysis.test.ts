import { describe, it, expect } from 'vitest';
import {
  isMeasurementStale,
  analyzeGrowthTrend,
  shouldWarnGrowth,
} from '../growthAnalysis';
import type { FamilyMember, MeasurementEntry } from '../../types';
import { createFamilyMember } from '@tests/fixtures/familyMembers';
import { createMeasurements } from '@tests/fixtures/measurements';

// ── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function monthsAgo(n: number): string {
  // Subtract n * 30.4375 days
  return daysAgo(Math.round(n * 30.4375));
}

function yearsAgo(n: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString();
}

function makeEntry(overrides: Partial<MeasurementEntry> = {}): MeasurementEntry {
  return {
    id: 'entry-1',
    recordedAt: new Date().toISOString(),
    height: 140,
    weight: 35,
    footLengthLeft: 22,
    footLengthRight: 22,
    ...overrides,
  };
}

function makeChildMember(measuredAtDaysAgo: number, dob?: string): FamilyMember {
  return createFamilyMember({
    dateOfBirth: dob ?? yearsAgo(10), // 10-year-old child
    measurements: createMeasurements({ measuredAt: daysAgo(measuredAtDaysAgo) }),
  });
}

function makeAdultMember(measuredAtDaysAgo: number): FamilyMember {
  return createFamilyMember({
    dateOfBirth: yearsAgo(30), // 30-year-old adult
    measurements: createMeasurements({ measuredAt: daysAgo(measuredAtDaysAgo) }),
  });
}

// ── isMeasurementStale ───────────────────────────────────────────────────────

describe('isMeasurementStale', () => {
  it('returns true for a child with measurements older than 6 months', () => {
    const member = makeChildMember(200); // ~6.6 months ago
    expect(isMeasurementStale(member)).toBe(true);
  });

  it('returns false for a child with recent measurements (1 month ago)', () => {
    const member = makeChildMember(30);
    expect(isMeasurementStale(member)).toBe(false);
  });

  it('returns false for a child with measurements exactly at 6-month boundary', () => {
    // 6 months = ~182.6 days; 180 days should NOT yet be stale
    const member = makeChildMember(180);
    expect(isMeasurementStale(member)).toBe(false);
  });

  it('returns false for an adult with very old measurements', () => {
    const member = makeAdultMember(400); // > 6 months, but adult
    expect(isMeasurementStale(member)).toBe(false);
  });

  it('returns false for a member who just turned 18', () => {
    const member = createFamilyMember({
      dateOfBirth: yearsAgo(18),
      measurements: createMeasurements({ measuredAt: daysAgo(250) }),
    });
    expect(isMeasurementStale(member)).toBe(false);
  });
});

// ── analyzeGrowthTrend ───────────────────────────────────────────────────────

describe('analyzeGrowthTrend', () => {
  it('returns isGrowing: false with a single entry', () => {
    const result = analyzeGrowthTrend([makeEntry()]);
    expect(result.isGrowing).toBe(false);
    expect(result.growthRateCmPerMonth).toBe(0);
  });

  it('returns isGrowing: false with empty array', () => {
    const result = analyzeGrowthTrend([]);
    expect(result.isGrowing).toBe(false);
  });

  it('detects active growth (≥ 0.3 cm/month) with two entries', () => {
    // 6 months apart, 3 cm growth = 0.5 cm/month
    const entries: MeasurementEntry[] = [
      makeEntry({ id: 'e1', recordedAt: monthsAgo(6), height: 130 }),
      makeEntry({ id: 'e2', recordedAt: new Date().toISOString(), height: 133 }),
    ];
    const result = analyzeGrowthTrend(entries);
    expect(result.isGrowing).toBe(true);
    expect(result.growthRateCmPerMonth).toBeGreaterThanOrEqual(0.3);
  });

  it('returns isGrowing: false when growth is below threshold', () => {
    // 12 months apart, 1 cm growth = ~0.08 cm/month (below 0.3 threshold)
    const entries: MeasurementEntry[] = [
      makeEntry({ id: 'e1', recordedAt: monthsAgo(12), height: 170 }),
      makeEntry({ id: 'e2', recordedAt: new Date().toISOString(), height: 171 }),
    ];
    const result = analyzeGrowthTrend(entries);
    expect(result.isGrowing).toBe(false);
    expect(result.growthRateCmPerMonth).toBeLessThan(0.3);
  });

  it('sorts entries by recordedAt before computing slope', () => {
    // Entries given in reverse order — result should be same as forward order
    const entries: MeasurementEntry[] = [
      makeEntry({ id: 'e2', recordedAt: new Date().toISOString(), height: 133 }),
      makeEntry({ id: 'e1', recordedAt: monthsAgo(6), height: 130 }),
    ];
    const result = analyzeGrowthTrend(entries);
    expect(result.isGrowing).toBe(true);
  });

  it('handles exactly 0.3 cm/month as growing', () => {
    // 10 months, 3 cm = 0.3 cm/month
    const entries: MeasurementEntry[] = [
      makeEntry({ id: 'e1', recordedAt: monthsAgo(10), height: 140 }),
      makeEntry({ id: 'e2', recordedAt: new Date().toISOString(), height: 143 }),
    ];
    const result = analyzeGrowthTrend(entries);
    expect(result.isGrowing).toBe(true);
  });

  it('handles flat growth (no height change)', () => {
    const entries: MeasurementEntry[] = [
      makeEntry({ id: 'e1', recordedAt: monthsAgo(6), height: 160 }),
      makeEntry({ id: 'e2', recordedAt: new Date().toISOString(), height: 160 }),
    ];
    const result = analyzeGrowthTrend(entries);
    expect(result.isGrowing).toBe(false);
    expect(result.growthRateCmPerMonth).toBe(0);
  });

  it('works correctly with multiple entries using regression', () => {
    // ~0.5 cm/month over 4 entries, clearly growing
    const entries: MeasurementEntry[] = [
      makeEntry({ id: 'e1', recordedAt: monthsAgo(9), height: 130 }),
      makeEntry({ id: 'e2', recordedAt: monthsAgo(6), height: 131.5 }),
      makeEntry({ id: 'e3', recordedAt: monthsAgo(3), height: 133 }),
      makeEntry({ id: 'e4', recordedAt: new Date().toISOString(), height: 134.5 }),
    ];
    const result = analyzeGrowthTrend(entries);
    expect(result.isGrowing).toBe(true);
    expect(result.growthRateCmPerMonth).toBeCloseTo(0.5, 1);
  });
});

// ── shouldWarnGrowth ─────────────────────────────────────────────────────────

describe('shouldWarnGrowth', () => {
  it('returns true when measurements are stale (child, > 6 months)', () => {
    const member = makeChildMember(200);
    expect(shouldWarnGrowth(member)).toBe(true);
  });

  it('returns false for an adult with old measurements and no growth trend', () => {
    const member = makeAdultMember(400);
    expect(shouldWarnGrowth(member)).toBe(false);
  });

  it('returns true when history shows active growth regardless of staleness', () => {
    const member = createFamilyMember({
      dateOfBirth: yearsAgo(25), // adult — not stale path
      measurements: createMeasurements({ measuredAt: daysAgo(10) }), // recent
      measurementHistory: [
        makeEntry({ id: 'e1', recordedAt: monthsAgo(6), height: 130 }),
        makeEntry({ id: 'e2', recordedAt: new Date().toISOString(), height: 133 }),
      ],
    });
    expect(shouldWarnGrowth(member)).toBe(true);
  });

  it('returns false when history shows flat growth and member is adult with recent measurements', () => {
    const member = createFamilyMember({
      dateOfBirth: yearsAgo(30),
      measurements: createMeasurements({ measuredAt: daysAgo(10) }),
      measurementHistory: [
        makeEntry({ id: 'e1', recordedAt: monthsAgo(12), height: 170 }),
        makeEntry({ id: 'e2', recordedAt: new Date().toISOString(), height: 171 }),
      ],
    });
    expect(shouldWarnGrowth(member)).toBe(false);
  });

  it('returns false for child with recent measurements and no history', () => {
    const member = makeChildMember(30);
    expect(shouldWarnGrowth(member)).toBe(false);
  });

  it('returns false for child with single history entry (insufficient for trend)', () => {
    const member = createFamilyMember({
      dateOfBirth: yearsAgo(10),
      measurements: createMeasurements({ measuredAt: daysAgo(30) }),
      measurementHistory: [
        makeEntry({ id: 'e1', recordedAt: daysAgo(30), height: 140 }),
      ],
    });
    expect(shouldWarnGrowth(member)).toBe(false);
  });

  it('returns true when both stale AND growing', () => {
    // Stale measurements AND growing history
    const member = createFamilyMember({
      dateOfBirth: yearsAgo(10),
      measurements: createMeasurements({ measuredAt: daysAgo(250) }),
      measurementHistory: [
        makeEntry({ id: 'e1', recordedAt: monthsAgo(6), height: 130 }),
        makeEntry({ id: 'e2', recordedAt: new Date().toISOString(), height: 133 }),
      ],
    });
    expect(shouldWarnGrowth(member)).toBe(true);
  });
});
