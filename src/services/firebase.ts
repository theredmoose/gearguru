import { getDb } from '../config/firebase';
import type { DocumentData } from 'firebase/firestore';
import type {
  FamilyMember,
  GearItem,
  GearPhoto,
  Measurements,
  MeasurementEntry,
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

async function toFirestoreTimestamp(isoString: string) {
  const { Timestamp } = await import('firebase/firestore');
  return Timestamp.fromDate(new Date(isoString));
}

export function fromFirestoreTimestamp(timestamp: FirestoreTimestamp): string {
  return new Date(timestamp.seconds * 1000 + Math.round(timestamp.nanoseconds / 1e6)).toISOString();
}

function now(): string {
  return new Date().toISOString();
}

// Remove undefined values recursively (Firestore doesn't accept them)
function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as T;
  }
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    ) as T;
  }
  return obj;
}

// Clean photos array for Firestore (ensure only plain objects with valid properties)
function cleanPhotos(photos: GearPhoto[] | undefined): Array<{id: string; type: string; url: string; createdAt: string; caption?: string}> | undefined {
  if (!photos || photos.length === 0) return undefined;
  // Use JSON parse/stringify to create completely clean plain objects
  const cleaned = photos.map((photo) => {
    const cleanPhoto: {id: string; type: string; url: string; createdAt: string; caption?: string} = {
      id: String(photo.id),
      type: String(photo.type),
      url: String(photo.url),
      createdAt: String(photo.createdAt),
    };
    if (photo.caption) {
      cleanPhoto.caption = String(photo.caption);
    }
    return cleanPhoto;
  });
  return JSON.parse(JSON.stringify(cleaned));
}

// ============================================
// FAMILY MEMBERS
// ============================================

export async function getAllFamilyMembers(userId: string): Promise<FamilyMember[]> {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const db = await getDb();
  const q = query(
    collection(db, COLLECTIONS.FAMILY_MEMBERS),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);

  // Sort client-side for now (until indexes are built)
  return snapshot.docs
    .map((doc) => docToFamilyMember(doc.id, doc.data()))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFamilyMember(
  id: string
): Promise<FamilyMember | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const db = await getDb();
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
  const { collection, addDoc } = await import('firebase/firestore');
  const db = await getDb();
  const timestamp = now();
  const docData = {
    ...removeUndefined(data),
    familyId: data.userId, // familyId === userId for now; scaffolding for future multi-family
    createdAt: await toFirestoreTimestamp(timestamp),
    updatedAt: await toFirestoreTimestamp(timestamp),
  };

  const docRef = await addDoc(
    collection(db, COLLECTIONS.FAMILY_MEMBERS),
    docData
  );

  return {
    id: docRef.id,
    ...data,
    familyId: data.userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function updateFamilyMember(
  id: string,
  data: Partial<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const { doc, updateDoc } = await import('firebase/firestore');
  const db = await getDb();
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, id);
  await updateDoc(docRef, {
    ...removeUndefined(data),
    updatedAt: await toFirestoreTimestamp(now()),
  });
}

export async function updateMeasurements(
  memberId: string,
  measurements: Measurements
): Promise<void> {
  const { doc, getDoc, updateDoc } = await import('firebase/firestore');
  const db = await getDb();
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, memberId);
  const measuredAt = now();

  // Build a new history entry from the incoming measurements
  const newEntry: MeasurementEntry = {
    id: crypto.randomUUID(),
    recordedAt: measuredAt,
    height: measurements.height,
    weight: measurements.weight,
    footLengthLeft: measurements.footLengthLeft,
    footLengthRight: measurements.footLengthRight,
    ...(measurements.footWidthLeft !== undefined && { footWidthLeft: measurements.footWidthLeft }),
    ...(measurements.footWidthRight !== undefined && { footWidthRight: measurements.footWidthRight }),
    ...(measurements.usShoeSize !== undefined && { usShoeSize: measurements.usShoeSize }),
    ...(measurements.euShoeSize !== undefined && { euShoeSize: measurements.euShoeSize }),
    ...(measurements.armLength !== undefined && { armLength: measurements.armLength }),
    ...(measurements.inseam !== undefined && { inseam: measurements.inseam }),
    ...(measurements.headCircumference !== undefined && { headCircumference: measurements.headCircumference }),
    ...(measurements.handSize !== undefined && { handSize: measurements.handSize }),
  };

  // Read current history, prepend new entry, write back
  const snapshot = await getDoc(docRef);
  const existingHistory: MeasurementEntry[] = snapshot.exists()
    ? (snapshot.data().measurementHistory ?? [])
    : [];

  await updateDoc(docRef, {
    measurements: {
      ...measurements,
      measuredAt,
    },
    measurementHistory: [newEntry, ...existingHistory],
    updatedAt: await toFirestoreTimestamp(measuredAt),
  });
}

export async function addMeasurementEntry(
  memberId: string,
  entry: MeasurementEntry
): Promise<void> {
  const { doc, getDoc, updateDoc } = await import('firebase/firestore');
  const db = await getDb();
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, memberId);

  const snapshot = await getDoc(docRef);
  const existing: MeasurementEntry[] = snapshot.exists()
    ? (snapshot.data().measurementHistory ?? [])
    : [];

  await updateDoc(docRef, {
    measurementHistory: [entry, ...existing],
    updatedAt: await toFirestoreTimestamp(now()),
  });
}

export async function updateMeasurementEntry(
  memberId: string,
  entryId: string,
  updates: Partial<Omit<MeasurementEntry, 'id'>>
): Promise<void> {
  const { doc, getDoc, updateDoc } = await import('firebase/firestore');
  const db = await getDb();
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, memberId);

  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return;

  const existing: MeasurementEntry[] = snapshot.data().measurementHistory ?? [];
  const updated = existing.map((e) =>
    e.id === entryId ? { ...e, ...updates } : e
  );

  await updateDoc(docRef, {
    measurementHistory: updated,
    updatedAt: await toFirestoreTimestamp(now()),
  });
}

export async function deleteMeasurementEntry(
  memberId: string,
  entryId: string
): Promise<void> {
  const { doc, getDoc, updateDoc } = await import('firebase/firestore');
  const db = await getDb();
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, memberId);

  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return;

  const existing: MeasurementEntry[] = snapshot.data().measurementHistory ?? [];
  const filtered = existing.filter((e) => e.id !== entryId);

  await updateDoc(docRef, {
    measurementHistory: filtered,
    updatedAt: await toFirestoreTimestamp(now()),
  });
}

export async function updateSkillLevels(
  memberId: string,
  skillLevels: Partial<Record<Sport, SkillLevel>>
): Promise<void> {
  const { doc, updateDoc } = await import('firebase/firestore');
  const db = await getDb();
  const docRef = doc(db, COLLECTIONS.FAMILY_MEMBERS, memberId);
  await updateDoc(docRef, {
    skillLevels,
    updatedAt: await toFirestoreTimestamp(now()),
  });
}

export async function deleteFamilyMember(id: string): Promise<void> {
  const { collection, doc, deleteDoc, query, where, getDocs } = await import('firebase/firestore');
  const db = await getDb();

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
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const db = await getDb();
  const q = query(
    collection(db, COLLECTIONS.GEAR_ITEMS),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);

  // Sort client-side for now (until indexes are built)
  return snapshot.docs
    .map((doc) => docToGearItem(doc.id, doc.data()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getGearItemsByOwner(userId: string, ownerId: string): Promise<GearItem[]> {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const db = await getDb();
  const q = query(
    collection(db, COLLECTIONS.GEAR_ITEMS),
    where('userId', '==', userId),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);

  // Sort client-side for now (until indexes are built)
  return snapshot.docs
    .map((doc) => docToGearItem(doc.id, doc.data()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getGearItem(id: string): Promise<GearItem | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const db = await getDb();
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
  const { collection, addDoc } = await import('firebase/firestore');
  const db = await getDb();
  const timestamp = now();
  // Build document explicitly to avoid any prototype chain issues
  const docData: DocumentData = {
    userId: data.userId,
    familyId: data.userId, // familyId === userId for now; scaffolding for future multi-family
    ownerId: data.ownerId,
    sports: data.sports,
    type: data.type,
    brand: data.brand,
    model: data.model,
    size: data.size,
    condition: data.condition,
    createdAt: await toFirestoreTimestamp(timestamp),
    updatedAt: await toFirestoreTimestamp(timestamp),
  };
  // Add optional fields only if defined
  if (data.year !== undefined) docData.year = data.year;
  if (data.status !== undefined) docData.status = data.status;
  if (data.location !== undefined) docData.location = data.location;
  if (data.checkedOutTo !== undefined) docData.checkedOutTo = data.checkedOutTo;
  if (data.checkedOutDate !== undefined) docData.checkedOutDate = data.checkedOutDate;
  if (data.notes !== undefined) docData.notes = data.notes;
  if (data.photos && data.photos.length > 0) docData.photos = cleanPhotos(data.photos);
  if (data.extendedDetails !== undefined) docData.extendedDetails = JSON.parse(JSON.stringify(data.extendedDetails));

  const docRef = await addDoc(collection(db, COLLECTIONS.GEAR_ITEMS), docData);

  return {
    id: docRef.id,
    ...data,
    familyId: data.userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function updateGearItem(
  id: string,
  data: Partial<Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const { doc, updateDoc } = await import('firebase/firestore');
  const db = await getDb();
  const docRef = doc(db, COLLECTIONS.GEAR_ITEMS, id);
  // Build update object explicitly to avoid any prototype chain issues
  const updateData: DocumentData = {
    updatedAt: await toFirestoreTimestamp(now()),
  };
  // Add only the fields that are being updated
  if (data.userId !== undefined) updateData.userId = data.userId;
  if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;
  if (data.sports !== undefined) updateData.sports = data.sports;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.brand !== undefined) updateData.brand = data.brand;
  if (data.model !== undefined) updateData.model = data.model;
  if (data.size !== undefined) updateData.size = data.size;
  if (data.condition !== undefined) updateData.condition = data.condition;
  if (data.year !== undefined) updateData.year = data.year;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.checkedOutTo !== undefined) updateData.checkedOutTo = data.checkedOutTo;
  if (data.checkedOutDate !== undefined) updateData.checkedOutDate = data.checkedOutDate;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.photos !== undefined) updateData.photos = data.photos && data.photos.length > 0 ? cleanPhotos(data.photos) : [];
  if (data.extendedDetails !== undefined) updateData.extendedDetails = JSON.parse(JSON.stringify(data.extendedDetails));

  await updateDoc(docRef, updateData);
}

export async function deleteGearItem(id: string): Promise<void> {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const db = await getDb();
  const docRef = doc(db, COLLECTIONS.GEAR_ITEMS, id);
  await deleteDoc(docRef);
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export async function subscribeToFamilyMembers(
  userId: string,
  onData: (members: FamilyMember[]) => void,
  onError: (err: Error) => void
): Promise<() => void> {
  const { collection, query, where, onSnapshot } = await import('firebase/firestore');
  const db = await getDb();
  const q = query(
    collection(db, COLLECTIONS.FAMILY_MEMBERS),
    where('userId', '==', userId)
  );
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const members = snapshot.docs
        .map((doc) => docToFamilyMember(doc.id, doc.data()))
        .sort((a, b) => a.name.localeCompare(b.name));
      onData(members);
    },
    onError
  );
  return unsubscribe;
}

export async function subscribeToGearItems(
  userId: string,
  onData: (items: GearItem[]) => void,
  onError: (err: Error) => void,
  ownerId?: string
): Promise<() => void> {
  const { collection, query, where, onSnapshot } = await import('firebase/firestore');
  const db = await getDb();
  const constraints = ownerId
    ? [where('userId', '==', userId), where('ownerId', '==', ownerId)]
    : [where('userId', '==', userId)];
  const q = query(collection(db, COLLECTIONS.GEAR_ITEMS), ...constraints);
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs
        .map((doc) => docToGearItem(doc.id, doc.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    onError
  );
  return unsubscribe;
}

// ============================================
// DOCUMENT CONVERTERS (exported for testing)
// ============================================

export function docToFamilyMember(id: string, data: DocumentData): FamilyMember {
  return {
    id,
    userId: data.userId,
    familyId: data.familyId ?? data.userId, // fall back to userId for legacy docs
    name: data.name,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    measurements: data.measurements,
    measurementHistory: data.measurementHistory ?? undefined,
    skillLevels: data.skillLevels,
    createdAt: fromFirestoreTimestamp(data.createdAt),
    updatedAt: fromFirestoreTimestamp(data.updatedAt),
  };
}

export function docToGearItem(id: string, data: DocumentData): GearItem {
  // On-read migration: old docs have `sport` (string), new docs have `sports` (array)
  const sports: Sport[] = data.sports ?? (data.sport ? [data.sport as Sport] : []);

  // On-read migration: map old GearStatus values to new PRD values
  type LegacyStatus = 'checked-out' | 'maintenance' | undefined;
  const migrateStatus = (raw: string | undefined): import('../types').GearStatus | undefined => {
    if (raw === 'checked-out') return 'active';
    if (raw === 'maintenance') return 'needs-repair';
    if (!raw) return 'available';
    return raw as import('../types').GearStatus;
  };

  return {
    id,
    userId: data.userId,
    familyId: data.familyId ?? data.userId, // fall back to userId for legacy docs
    ownerId: data.ownerId,
    sports,
    type: data.type,
    brand: data.brand,
    model: data.model,
    size: data.size,
    year: data.year,
    condition: data.condition,
    status: migrateStatus(data.status as LegacyStatus | string),
    location: data.location,
    checkedOutTo: data.checkedOutTo,
    checkedOutDate: data.checkedOutDate,
    notes: data.notes,
    photos: data.photos,
    extendedDetails: data.extendedDetails,
    createdAt: fromFirestoreTimestamp(data.createdAt),
    updatedAt: fromFirestoreTimestamp(data.updatedAt),
  };
}
