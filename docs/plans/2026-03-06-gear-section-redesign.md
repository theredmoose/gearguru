# Gear Section Redesign — Design Doc
_2026-03-06_

## Overview

Replace the separate Sizing Guide and Gear Vault sections in `MemberDetail` with a single unified split-column section. Each gear type becomes a row with recommended sizing on the left and assigned gear items on the right.

## Layout

Two-column split within each gear type row:
- **Left (30%)**: gear type icon + label + calculated sizing recommendation (respects `sizingDisplay: range | single` setting). Shows `—` for types with no calculator (jacket, pants, etc.).
- **Right (70%)**: stacked gear cards assigned to that type. Each card shows brand + model + size + tags. Tap card to edit. `+` at bottom of column to add gear.

A **"+ Add Section"** button at the bottom of the list opens a sport-specific menu of optional gear types not yet enabled.

## Data Model Changes

### `GearItem` — add `tags` field
```ts
tags?: string[];  // e.g. ['carving'], ['powder'], ['waterproof']
```
Applies to all gear types. Tags render as small chips on the gear section card.

### `GearType` — extend enum (additive, no migration)
New values: `jacket | pants | gloves | mittens | socks | goggle | bag`

Ski subtypes (carving, powder, all-mountain) are **tags**, not separate GearTypes.

### `AppSettings` — add `sportSections`
```ts
sportSections?: Partial<Record<Sport, GearType[]>>;
```
Stores which sections are enabled per sport. Falls back to `DEFAULT_SPORT_SECTIONS` constants when undefined. Persisted in localStorage via `useSettings`.

### Default sections per sport
```ts
const DEFAULT_SPORT_SECTIONS: Record<Sport, GearType[]> = {
  alpine:         ['ski', 'boot', 'pole', 'helmet'],
  'nordic-classic': ['ski', 'boot', 'pole', 'helmet'],
  'nordic-skate': ['ski', 'boot', 'pole', 'helmet'],
  'nordic-combi': ['ski', 'boot', 'pole', 'helmet'],
  snowboard:      ['snowboard', 'boot', 'helmet'],
  hockey:         ['skate', 'helmet'],
};
```

### Optional section catalogue per sport
```ts
const OPTIONAL_SPORT_SECTIONS: Record<Sport, GearType[]> = {
  alpine:         ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'goggle', 'bag'],
  'nordic-classic': ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'bag'],
  'nordic-skate': ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'bag'],
  'nordic-combi': ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'bag'],
  snowboard:      ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'goggle', 'bag'],
  hockey:         ['gloves', 'bag'],
};
```

## Components

### `GearSectionList`
Container. Renders `GearSectionRow` for each enabled gear type. "Add Section" button at bottom opens optional type menu. Manages enabled sections from `AppSettings.sportSections`.

### `GearSectionRow`
One row card. Props: `gearType`, `sizingItems`, `assignedGear`, `onAdd`, `onEditGear`.
- Left col: `GearTypeIcon` + label + sizing values
- Right col: list of `GearSectionItem` + `+` button

### `GearSectionItem`
Compact gear card. Shows brand + model + size + `tags` chips. Tap to edit (calls `onEditGear`). No edit/delete icons.

### `GearAssignSheet`
Bottom sheet opened by `+`. Two actions:
- **New** — calls `onAddGear(sport)` (existing flow)
- **Assign Existing** — lists inventory items of matching `GearType`, tap to link

## What Does Not Change

- `getSizingCards()` in `MemberDetail.tsx` — unchanged
- `GearCard` in the Gear tab (`GearInventory`) — unchanged
- `GearForm` — adds a `tags` input field (chips/autocomplete)
- `SettingsScreen` — no new UI; section management is inline

## Sport Navigation — Full-Page Swipe

The Sport `<select>` dropdown is replaced by a `SportSwiper` component with swipe gesture navigation:
- User swipes left/right anywhere on the page to move between sports
- Swipe threshold: 60px horizontal delta triggers sport change
- Current sport name is shown centred above dot indicators
- Dot indicators (not tappable) show position; active dot is wider and green
- The GearLoadoutPanel SVG silhouette and GearSectionList update reactively on sport change
- Skill Level remains as a separate `<select>` beneath the sport name
- No pill buttons — swipe is the only gesture

## Settings Interaction

- `sizingDisplay: 'range' | 'single'` controls left column display
- `sportSections` updated when user adds/removes optional sections
