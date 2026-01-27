# GearGuru - System Architecture

## Overview

GearGuru is a cross-platform mobile application built with React Native, following a local-first architecture with optional cloud synchronization. This document outlines the technical architecture, data models, and system design.

---

## Architecture Principles

1. **Local-First**: All data stored locally; app works fully offline
2. **Privacy by Design**: Minimal data collection, local encryption
3. **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
4. **Scalable Structure**: Modular design to support phased feature rollout
5. **Cross-Platform Consistency**: Single codebase for iOS and Android

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │   Screens   │ │ Components  │ │ Navigation  │ │   Hooks    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Zustand Store                          ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ ││
│  │  │ Children │ │   Gear   │ │   Auth   │ │  Notifications │ ││
│  │  │  Slice   │ │  Slice   │ │  Slice   │ │     Slice      │ ││
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │   Child     │ │    Gear     │ │    Size     │ │   Image    │ │
│  │  Service    │ │   Service   │ │  Service    │ │  Service   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌─────────────────────────────┐ ┌────────────────────────────┐ │
│  │      Local Database         │ │      File Storage          │ │
│  │        (SQLite)             │ │    (React Native FS)       │ │
│  └─────────────────────────────┘ └────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Sync Engine (Future)                     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Framework
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | React Native 0.73+ | Cross-platform, large ecosystem |
| Language | TypeScript | Type safety, better DX |
| Navigation | React Navigation 6 | Industry standard, native feel |
| State | Zustand | Lightweight, simple API |

### Data & Storage
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Local DB | SQLite (expo-sqlite) | Reliable, performant, offline |
| ORM | Drizzle ORM | Type-safe, lightweight |
| File Storage | expo-file-system | Image storage |
| Encryption | expo-crypto | Local data encryption |

### UI & Styling
| Component | Technology | Rationale |
|-----------|------------|-----------|
| UI Library | React Native Paper | Material Design, accessible |
| Styling | NativeWind (Tailwind) | Rapid development, consistency |
| Icons | @expo/vector-icons | Comprehensive icon set |
| Images | expo-image | Optimized image handling |

### Development & Testing
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Build | Expo (managed) | Simplified builds, OTA updates |
| Testing | Jest + RTL | Standard testing stack |
| E2E Testing | Detox | Native E2E testing |
| Linting | ESLint + Prettier | Code consistency |

---

## Project Structure

```
gearguru/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx             # Home/Dashboard
│   │   ├── children/             # Children screens
│   │   │   ├── index.tsx         # Children list
│   │   │   └── [id].tsx          # Child detail
│   │   ├── gear/                 # Gear screens
│   │   │   ├── index.tsx         # Gear inventory
│   │   │   └── [id].tsx          # Gear detail
│   │   └── settings.tsx          # Settings screen
│   ├── _layout.tsx               # Root layout
│   └── modals/                   # Modal screens
│       ├── add-child.tsx
│       ├── add-gear.tsx
│       └── size-update.tsx
│
├── src/
│   ├── components/               # Reusable components
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   ├── children/             # Child-related components
│   │   │   ├── ChildCard.tsx
│   │   │   ├── SizeDisplay.tsx
│   │   │   └── GrowthChart.tsx
│   │   ├── gear/                 # Gear-related components
│   │   │   ├── GearCard.tsx
│   │   │   ├── GearList.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── forms/                # Form components
│   │       ├── ChildForm.tsx
│   │       ├── GearForm.tsx
│   │       └── SizeForm.tsx
│   │
│   ├── store/                    # Zustand state management
│   │   ├── index.ts              # Store configuration
│   │   ├── childrenSlice.ts      # Children state
│   │   ├── gearSlice.ts          # Gear state
│   │   ├── authSlice.ts          # Auth state
│   │   └── notificationSlice.ts  # Notifications state
│   │
│   ├── services/                 # Business logic
│   │   ├── childService.ts       # Child CRUD operations
│   │   ├── gearService.ts        # Gear CRUD operations
│   │   ├── sizeService.ts        # Size calculations/conversions
│   │   ├── imageService.ts       # Image handling
│   │   └── notificationService.ts
│   │
│   ├── database/                 # Database layer
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   ├── migrations/           # Database migrations
│   │   ├── client.ts             # Database client
│   │   └── repositories/         # Data access layer
│   │       ├── childRepository.ts
│   │       └── gearRepository.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useChildren.ts
│   │   ├── useGear.ts
│   │   ├── useSizes.ts
│   │   └── useNotifications.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── sizeConversions.ts    # Size conversion utilities
│   │   ├── dateUtils.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── child.ts
│   │   ├── gear.ts
│   │   ├── size.ts
│   │   └── index.ts
│   │
│   └── config/                   # App configuration
│       ├── sports.ts             # Sport category definitions
│       ├── sizes.ts              # Size category definitions
│       └── theme.ts              # Theme configuration
│
├── assets/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── docs/                         # Documentation
│   ├── PRD.md
│   └── ARCHITECTURE.md
│
└── __tests__/                    # Test files
    ├── components/
    ├── services/
    └── utils/
```

---

## Data Models

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      Child       │       │   SizeHistory    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │───┐   │ id (PK)          │
│ name             │   │   │ childId (FK)     │──┐
│ dateOfBirth      │   │   │ category         │  │
│ photoUri         │   └──▶│ value            │  │
│ createdAt        │       │ unit             │  │
│ updatedAt        │       │ recordedAt       │  │
└──────────────────┘       └──────────────────┘  │
         │                                        │
         │ 1:N                                    │
         ▼                                        │
┌──────────────────┐       ┌──────────────────┐  │
│    GearItem      │       │   GearPhoto      │  │
├──────────────────┤       ├──────────────────┤  │
│ id (PK)          │───┐   │ id (PK)          │  │
│ childId (FK)     │◀──┼───│ gearId (FK)      │  │
│ name             │   │   │ uri              │  │
│ sport            │   │   │ isPrimary        │  │
│ category         │   └──▶│ createdAt        │  │
│ size             │       └──────────────────┘  │
│ condition        │                             │
│ status           │       ┌──────────────────┐  │
│ brand            │       │   Measurement    │  │
│ model            │       ├──────────────────┤  │
│ purchaseDate     │       │ id (PK)          │  │
│ purchasePrice    │       │ childId (FK)     │◀─┘
│ notes            │       │ type             │
│ createdAt        │       │ valueCm          │
│ updatedAt        │       │ recordedAt       │
└──────────────────┘       └──────────────────┘
```

### TypeScript Types

```typescript
// src/types/child.ts
export interface Child {
  id: string;
  name: string;
  dateOfBirth: Date;
  photoUri?: string;
  sports: Sport[];
  createdAt: Date;
  updatedAt: Date;
}

// src/types/size.ts
export type SizeCategory =
  | 'footwear'
  | 'shirt'
  | 'pants'
  | 'shorts'
  | 'jacket'
  | 'helmet'
  | 'gloves';

export interface SizeRecord {
  id: string;
  childId: string;
  category: SizeCategory;
  value: string;
  valueEU?: string;        // EU equivalent for footwear
  unit: 'EU' | 'US' | 'UK' | 'CM' | 'standard';
  recordedAt: Date;
}

export interface Measurement {
  id: string;
  childId: string;
  type: 'height' | 'weight' | 'inseam' | 'chest' | 'waist' | 'head';
  valueCm: number;         // All stored in metric
  recordedAt: Date;
}

// src/types/gear.ts
export type Sport =
  // Phase 1
  | 'alpine-skiing'
  | 'nordic-skiing-classic'
  | 'nordic-skiing-skate'
  | 'snowboarding'
  // Phase 2
  | 'hockey'
  | 'mountain-biking'
  | 'lacrosse'
  // Phase 3
  | 'custom';

export type GearStatus =
  | 'active'
  | 'stored'
  | 'outgrown'
  | 'loaned'
  | 'needs-replacement'
  | 'retired';

export type GearCondition =
  | 'new'
  | 'good'
  | 'fair'
  | 'worn';

export interface GearItem {
  id: string;
  childId?: string;        // Optional - unassigned gear
  name: string;
  sport: Sport;
  category: string;        // Sport-specific category
  size: string;
  condition: GearCondition;
  status: GearStatus;
  brand?: string;
  model?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  notes?: string;
  loanedTo?: string;       // Name if status is 'loaned'
  createdAt: Date;
  updatedAt: Date;
}

export interface GearPhoto {
  id: string;
  gearId: string;
  uri: string;
  isPrimary: boolean;
  createdAt: Date;
}
```

### Database Schema (Drizzle)

```typescript
// src/database/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const children = sqliteTable('children', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }).notNull(),
  photoUri: text('photo_uri'),
  sports: text('sports', { mode: 'json' }).$type<string[]>().default([]),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const sizeHistory = sqliteTable('size_history', {
  id: text('id').primaryKey(),
  childId: text('child_id').notNull().references(() => children.id),
  category: text('category').notNull(),
  value: text('value').notNull(),
  valueEU: text('value_eu'),
  unit: text('unit').notNull(),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull(),
});

export const measurements = sqliteTable('measurements', {
  id: text('id').primaryKey(),
  childId: text('child_id').notNull().references(() => children.id),
  type: text('type').notNull(),
  valueCm: real('value_cm').notNull(),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull(),
});

export const gearItems = sqliteTable('gear_items', {
  id: text('id').primaryKey(),
  childId: text('child_id').references(() => children.id),
  name: text('name').notNull(),
  sport: text('sport').notNull(),
  category: text('category').notNull(),
  size: text('size').notNull(),
  condition: text('condition').notNull(),
  status: text('status').notNull().default('active'),
  brand: text('brand'),
  model: text('model'),
  purchaseDate: integer('purchase_date', { mode: 'timestamp' }),
  purchasePrice: real('purchase_price'),
  notes: text('notes'),
  loanedTo: text('loaned_to'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const gearPhotos = sqliteTable('gear_photos', {
  id: text('id').primaryKey(),
  gearId: text('gear_id').notNull().references(() => gearItems.id),
  uri: text('uri').notNull(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

---

## Sport Configuration

```typescript
// src/config/sports.ts
export interface SportConfig {
  id: Sport;
  name: string;
  phase: 1 | 2 | 3;
  icon: string;
  gearCategories: GearCategory[];
}

export interface GearCategory {
  id: string;
  name: string;
  sizeType: 'footwear' | 'clothing' | 'helmet' | 'equipment' | 'custom';
  required: boolean;
}

export const SPORTS: SportConfig[] = [
  // Phase 1
  {
    id: 'alpine-skiing',
    name: 'Alpine Skiing',
    phase: 1,
    icon: 'skiing',
    gearCategories: [
      { id: 'skis', name: 'Skis', sizeType: 'equipment', required: true },
      { id: 'boots', name: 'Ski Boots', sizeType: 'footwear', required: true },
      { id: 'helmet', name: 'Helmet', sizeType: 'helmet', required: true },
      { id: 'goggles', name: 'Goggles', sizeType: 'equipment', required: true },
      { id: 'poles', name: 'Poles', sizeType: 'equipment', required: false },
      { id: 'jacket', name: 'Ski Jacket', sizeType: 'clothing', required: false },
      { id: 'pants', name: 'Ski Pants', sizeType: 'clothing', required: false },
      { id: 'gloves', name: 'Gloves', sizeType: 'clothing', required: false },
    ],
  },
  {
    id: 'nordic-skiing-classic',
    name: 'Nordic Skiing (Classic)',
    phase: 1,
    icon: 'skiing-nordic',
    gearCategories: [
      { id: 'skis', name: 'Classic Skis', sizeType: 'equipment', required: true },
      { id: 'boots', name: 'Classic Boots', sizeType: 'footwear', required: true },
      { id: 'poles', name: 'Poles', sizeType: 'equipment', required: true },
      { id: 'bindings', name: 'Bindings', sizeType: 'equipment', required: true },
    ],
  },
  {
    id: 'nordic-skiing-skate',
    name: 'Nordic Skiing (Skate)',
    phase: 1,
    icon: 'skiing-nordic',
    gearCategories: [
      { id: 'skis', name: 'Skate Skis', sizeType: 'equipment', required: true },
      { id: 'boots', name: 'Skate Boots', sizeType: 'footwear', required: true },
      { id: 'poles', name: 'Poles', sizeType: 'equipment', required: true },
      { id: 'bindings', name: 'Bindings', sizeType: 'equipment', required: true },
    ],
  },
  {
    id: 'snowboarding',
    name: 'Snowboarding',
    phase: 1,
    icon: 'snowboard',
    gearCategories: [
      { id: 'board', name: 'Snowboard', sizeType: 'equipment', required: true },
      { id: 'boots', name: 'Snowboard Boots', sizeType: 'footwear', required: true },
      { id: 'bindings', name: 'Bindings', sizeType: 'equipment', required: true },
      { id: 'helmet', name: 'Helmet', sizeType: 'helmet', required: true },
      { id: 'goggles', name: 'Goggles', sizeType: 'equipment', required: true },
    ],
  },
  // Phase 2
  {
    id: 'hockey',
    name: 'Hockey',
    phase: 2,
    icon: 'hockey-puck',
    gearCategories: [
      { id: 'skates', name: 'Skates', sizeType: 'footwear', required: true },
      { id: 'helmet', name: 'Helmet', sizeType: 'helmet', required: true },
      { id: 'stick', name: 'Stick', sizeType: 'equipment', required: true },
      { id: 'gloves', name: 'Gloves', sizeType: 'equipment', required: true },
      { id: 'pads', name: 'Shin Pads', sizeType: 'equipment', required: true },
      { id: 'pants', name: 'Hockey Pants', sizeType: 'clothing', required: true },
      { id: 'shoulder-pads', name: 'Shoulder Pads', sizeType: 'equipment', required: true },
    ],
  },
  {
    id: 'mountain-biking',
    name: 'Mountain Biking',
    phase: 2,
    icon: 'bike',
    gearCategories: [
      { id: 'bike', name: 'Bike', sizeType: 'equipment', required: true },
      { id: 'helmet', name: 'Helmet', sizeType: 'helmet', required: true },
      { id: 'gloves', name: 'Gloves', sizeType: 'clothing', required: false },
      { id: 'pads', name: 'Knee/Elbow Pads', sizeType: 'equipment', required: false },
    ],
  },
  {
    id: 'lacrosse',
    name: 'Lacrosse',
    phase: 2,
    icon: 'lacrosse',
    gearCategories: [
      { id: 'stick', name: 'Stick', sizeType: 'equipment', required: true },
      { id: 'helmet', name: 'Helmet', sizeType: 'helmet', required: true },
      { id: 'gloves', name: 'Gloves', sizeType: 'equipment', required: true },
      { id: 'pads', name: 'Shoulder Pads', sizeType: 'equipment', required: true },
      { id: 'cleats', name: 'Cleats', sizeType: 'footwear', required: true },
    ],
  },
];
```

---

## Size Conversion Utilities

```typescript
// src/utils/sizeConversions.ts

// EU sizing as base (per PRD requirement)
export const FOOTWEAR_CONVERSIONS = {
  // EU to US Kids
  euToUsKids: (eu: number): string => {
    const conversions: Record<number, string> = {
      17: '2', 18: '3', 19: '4', 20: '4.5', 21: '5', 22: '6',
      23: '6.5', 24: '7.5', 25: '8', 26: '9', 27: '9.5',
      28: '10.5', 29: '11', 30: '12', 31: '12.5', 32: '13.5',
      33: '1Y', 34: '2Y', 35: '3Y', 36: '4Y', 37: '5Y', 38: '6Y',
    };
    return conversions[eu] || `EU ${eu}`;
  },

  // EU to CM (mondopoint)
  euToCm: (eu: number): number => {
    return Math.round((eu + 1.5) * 0.667 * 10) / 10;
  },
};

// Store all body measurements in metric (cm, kg)
export const convertToMetric = {
  inchesToCm: (inches: number): number => inches * 2.54,
  lbsToKg: (lbs: number): number => lbs * 0.453592,
};

export const convertFromMetric = {
  cmToInches: (cm: number): number => cm / 2.54,
  kgToLbs: (kg: number): number => kg / 0.453592,
};
```

---

## State Management

```typescript
// src/store/index.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createChildrenSlice, ChildrenSlice } from './childrenSlice';
import { createGearSlice, GearSlice } from './gearSlice';

type StoreState = ChildrenSlice & GearSlice;

export const useStore = create<StoreState>()(
  persist(
    (...args) => ({
      ...createChildrenSlice(...args),
      ...createGearSlice(...args),
    }),
    {
      name: 'gearguru-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist specific state
        selectedChildId: state.selectedChildId,
        filterSport: state.filterSport,
      }),
    }
  )
);

// src/store/childrenSlice.ts
import { StateCreator } from 'zustand';
import { Child } from '../types';

export interface ChildrenSlice {
  children: Child[];
  selectedChildId: string | null;
  isLoading: boolean;

  // Actions
  setChildren: (children: Child[]) => void;
  addChild: (child: Child) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  selectChild: (id: string | null) => void;
}

export const createChildrenSlice: StateCreator<ChildrenSlice> = (set) => ({
  children: [],
  selectedChildId: null,
  isLoading: false,

  setChildren: (children) => set({ children }),
  addChild: (child) => set((state) => ({
    children: [...state.children, child]
  })),
  updateChild: (id, updates) => set((state) => ({
    children: state.children.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    ),
  })),
  deleteChild: (id) => set((state) => ({
    children: state.children.filter((c) => c.id !== id),
    selectedChildId: state.selectedChildId === id ? null : state.selectedChildId,
  })),
  selectChild: (id) => set({ selectedChildId: id }),
});
```

---

## Navigation Structure

```typescript
// App navigation structure (Expo Router)

/*
(tabs)/
├── index.tsx              → Dashboard (Home)
├── children/
│   ├── index.tsx          → Children list
│   └── [id].tsx           → Child detail (sizes, gear by sport)
├── gear/
│   ├── index.tsx          → All gear inventory
│   └── [id].tsx           → Gear item detail
└── settings.tsx           → App settings

modals/
├── add-child.tsx          → Add new child
├── edit-child/[id].tsx    → Edit child
├── add-gear.tsx           → Add new gear
├── edit-gear/[id].tsx     → Edit gear
├── size-update/[childId].tsx → Quick size update
└── camera.tsx             → Camera for photos
*/
```

---

## Security Considerations

### Data Protection
- All local data encrypted using SQLCipher or expo-crypto
- Photos stored in app sandbox, not accessible to other apps
- No PII transmitted without user consent

### COPPA Compliance
- No collection of children's personal information for external use
- All data stored locally by default
- Cloud sync requires explicit parental consent
- No advertising or third-party tracking

### Authentication (Future)
- Biometric unlock for quick access
- PIN fallback option
- Session timeout for security

---

## MVP Implementation Phases

### Phase 1: Core MVP
1. Child profile CRUD
2. Basic size tracking (manual entry)
3. Gear inventory (Phase 1 sports only)
4. Local SQLite storage
5. Basic search/filter

### Phase 2: Enhanced Features
1. Phase 2 sports (Hockey, MTB, Lacrosse)
2. Photo capture for gear
3. Size history visualization
4. Basic notifications
5. Export functionality

### Phase 3: Advanced Features
1. Custom sport categories
2. Cloud sync (optional)
3. Family sharing
4. Growth predictions
5. VoiceOver/TalkBack accessibility

---

## Performance Targets

| Metric | Target |
|--------|--------|
| App launch (cold) | < 2s |
| App launch (warm) | < 500ms |
| Screen transitions | < 300ms |
| Database queries | < 100ms |
| Image load | < 500ms |
| Memory usage | < 150MB |

---

*Document Version: 1.0*
*Last Updated: January 2026*
