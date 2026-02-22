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
  refresh: () => Promise<void>;
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

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const members = await firebaseService.getAllFamilyMembers(userId);
      setState({ data: members, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      });
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addMember = useCallback(
    async (data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const member = await firebaseService.createFamilyMember(data);
        setState((prev) => ({
          ...prev,
          data: prev.data ? [...prev.data, member] : [member],
        }));
        return member;
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
        setState((prev) => ({
          ...prev,
          data: prev.data
            ? prev.data.map((m) => (m.id === id ? { ...m, ...data } : m))
            : null,
        }));
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
        setState((prev) => ({
          ...prev,
          data: prev.data
            ? prev.data.map((m) => (m.id === id ? { ...m, measurements } : m))
            : null,
        }));
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
        setState((prev) => ({
          ...prev,
          data: prev.data
            ? prev.data.map((m) => (m.id === id ? { ...m, skillLevels } : m))
            : null,
        }));
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
      setState((prev) => ({
        ...prev,
        data: prev.data ? prev.data.filter((m) => m.id !== id) : null,
      }));
    } catch (err) {
      console.error('[GearGuru] deleteMember failed', err);
      throw err;
    }
  }, []);

  return {
    members: state.data ?? [],
    loading: state.loading,
    error: state.error,
    refresh,
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
  refresh: () => Promise<void>;
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

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const items = ownerId
        ? await firebaseService.getGearItemsByOwner(userId, ownerId)
        : await firebaseService.getAllGearItems(userId);
      setState({ data: items, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      });
    }
  }, [userId, ownerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (data: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const item = await firebaseService.createGearItem(data);
        setState((prev) => ({
          ...prev,
          data: prev.data ? [item, ...prev.data] : [item],
        }));
        return item;
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
        setState((prev) => ({
          ...prev,
          data: prev.data
            ? prev.data.map((i) => (i.id === id ? { ...i, ...data } : i))
            : null,
        }));
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
      setState((prev) => ({
        ...prev,
        data: prev.data ? prev.data.filter((i) => i.id !== id) : null,
      }));
    } catch (err) {
      console.error('[GearGuru] deleteItem failed', err);
      throw err;
    }
  }, []);

  return {
    items: state.data ?? [],
    loading: state.loading,
    error: state.error,
    refresh,
    addItem,
    updateItem,
    deleteItem,
  };
}
