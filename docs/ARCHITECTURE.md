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
│  │  │  Family  │ │   Gear   │ │   Auth   │ │  Notifications │ ││
│  │  │  Slice   │ │  Slice   │ │  Slice   │ │     Slice      │ ││
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │   Family    │ │    Gear     │ │   Sizing    │ │   Image    │ │
│  │  Service    │ │   Service   │ │ Calculator  │ │  Service   │ │
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
│   │   ├── family/               # Family member screens
│   │   │   ├── index.tsx         # Family members list
│   │   │   └── [id].tsx          # Member detail
│   │   ├── gear/                 # Gear screens
│   │   │   ├── index.tsx         # Gear inventory
│   │   │   └── [id].tsx          # Gear detail
│   │   └── settings.tsx          # Settings screen
│   ├── _layout.tsx               # Root layout
│   └── modals/                   # Modal screens
│       ├── add-member.tsx
│       ├── add-gear.tsx
│       └── measurement-update.tsx
│
├── src/
│   ├── components/               # Reusable components
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   ├── family/               # Family member components
│   │   │   ├── MemberCard.tsx
│   │   │   ├── SizeDisplay.tsx
│   │   │   └── GrowthChart.tsx
│   │   ├── gear/                 # Gear-related components
│   │   │   ├── GearCard.tsx
│   │   │   ├── GearList.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── forms/                # Form components
│   │       ├── MemberForm.tsx
│   │       ├── GearForm.tsx
│   │       └── MeasurementForm.tsx
│   │
│   ├── store/                    # Zustand state management
│   │   ├── index.ts              # Store configuration
│   │   ├── familySlice.ts        # Family members state
│   │   ├── gearSlice.ts          # Gear state
│   │   ├── authSlice.ts          # Auth state
│   │   └── notificationSlice.ts  # Notifications state
│   │
│   ├── services/                 # Business logic
│   │   ├── familyService.ts      # Family member CRUD operations
│   │   ├── gearService.ts        # Gear CRUD operations
│   │   ├── sizingCalculator.ts   # Size calculations/conversions
│   │   ├── imageService.ts       # Image handling
│   │   └── notificationService.ts
│   │
│   ├── database/                 # Database layer
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   ├── migrations/           # Database migrations
│   │   ├── client.ts             # Database client
│   │   └── repositories/         # Data access layer
│   │       ├── familyRepository.ts
│   │       └── gearRepository.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useFamily.ts
│   │   ├── useGear.ts
│   │   ├── useSizingCalculator.ts
│   │   └── useNotifications.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── sizeConversions.ts    # Size conversion utilities
│   │   ├── dateUtils.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── family.ts
│   │   ├── gear.ts
│   │   ├── measurement.ts
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
│  FamilyMember    │       │   Measurement    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │───┐   │ id (PK)          │
│ name             │   │   │ memberId (FK)    │──┐
│ dateOfBirth      │   │   │ type             │  │
│ sex              │   └──▶│ valueCm          │  │
│ category (A/Y/C) │       │ recordedAt       │  │
│ photoUri         │       └──────────────────┘  │
│ createdAt        │                             │
│ updatedAt        │       ┌──────────────────┐  │
└──────────────────┘       │   SkillLevel     │  │
         │                 ├──────────────────┤  │
         │ 1:N             │ id (PK)          │  │
         ▼                 │ memberId (FK)    │◀─┤
┌──────────────────┐       │ sport            │  │
│    GearItem      │       │ level            │  │
├──────────────────┤       │ updatedAt        │  │
│ id (PK)          │       └──────────────────┘  │
│ memberId (FK)    │                             │
│ name             │       ┌──────────────────┐  │
│ sport            │       │   GearPhoto      │  │
│ equipmentType    │       ├──────────────────┤  │
│ size             │       │ id (PK)          │  │
│ shellSize        │       │ gearId (FK)      │  │
│ last             │       │ uri              │  │
│ flex             │       │ isPrimary        │  │
│ sidecut          │       │ createdAt        │  │
│ radius           │       └──────────────────┘  │
│ condition        │                             │
│ status           │       ┌──────────────────┐  │
│ brand            │       │ DisplayPref      │  │
│ model            │       ├──────────────────┤  │
│ yearInUse        │       │ id (PK)          │  │
│ purchaseDate     │       │ memberId (FK)    │◀─┘
│ purchasePrice    │       │ measurementType  │
│ notes            │       │ displayUnit      │
│ createdAt        │       └──────────────────┘
│ updatedAt        │
└──────────────────┘
```

### TypeScript Types

```typescript
// src/types/family.ts
export type MemberCategory = 'A' | 'Y' | 'C';  // Adult, Youth, Child
export type Sex = 'M' | 'F';

export interface FamilyMember {
  id: string;
  name: string;
  dateOfBirth: Date;
  sex: Sex;
  category: MemberCategory;
  photoUri?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillLevel {
  id: string;
  memberId: string;
  sport: Sport;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  updatedAt: Date;
}

// src/types/measurement.ts
export type MeasurementType =
  | 'height'
  | 'weight'
  | 'foot_length'
  | 'foot_width'
  | 'hand_length'
  | 'hand_width'
  | 'waist'
  | 'inseam'
  | 'head_circumference';

export type DisplayUnit = 'metric' | 'imperial';

export interface Measurement {
  id: string;
  memberId: string;
  type: MeasurementType;
  valueCm: number;         // All stored in metric (cm for length, kg for weight)
  recordedAt: Date;
}

export interface DisplayPreference {
  id: string;
  memberId: string;
  measurementType: MeasurementType;
  displayUnit: DisplayUnit;
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

// Equipment types per sport (from PRD section 3.3)
export type NordicEquipment =
  | 'boot-classic' | 'boot-skate' | 'boot-combi'
  | 'ski-classic' | 'ski-skate' | 'ski-backcountry'
  | 'pole-classic' | 'pole-skate';

export type AlpineEquipment =
  | 'boot'
  | 'ski-park' | 'ski-cruiser' | 'ski-all-mountain' | 'ski-glade' | 'ski-carving'
  | 'poles' | 'helmet' | 'goggles';

export type SnowboardEquipment = 'boot' | 'board' | 'bindings';

export type HockeyEquipment = 'skates' | 'stick' | 'helmet' | 'pads';

// Gear status values (from PRD section 3.4)
export type GearStatus =
  | 'active'      // Currently assigned and in use
  | 'available'   // In inventory, unassigned
  | 'outgrown'    // Too small for current owner
  | 'to-sell'     // Marked for sale
  | 'sold'        // Sold/given away
  | 'needs-repair'; // Requires maintenance

export type GearCondition =
  | 'new'
  | 'good'
  | 'fair'
  | 'worn';

export interface GearItem {
  id: string;
  memberId?: string;       // Optional - unassigned gear
  name: string;
  description?: string;
  sport: Sport;
  equipmentType: string;   // Sport-specific equipment type
  size: string;
  condition: GearCondition;
  status: GearStatus;
  brand?: string;
  model?: string;
  color?: string;
  yearInUse?: number;
  purchaseDate?: Date;
  purchasePrice?: number;
  notes?: string;
  // Boot-specific fields
  shellSize?: string;
  last?: number;           // Width in mm (e.g., 98, 100, 102)
  flex?: number;           // Flex rating
  // Ski-specific fields
  sidecut?: string;
  radius?: number;         // Turn radius in meters
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

export const familyMembers = sqliteTable('family_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }).notNull(),
  sex: text('sex').notNull(),                    // 'M' | 'F'
  category: text('category').notNull(),          // 'A' | 'Y' | 'C'
  photoUri: text('photo_uri'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const skillLevels = sqliteTable('skill_levels', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull().references(() => familyMembers.id),
  sport: text('sport').notNull(),
  level: text('level').notNull(),                // beginner/intermediate/advanced/expert
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const measurements = sqliteTable('measurements', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull().references(() => familyMembers.id),
  type: text('type').notNull(),                  // height, weight, foot_length, etc.
  valueCm: real('value_cm').notNull(),           // All stored in metric
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull(),
});

export const displayPreferences = sqliteTable('display_preferences', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull().references(() => familyMembers.id),
  measurementType: text('measurement_type').notNull(),
  displayUnit: text('display_unit').notNull(),   // 'metric' | 'imperial'
});

export const gearItems = sqliteTable('gear_items', {
  id: text('id').primaryKey(),
  memberId: text('member_id').references(() => familyMembers.id),
  name: text('name').notNull(),
  description: text('description'),
  sport: text('sport').notNull(),
  equipmentType: text('equipment_type').notNull(),
  size: text('size').notNull(),
  condition: text('condition').notNull(),
  status: text('status').notNull().default('available'),
  brand: text('brand'),
  model: text('model'),
  color: text('color'),
  yearInUse: integer('year_in_use'),
  purchaseDate: integer('purchase_date', { mode: 'timestamp' }),
  purchasePrice: real('purchase_price'),
  notes: text('notes'),
  // Boot-specific fields
  shellSize: text('shell_size'),
  last: integer('last'),                         // Width in mm
  flex: integer('flex'),
  // Ski-specific fields
  sidecut: text('sidecut'),
  radius: real('radius'),                        // Turn radius in meters
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
  subtypes?: string[];  // For equipment with variants (e.g., ski types)
}

export const SPORTS: SportConfig[] = [
  // Phase 1
  {
    id: 'alpine-skiing',
    name: 'Alpine Skiing',
    phase: 1,
    icon: 'skiing',
    gearCategories: [
      {
        id: 'skis',
        name: 'Skis',
        sizeType: 'equipment',
        required: true,
        subtypes: ['park', 'cruiser', 'all-mountain', 'glade', 'carving'],
      },
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
      {
        id: 'skis',
        name: 'Classic Skis',
        sizeType: 'equipment',
        required: true,
        subtypes: ['classic', 'backcountry'],
      },
      {
        id: 'boots',
        name: 'Boots',
        sizeType: 'footwear',
        required: true,
        subtypes: ['classic', 'combi'],
      },
      { id: 'poles', name: 'Classic Poles', sizeType: 'equipment', required: true },
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
      {
        id: 'boots',
        name: 'Boots',
        sizeType: 'footwear',
        required: true,
        subtypes: ['skate', 'combi'],
      },
      { id: 'poles', name: 'Skate Poles', sizeType: 'equipment', required: true },
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

## Sizing Calculator Service

```typescript
// src/services/sizingCalculator.ts

import { SkillLevel } from '../types/family';

// ============================================
// SHOE SIZE CONVERSIONS (from PRD section 2.1)
// ============================================
export const shoeSize = {
  // Calculate from foot length in cm
  fromFootLength: (footCm: number) => ({
    eu: Math.round((footCm + 2 * 0.667) / 0.667),
    usMen: Math.round(((footCm + 2 * 0.847) / 0.847 - 24) * 2) / 2,
    usWomen: Math.round(((footCm + 2 * 0.847) / 0.847 - 23) * 2) / 2,
    usKids: Math.round((footCm * 1.08 / 0.847 - 11.5 + 0.4) * 2) / 2,
    mondopoint: Math.round(footCm * 10),  // Foot length in mm
  }),
};

// ============================================
// NORDIC SKIING SIZING (from PRD section 2.2)
// ============================================
export const nordicSizing = {
  // Classic skis: height + 10-20 cm
  classicSkiLength: (heightCm: number) => ({
    min: heightCm + 10,
    ideal: heightCm + 15,
    max: heightCm + 20,
  }),

  // Skate skis: height + 5-15 cm
  skateSkiLength: (heightCm: number) => ({
    min: heightCm + 5,
    ideal: heightCm + 10,
    max: heightCm + 15,
  }),

  // Classic poles: height × 0.83 (shoulder height)
  classicPoleLength: (heightCm: number) => Math.round(heightCm * 0.83),

  // Skate poles: height × 0.89 (chin/nose height)
  skatePoleLength: (heightCm: number) => Math.round(heightCm * 0.89),

  // Kids classic skis by weight (from PRD table)
  kidsClassicSkiByWeight: (weightKg: number): { min: number; max: number } => {
    if (weightKg < 16) return { min: 90, max: 100 };
    if (weightKg < 20) return { min: 100, max: 110 };
    if (weightKg < 25) return { min: 110, max: 120 };
    if (weightKg < 30) return { min: 120, max: 130 };
    if (weightKg < 35) return { min: 130, max: 140 };
    if (weightKg < 40) return { min: 140, max: 150 };
    if (weightKg < 45) return { min: 150, max: 160 };
    return { min: 160, max: 180 };
  },
};

// ============================================
// ALPINE SKIING SIZING (from PRD section 2.3)
// ============================================
export const alpineSizing = {
  // Ski length based on height and skill level
  skiLength: (heightCm: number, level: SkillLevel['level']) => {
    const ranges: Record<typeof level, { min: number; max: number }> = {
      beginner: { min: heightCm - 20, max: heightCm - 15 },
      intermediate: { min: heightCm - 15, max: heightCm - 10 },
      advanced: { min: heightCm - 10, max: heightCm - 5 },
      expert: { min: heightCm - 5, max: heightCm },
    };
    return ranges[level];
  },

  // Boot sizing (Mondopoint = foot length cm × 10)
  bootSize: (footLengthCm: number) => ({
    mondopoint: Math.round(footLengthCm * 10),
    shellSize: Math.round(footLengthCm * 10),  // Same as mondopoint
  }),

  // Boot width categories (last in mm)
  bootWidth: (footWidthCm: number): 'narrow' | 'medium' | 'wide' => {
    const widthMm = footWidthCm * 10;
    if (widthMm < 99) return 'narrow';   // ~98mm last
    if (widthMm < 101) return 'medium';  // ~100mm last
    return 'wide';                        // ~102mm+ last
  },

  // Boot flex recommendation by skill and sex
  bootFlex: (level: SkillLevel['level'], sex: 'M' | 'F') => {
    const flexRanges = {
      M: { beginner: [60, 80], intermediate: [80, 100], advanced: [100, 120], expert: [120, 140] },
      F: { beginner: [50, 70], intermediate: [70, 90], advanced: [90, 110], expert: [110, 130] },
    };
    const [min, max] = flexRanges[sex][level];
    return { min, max };
  },
};

// ============================================
// SNOWBOARD SIZING (from PRD section 2.4)
// ============================================
export const snowboardSizing = {
  // Board length based on height and skill level
  boardLength: (heightCm: number, level: SkillLevel['level']) => {
    // Beginner: chin height, Intermediate: nose, Advanced: forehead+
    const multipliers: Record<typeof level, { min: number; max: number }> = {
      beginner: { min: 0.80, max: 0.85 },      // Chin height
      intermediate: { min: 0.85, max: 0.90 },  // Nose height
      advanced: { min: 0.90, max: 0.95 },      // Forehead
      expert: { min: 0.95, max: 1.00 },        // Above head
    };
    const range = multipliers[level];
    return {
      min: Math.round(heightCm * range.min),
      max: Math.round(heightCm * range.max),
    };
  },
};

// ============================================
// HOCKEY SIZING (from PRD section 2.5)
// ============================================
export const hockeySizing = {
  // Skate size: US shoe size - 1 to 1.5
  skateSize: (usShoeSize: number) => ({
    min: usShoeSize - 1.5,
    max: usShoeSize - 1,
  }),
};

// ============================================
// UNIT CONVERSIONS
// ============================================
export const convertToMetric = {
  inchesToCm: (inches: number): number => inches * 2.54,
  feetInchesToCm: (feet: number, inches: number): number => (feet * 12 + inches) * 2.54,
  lbsToKg: (lbs: number): number => lbs * 0.453592,
};

export const convertFromMetric = {
  cmToInches: (cm: number): number => cm / 2.54,
  cmToFeetInches: (cm: number): { feet: number; inches: number } => {
    const totalInches = cm / 2.54;
    return { feet: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
  },
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
import { createFamilySlice, FamilySlice } from './familySlice';
import { createGearSlice, GearSlice } from './gearSlice';

type StoreState = FamilySlice & GearSlice;

export const useStore = create<StoreState>()(
  persist(
    (...args) => ({
      ...createFamilySlice(...args),
      ...createGearSlice(...args),
    }),
    {
      name: 'gearguru-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist specific state
        selectedMemberId: state.selectedMemberId,
        filterSport: state.filterSport,
      }),
    }
  )
);

// src/store/familySlice.ts
import { StateCreator } from 'zustand';
import { FamilyMember } from '../types';

export interface FamilySlice {
  members: FamilyMember[];
  selectedMemberId: string | null;
  isLoading: boolean;

  // Actions
  setMembers: (members: FamilyMember[]) => void;
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  selectMember: (id: string | null) => void;
}

export const createFamilySlice: StateCreator<FamilySlice> = (set) => ({
  members: [],
  selectedMemberId: null,
  isLoading: false,

  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({
    members: [...state.members, member]
  })),
  updateMember: (id, updates) => set((state) => ({
    members: state.members.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
    ),
  })),
  deleteMember: (id) => set((state) => ({
    members: state.members.filter((m) => m.id !== id),
    selectedMemberId: state.selectedMemberId === id ? null : state.selectedMemberId,
  })),
  selectMember: (id) => set({ selectedMemberId: id }),
});
```

---

## Navigation Structure

```typescript
// App navigation structure (Expo Router)

/*
(tabs)/
├── index.tsx              → Dashboard (Home)
├── family/
│   ├── index.tsx          → Family members list
│   └── [id].tsx           → Member detail (measurements, gear by sport)
├── gear/
│   ├── index.tsx          → All gear inventory
│   └── [id].tsx           → Gear item detail
├── calculator.tsx         → Sizing calculators
└── settings.tsx           → App settings

modals/
├── add-member.tsx         → Add new family member
├── edit-member/[id].tsx   → Edit family member
├── add-gear.tsx           → Add new gear
├── edit-gear/[id].tsx     → Edit gear
├── measurement-update/[memberId].tsx → Quick measurement update
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
1. Family member profile CRUD (with category A/Y/C, sex)
2. Body measurement tracking (all 9 measurement types)
3. Skill level tracking per sport
4. Sizing calculators (shoe, nordic, alpine)
5. Gear inventory (Phase 1 sports only)
6. Local SQLite storage
7. Basic search/filter

### Phase 2: Enhanced Features
1. Phase 2 sports (Hockey, MTB, Lacrosse)
2. Photo capture for gear
3. Measurement history visualization
4. Display unit preferences per measurement
5. Basic notifications
6. Export functionality

### Phase 3: Advanced Features
1. Custom sport categories
2. Cloud sync (optional)
3. Multi-user family sharing
4. Growth predictions
5. VoiceOver/TalkBack accessibility
6. Barcode/QR code scanning

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

*Document Version: 1.1*
*Last Updated: January 2026*

## Changelog

### v1.1 (January 2026)
- Renamed "Child" to "FamilyMember" with category (A/Y/C) and sex fields
- Added all 9 measurement types from PRD (including inseam, foot width, hand dimensions)
- Added SkillLevel entity for per-sport skill tracking
- Added DisplayPreference entity for user measurement unit preferences
- Added boot-specific fields (shellSize, last, flex) to GearItem
- Added ski-specific fields (sidecut, radius) to GearItem
- Aligned GearStatus values with PRD (active, available, outgrown, to-sell, sold, needs-repair)
- Added comprehensive Sizing Calculator Service with all formulas from PRD
- Added equipment subtypes (alpine ski types, nordic combi boots, backcountry skis)
- Updated all references from "child" to "family member" terminology
- Added calculator screen to navigation structure
