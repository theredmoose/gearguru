import type { FamilyMember, MeasurementEntry } from '../types';

const GROWTH_THRESHOLD_CM_PER_MONTH = 0.3; // ≈ 3.6 cm/year
const STALE_MONTHS = 6;

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Returns true if the member's latest measurements are older than 6 months
 * AND the member is under 18.
 */
export function isMeasurementStale(member: FamilyMember): boolean {
  const age = calculateAge(member.dateOfBirth);
  if (age >= 18) return false;

  const measuredAt = new Date(member.measurements.measuredAt);
  const now = new Date();
  const diffMs = now.getTime() - measuredAt.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.4375);
  return diffMonths > STALE_MONTHS;
}

/**
 * Computes OLS linear regression of height over time from history entries.
 * Returns slope in cm/month and whether it exceeds the growth threshold.
 * Requires at least 2 entries; sorts by recordedAt ascending.
 */
export function analyzeGrowthTrend(history: MeasurementEntry[]): {
  isGrowing: boolean;
  growthRateCmPerMonth: number;
} {
  if (history.length < 2) {
    return { isGrowing: false, growthRateCmPerMonth: 0 };
  }

  // Sort ascending by date
  const sorted = [...history].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  // Convert dates to months relative to the earliest entry
  const t0 = new Date(sorted[0].recordedAt).getTime();
  const xs = sorted.map(
    (e) => (new Date(e.recordedAt).getTime() - t0) / (1000 * 60 * 60 * 24 * 30.4375)
  );
  const ys = sorted.map((e) => e.height);

  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) {
    return { isGrowing: false, growthRateCmPerMonth: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  return {
    isGrowing: slope >= GROWTH_THRESHOLD_CM_PER_MONTH,
    growthRateCmPerMonth: slope,
  };
}

/**
 * Returns true if growth warning should be shown:
 * - Measurements are stale (> 6 months, under 18), OR
 * - History shows active growth trend (≥ 0.3 cm/month)
 */
export function shouldWarnGrowth(member: FamilyMember): boolean {
  if (isMeasurementStale(member)) return true;

  const history = member.measurementHistory;
  if (!history || history.length < 2) return false;

  const { isGrowing } = analyzeGrowthTrend(history);
  return isGrowing;
}
