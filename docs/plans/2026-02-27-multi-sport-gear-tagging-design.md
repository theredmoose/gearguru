# Multi-Sport Gear Tagging

**Date:** 2026-02-27
**Status:** Approved

## Problem

Each `GearItem` currently carries a single `sport` field. A helmet or pair of boots can be used across multiple sports, but there is no way to tag them accordingly. The MemberDetail Gear Vault shows all gear regardless of the selected sport, and GearInventory shows only a single sport label per item.

## Requirements

- Each gear item can be assigned to one or more sports.
- Sports are tagged explicitly by the user — no automatic inference.
- MemberDetail Gear Vault filters to show only gear tagged for the currently selected sport.
- GearInventory displays a sport badge for each sport a gear item is tagged to.
- Existing gear data is migrated automatically on read (no manual data migration).

## Data Model

### Before
```ts
interface GearItem {
  sport: Sport;   // single value
  ...
}
```

### After
```ts
interface GearItem {
  sports: Sport[];  // required, min 1 element
  ...
}
```

`FirestoreGearItem` inherits the change. The old `sport` field remains in Firestore documents for existing data — it is converted transparently on read.

## Migration Strategy

In the Firebase service read path, when a document has `sport` (old) but not `sports` (new), return `sports: [sport]`. This requires no Firestore writes and is transparent to all callers.

## Component Changes

### GearForm
Replace the single `<select>` sport dropdown with a row of toggleable sport chips. Each chip toggles that sport in/out of the `sports` array. At least one must be selected (validated on submit). The alpine ski extended details section shows when `sports.includes('alpine')`.

### MemberDetail — Gear Vault
Filter `gearItems` by `item.sports.includes(selectedSport)` before rendering the vault. Empty state copy: *"No [SportLabel] gear yet. Tap + to add."*

### GearCard
Replace the single sport label with a flex row of small sport badge chips, one per entry in `sports[]`.

### SportSizing — My Gear section
Update filter from `item.sport === currentSport.id` to `item.sports.includes(currentSport.id)`.

## Files Affected

| File | Change |
|---|---|
| `src/types/index.ts` | `sport: Sport` → `sports: Sport[]` |
| `src/services/firebase.ts` | on-read migration |
| `src/components/GearForm.tsx` | sport chips multi-select |
| `src/components/MemberDetail.tsx` | Gear Vault sport filter |
| `src/components/GearCard.tsx` | sport badges array |
| `src/components/SportSizing.tsx` | gear filter update |

## Testing

- Update all test fixtures: `sport: 'alpine'` → `sports: ['alpine']`
- GearForm: verify at least one sport required, multi-select toggling works
- MemberDetail: verify vault filters correctly when sport changes
- GearCard: verify all sport badges render
- Migration: verify old `{ sport: 'alpine' }` document returns `sports: ['alpine']`
