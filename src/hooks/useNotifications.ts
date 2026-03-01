import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FamilyMember, GearItem, AppNotification } from '../types';
import { generateNotifications } from '../services/notifications';
import {
  getDismissedNotificationIds,
  dismissNotificationForUser,
  undismissNotificationForUser,
} from '../services/firebase';

export interface UseNotificationsReturn {
  activeNotifications: AppNotification[];
  dismissedNotifications: AppNotification[];
  dismiss: (id: string) => Promise<void>;
  undismiss: (id: string) => Promise<void>;
  loading: boolean;
}

export function useNotifications(
  userId: string | null,
  members: FamilyMember[],
  gearItems: GearItem[],
  enabled: boolean,
): UseNotificationsReturn {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load dismissed IDs from Firestore once on mount (or when user/enabled changes)
  useEffect(() => {
    if (!userId || !enabled) {
      setDismissedIds([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getDismissedNotificationIds(userId)
      .then((ids) => { if (!cancelled) setDismissedIds(ids); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, enabled]);

  const allNotifications = useMemo(
    () => (enabled ? generateNotifications(members, gearItems) : []),
    [members, gearItems, enabled],
  );

  const activeNotifications = useMemo(
    () => allNotifications.filter((n) => !dismissedIds.includes(n.id)),
    [allNotifications, dismissedIds],
  );

  const dismissedNotifications = useMemo(
    () => allNotifications.filter((n) => dismissedIds.includes(n.id)),
    [allNotifications, dismissedIds],
  );

  const dismiss = useCallback(async (id: string) => {
    if (!userId) return;
    // Optimistic update
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    try {
      await dismissNotificationForUser(userId, id);
    } catch {
      // Rollback on error
      setDismissedIds((prev) => prev.filter((d) => d !== id));
    }
  }, [userId]);

  const undismiss = useCallback(async (id: string) => {
    if (!userId) return;
    // Optimistic update
    setDismissedIds((prev) => prev.filter((d) => d !== id));
    try {
      await undismissNotificationForUser(userId, id);
    } catch {
      // Rollback on error
      setDismissedIds((prev) => [...prev, id]);
    }
  }, [userId]);

  return { activeNotifications, dismissedNotifications, dismiss, undismiss, loading };
}
