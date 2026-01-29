import { vi } from 'vitest';

// Mock Firestore functions
export const collection = vi.fn();
export const doc = vi.fn();
export const getDocs = vi.fn();
export const getDoc = vi.fn();
export const addDoc = vi.fn();
export const updateDoc = vi.fn();
export const deleteDoc = vi.fn();
export const query = vi.fn();
export const where = vi.fn();
export const orderBy = vi.fn();

// Mock Timestamp
export const Timestamp = {
  fromDate: vi.fn((date: Date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  })),
};

// Type exports for compatibility
export type DocumentData = Record<string, unknown>;
