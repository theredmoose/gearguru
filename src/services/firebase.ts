import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  FamilyMember,
  GearItem,
  Measurements,
  FirestoreTimestamp,
  Sport,
  SkillLevel,
} from '../types';

// ============================================
// COLLECTION NAMES
// ============================================

const COLLECTIONS = {
  FAMILY_MEMBERS: 'familyMembers',
  GEAR_ITEMS: 'gearItems',
} as const;

// ============================================
// TIMESTAMP HELPERS
// ============================================

function toFirestoreTimestamp(isoString: string): Timestamp {
  return Timestamp.fromDate(new Date(isoString));
}

function fromFirestoreTimestamp(timestamp: FirestoreTimestamp): string {
  return new Date(timestamp.seconds * 1000).toISOString();
}

function now(): string {
  return new Date().toISOString();
}

// ============================================
// FAMILY MEMBERS
// ============================================

export async function getAllFamilyMembers(userId: string): Promise<FamilyMember[]> {
  const q = query(
    collection(db, COLLECTIONS.FAMILY_MEMBERS),
    where('userId', '==', userId),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => docToFamilyMember(doc.id, doc.data()));
}

export async function getFamilyMember(
  id: string
): Promise<FamilyMember | null> {
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return docToFamilyMember(snapshot.id, snapshot.data());
}

export async function createFamilyMember(
  data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FamilyMember> {
  const timestamp = now();
  const docData = {
    ...data,
    createdAt: toFirestoreTimestamp(timestamp),
    updatedAt: toFirestoreTimestamp(timestamp),
  };

  const docRef = await addDoc(
    collection(db, COLLECTIONS.FAMILY_MEMBERS),
    docData
  );

  return {
    id: docRef.id,
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function updateFamilyMember(
  id: string,
  data: Partial<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: toFirestoreTimestamp(now()),
  });
}

export async function updateMeasurements(
  memberId: string,
  measurements: Measurements
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, memberId);
  await updateDoc(docRef, {
    measurements: {
      ...measurements,
      measuredAt: now(),
    },
    updatedAt: toFirestoreTimestamp(now()),
  });
}

export async function updateSkillLevels(
  memberId: string,
  skillLevels: Partial<Record<Sport, SkillLevel>>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, memberId);
  await updateDoc(docRef, {
    skillLevels,
    updatedAt: toFirestoreTimestamp(now()),
  });
}

export async function deleteFamilyMember(id: string): Promise<void> {
  // Delete member
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, id);
  await deleteDoc(docRef);

  // Also delete their gear items
  const gearQuery = query(
    collection(db, COLLECTIONS.GEAR_ITEMS),
    where('ownerId', '==', id)
  );
  const gearSnapshot = await getDocs(gearQuery);

  const deletePromises = gearSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

// ============================================
// GEAR ITEMS
// ============================================

export async function getAllGearItems(userId: string): Promise<GearItem[]> {
  const q = query(
    collection(db, COLLECTIONS.GEAR_ITEMS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => docToGearItem(doc.id, doc.data()));
}

export async function getGearItemsByOwner(ownerId: string): Promise<GearItem[]> {
  const q = query(
    collection(db, COLLECTIONS.GEAR_ITEMS),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => docToGearItem(doc.id, doc.data()));
}

export async function getGearItem(id: string): Promise<GearItem | null> {
  const docRef = doc(db, COLLECTIONS.GEAR_ITEMS, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return docToGearItem(snapshot.id, snapshot.data());
}

export async function createGearItem(
  data: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GearItem> {
  const timestamp = now();
  const docData = {
    ...data,
    createdAt: toFirestoreTimestamp(timestamp),
    updatedAt: toFirestoreTimestamp(timestamp),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.GEAR_ITEMS), docData);

  return {
    id: docRef.id,
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function updateGearItem(
  id: string,
  data: Partial<Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.GEAR_ITEMS, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: toFirestoreTimestamp(now()),
  });
}

export async function deleteGearItem(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.GEAR_ITEMS, id);
  await deleteDoc(docRef);
}

// ============================================
// DOCUMENT CONVERTERS
// ============================================

function docToFamilyMember(id: string, data: DocumentData): FamilyMember {
  return {
    id,
    userId: data.userId,
    name: data.name,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    measurements: data.measurements,
    skillLevels: data.skillLevels,
    createdAt: fromFirestoreTimestamp(data.createdAt),
    updatedAt: fromFirestoreTimestamp(data.updatedAt),
  };
}

function docToGearItem(id: string, data: DocumentData): GearItem {
  return {
    id,
    userId: data.userId,
    ownerId: data.ownerId,
    sport: data.sport,
    type: data.type,
    brand: data.brand,
    model: data.model,
    size: data.size,
    year: data.year,
    condition: data.condition,
    notes: data.notes,
    photos: data.photos,
    extendedDetails: data.extendedDetails,
    createdAt: fromFirestoreTimestamp(data.createdAt),
    updatedAt: fromFirestoreTimestamp(data.updatedAt),
  };
}
