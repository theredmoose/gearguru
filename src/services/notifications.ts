import type { FamilyMember, GearItem, AppNotification, GearType } from '../types';
import { GEAR_TYPE_LABELS } from '../constants/labels';

// ============================================
// NOTIFICATION GENERATION
// ============================================

// How many years old a gear item must be to trigger an "old gear" notification.
// Values are based on typical equipment lifespan guidelines.
const OLD_GEAR_THRESHOLD_YEARS: Record<GearType, number> = {
  ski:       7,
  snowboard: 7,
  pole:      10,
  boot:      5,
  binding:   7,
  skate:     5,
  helmet:    5,
  other:     7,
};

/**
 * Generate actionable notifications from current family member and gear data.
 * Notifications are deterministic: the same gear/member state always produces
 * the same notification IDs, so dismissals can be reliably matched.
 *
 * Notification types:
 * - replace  : gear condition is 'worn'  → recommend replacing/selling
 * - service  : gear condition is 'fair'  → recommend servicing or replacing soon
 * - old-gear : gear year is past lifespan threshold → recommend checking/replacing
 */
export function generateNotifications(
  members: FamilyMember[],
  gearItems: GearItem[],
): AppNotification[] {
  const currentYear = new Date().getFullYear();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const notifications: AppNotification[] = [];

  for (const item of gearItems) {
    const memberName = memberMap.get(item.ownerId)?.name ?? 'Unknown';
    const typeLabel = GEAR_TYPE_LABELS[item.type];
    const gearLabel = [item.brand, item.model, typeLabel].filter(Boolean).join(' ');

    // Worn gear → replace / sell
    if (item.condition === 'worn') {
      notifications.push({
        id: `worn-${item.id}`,
        type: 'replace',
        title: `Replace ${memberName}'s ${typeLabel}`,
        body: `${gearLabel} is worn out. Time to replace or sell.`,
        gearItemId: item.id,
        memberId: item.ownerId,
        createdAt: item.updatedAt,
      });
    }

    // Fair condition → service / consider replacing
    if (item.condition === 'fair') {
      notifications.push({
        id: `fair-${item.id}`,
        type: 'service',
        title: `Service ${memberName}'s ${typeLabel}`,
        body: `${gearLabel} is in fair condition. Consider servicing or replacing soon.`,
        gearItemId: item.id,
        memberId: item.ownerId,
        createdAt: item.updatedAt,
      });
    }

    // Old gear → lifespan exceeded
    if (item.year) {
      const ageYears = currentYear - item.year;
      const threshold = OLD_GEAR_THRESHOLD_YEARS[item.type] ?? 7;
      if (ageYears >= threshold) {
        notifications.push({
          id: `old-${item.id}`,
          type: 'old-gear',
          title: `Check ${memberName}'s ${item.year} ${typeLabel}`,
          body: `${gearLabel} is ${ageYears} years old. Consider replacing.`,
          gearItemId: item.id,
          memberId: item.ownerId,
          createdAt: item.updatedAt,
        });
      }
    }
  }

  // Sort: replace first, then service, then old-gear
  const typePriority: Record<string, number> = { replace: 0, service: 1, 'old-gear': 2 };
  return notifications.sort(
    (a, b) => (typePriority[a.type] ?? 3) - (typePriority[b.type] ?? 3),
  );
}
