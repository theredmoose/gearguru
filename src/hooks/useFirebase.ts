import { useState, useEffect, useCallback } from 'react';
import type { FamilyMember, GearItem, Measurements, Sport, SkillLevel } from '../types';
import * as firebaseService from '../services/firebase';

// ============================================
// GENERIC ASYNC STATE HOOK
// ============================================

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// ============================================
// FAMILY MEMBERS HOOK
// ============================================

interface UseFamilyMembersReturn {
  members: FamilyMember[];
  loading: boolean;
  error: Error | null;
  addMember: (
    data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<FamilyMember>;
  updateMember: (
    id: string,
    data: Partial<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>;
  updateMeasurements: (id: string, measurements: Measurements) => Promise<void>;
  updateSkillLevels: (id: string, skillLevels: Partial<Record<Sport, SkillLevel>>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

export function useFamilyMembers(userId: string | null): UseFamilyMembersReturn {
  const [state, setState] = useState<AsyncState<FamilyMember[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    let unsubscribe: (() => void) | undefined;
    let active = true;

    firebaseService.subscribeToFamilyMembers(
      userId,
      (members) => {
        if (active) setState({ data: members, loading: false, error: null });
      },
      (err) => {
        if (active) setState({ data: null, loading: false, error: err });
      }
    ).then((unsub) => {
      if (!active) { unsub(); return; }
      unsubscribe = unsub;
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [userId]);

  const addMember = useCallback(
    async (data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        return await firebaseService.createFamilyMember(data);
      } catch (err) {
        console.error('[GearGuru] addMember failed', err);
        throw err;
      }
    },
    []
  );

  const updateMember = useCallback(
    async (
      id: string,
      data: Partial<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>
    ) => {
      try {
        await firebaseService.updateFamilyMember(id, data);
      } catch (err) {
        console.error('[GearGuru] updateMember failed', err);
        throw err;
      }
    },
    []
  );

  const updateMeasurements = useCallback(
    async (id: string, measurements: Measurements) => {
      try {
        await firebaseService.updateMeasurements(id, measurements);
      } catch (err) {
        console.error('[GearGuru] updateMeasurements failed', err);
        throw err;
      }
    },
    []
  );

  const updateSkillLevels = useCallback(
    async (id: string, skillLevels: Partial<Record<Sport, SkillLevel>>) => {
      try {
        await firebaseService.updateSkillLevels(id, skillLevels);
      } catch (err) {
        console.error('[GearGuru] updateSkillLevels failed', err);
        throw err;
      }
    },
    []
  );

  const deleteMember = useCallback(async (id: string) => {
    try {
      await firebaseService.deleteFamilyMember(id);
    } catch (err) {
      console.error('[GearGuru] deleteMember failed', err);
      throw err;
    }
  }, []);

  return {
    members: state.data ?? [],
    loading: state.loading,
    error: state.error,
    addMember,
    updateMember,
    updateMeasurements,
    updateSkillLevels,
    deleteMember,
  };
}

// ============================================
// SINGLE FAMILY MEMBER HOOK
// ============================================

interface UseFamilyMemberReturn {
  member: FamilyMember | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useFamilyMember(id: string | null): UseFamilyMemberReturn {
  const [state, setState] = useState<AsyncState<FamilyMember>>({
    data: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const member = await firebaseService.getFamilyMember(id);
      setState({ data: member, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      });
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    member: state.data,
    loading: state.loading,
    error: state.error,
    refresh,
  };
}

// ============================================
// GEAR ITEMS HOOK
// ============================================

interface UseGearItemsReturn {
  items: GearItem[];
  loading: boolean;
  error: Error | null;
  addItem: (
    data: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<GearItem>;
  updateItem: (
    id: string,
    data: Partial<Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export function useGearItems(userId: string | null, ownerId?: string): UseGearItemsReturn {
  const [state, setState] = useState<AsyncState<GearItem[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    let unsubscribe: (() => void) | undefined;
    let active = true;

    firebaseService.subscribeToGearItems(
      userId,
      (items) => {
        if (active) setState({ data: items, loading: false, error: null });
      },
      (err) => {
        if (active) setState({ data: null, loading: false, error: err });
      },
      ownerId
    ).then((unsub) => {
      if (!active) { unsub(); return; }
      unsubscribe = unsub;
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [userId, ownerId]);

  const addItem = useCallback(
    async (data: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        return await firebaseService.createGearItem(data);
      } catch (err) {
        console.error('[GearGuru] addItem failed', err);
        throw err;
      }
    },
    []
  );

  const updateItem = useCallback(
    async (
      id: string,
      data: Partial<Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>>
    ) => {
      try {
        await firebaseService.updateGearItem(id, data);
      } catch (err) {
        console.error('[GearGuru] updateItem failed', err);
        throw err;
      }
    },
    []
  );

  const deleteItem = useCallback(async (id: string) => {
    try {
      await firebaseService.deleteGearItem(id);
    } catch (err) {
      console.error('[GearGuru] deleteItem failed', err);
      throw err;
    }
  }, []);

  return {
    items: state.data ?? [],
    loading: state.loading,
    error: state.error,
    addItem,
    updateItem,
    deleteItem,
  };
}
