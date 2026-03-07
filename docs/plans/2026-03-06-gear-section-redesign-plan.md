# Gear Section Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the separate Sizing Guide and Gear Vault sections in `MemberDetail` with a single unified split-column section organized by gear type, where each row shows recommended sizing on the left and assigned gear items on the right.

**Architecture:** Each gear type (Ski, Boot, Pole, Helmet, etc.) becomes a row card with a 30/70 split: left shows calculated sizing from existing `getSizingCards()`, right shows gear items of that type assigned to the member. A "Add Section" button lets users add optional gear types (Jacket, Pants, etc.) from a per-sport catalogue stored in `AppSettings.sportSections`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Vitest + React Testing Library, localStorage via `useSettings`

**Design doc:** `docs/plans/2026-03-06-gear-section-redesign.md`

---

## Task 1: Create Worktree

**Step 1: Create the branch and worktree**
```bash
git worktree add .worktrees/feature/gear-section-redesign -b feature/gear-section-redesign
cp .env.local .worktrees/feature/gear-section-redesign/.env.local
```

**Step 2: Verify**
```bash
git worktree list
```
Expected: main worktree + new `feature/gear-section-redesign` entry.

**Step 3: All subsequent work happens inside the worktree**
```bash
cd .worktrees/feature/gear-section-redesign
```

---

## Task 2: Extend Types

**Files:**
- Modify: `src/types/index.ts`

**Context:** Three changes: (1) extend `GearType` union with new apparel types, (2) add `tags?: string[]` to `GearItem`, (3) add `sportSections` to `AppSettings`.

**Step 1: Update `GearType` union** — find the existing union at line ~275 and replace:
```ts
export type GearType =
  | 'ski'
  | 'pole'
  | 'boot'
  | 'binding'
  | 'snowboard'
  | 'skate'
  | 'helmet'
  | 'other'
  // Apparel & accessories
  | 'jacket'
  | 'pants'
  | 'gloves'
  | 'mittens'
  | 'socks'
  | 'goggle'
  | 'bag';
```

**Step 2: Add `tags` to `GearItem`** — add after the `notes` field (~line 268):
```ts
tags?: string[];          // e.g. ['carving'], ['powder', 'race']
```

**Step 3: Add `sportSections` to `AppSettings`** — add after `bootUnit` field:
```ts
sportSections?: Partial<Record<Sport, GearType[]>>;
```

**Step 4: Run tests to confirm no breakage from type change**
```bash
npm run test:run
```
Expected: all 790 tests pass (type changes are additive).

**Step 5: Commit**
```bash
git add src/types/index.ts
git commit -m "Add: extend GearType with apparel types, add tags to GearItem, add sportSections to AppSettings"
```

---

## Task 3: Update Constants and Labels

**Files:**
- Modify: `src/constants/labels.ts`
- Create: `src/constants/sportSections.ts`

**Step 1: Update `GEAR_TYPE_LABELS`** in `src/constants/labels.ts` — add entries for new types:
```ts
export const GEAR_TYPE_LABELS: Record<GearType, string> = {
  ski:       'Skis',
  pole:      'Poles',
  boot:      'Boots',
  binding:   'Bindings',
  snowboard: 'Snowboard',
  skate:     'Skates',
  helmet:    'Helmet',
  other:     'Other',
  // Apparel
  jacket:   'Jacket',
  pants:    'Pants',
  gloves:   'Gloves',
  mittens:  'Mittens',
  socks:    'Socks',
  goggle:   'Goggles',
  bag:      'Bag',
};
```

**Step 2: Create `src/constants/sportSections.ts`**
```ts
import type { Sport, GearType } from '../types';

/** Sections shown by default when a user first views a sport. */
export const DEFAULT_SPORT_SECTIONS: Record<Sport, GearType[]> = {
  alpine:           ['ski', 'boot', 'pole', 'helmet'],
  'nordic-classic': ['ski', 'boot', 'pole', 'helmet'],
  'nordic-skate':   ['ski', 'boot', 'pole', 'helmet'],
  'nordic-combi':   ['ski', 'boot', 'pole', 'helmet'],
  snowboard:        ['snowboard', 'boot', 'helmet'],
  hockey:           ['skate', 'helmet'],
};

/** Additional sections the user can add per sport. */
export const OPTIONAL_SPORT_SECTIONS: Record<Sport, GearType[]> = {
  alpine:           ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'goggle', 'bag'],
  'nordic-classic': ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'bag'],
  'nordic-skate':   ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'bag'],
  'nordic-combi':   ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'bag'],
  snowboard:        ['jacket', 'pants', 'gloves', 'mittens', 'socks', 'goggle', 'bag'],
  hockey:           ['gloves', 'bag'],
};
```

**Step 3: Run tests**
```bash
npm run test:run
```
Expected: all pass.

**Step 4: Commit**
```bash
git add src/constants/labels.ts src/constants/sportSections.ts
git commit -m "Add: sport section constants and labels for new gear types"
```

---

## Task 4: Update GearIcons

**Files:**
- Modify: `src/components/GearIcons.tsx`

**Context:** The `GearTypeIcon` switch has a `default` fallback that already renders a helmet for unknown types. New apparel types need a distinct fallback so they don't all look like helmets. Add a generic "box" icon for apparel types.

**Step 1: Add a `GenericGearIcon` component** above `GearTypeIcon`:
```tsx
export function GenericGearIcon({ className = 'w-10 h-10' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className}>
      <rect x="10" y="18" width="44" height="36" rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
      <path d="M22 18 C22 10 42 10 42 18" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <line x1="10" y1="30" x2="54" y2="30" stroke="#cbd5e1" strokeWidth="1.5" />
    </svg>
  );
}
```

**Step 2: Update the `GearTypeIcon` switch** — add cases before `default`:
```tsx
case 'jacket':
case 'pants':
case 'gloves':
case 'mittens':
case 'socks':
case 'goggle':
case 'bag':
  return <GenericGearIcon className={className} />;
```

**Step 3: Run tests**
```bash
npm run test:run
```
Expected: all pass.

**Step 4: Commit**
```bash
git add src/components/GearIcons.tsx
git commit -m "Add: generic gear icon for apparel types in GearTypeIcon"
```

---

## Task 5: Update GearForm — New Types + Tags Input

**Files:**
- Modify: `src/components/GearForm.tsx`
- Modify: `src/components/__tests__/GearForm.test.tsx`

**Context:** `GearForm` has a `GEAR_TYPES` array driving the type select. Add new types. Also add a `tags` text input (comma-separated) that maps to `GearItem.tags`.

**Step 1: Write failing tests** in `src/components/__tests__/GearForm.test.tsx`. Find the existing describe block and add:
```ts
it('renders tags input field', () => {
  render(<GearForm ownerId="u1" onSubmit={vi.fn()} onCancel={vi.fn()} />);
  expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
});

it('submits tags as array from comma-separated input', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<GearForm ownerId="u1" onSubmit={onSubmit} onCancel={vi.fn()} />);
  await userEvent.type(screen.getByLabelText(/tags/i), 'carving, powder');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['carving', 'powder'] })
    );
  });
});

it('omits tags field when input is empty', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<GearForm ownerId="u1" onSubmit={onSubmit} onCancel={vi.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  await waitFor(() => {
    const call = onSubmit.mock.calls[0][0];
    expect(call.tags).toBeUndefined();
  });
});
```

**Step 2: Run to confirm fail**
```bash
npm run test:run -- GearForm
```
Expected: FAIL on tags tests.

**Step 3: Update `GEAR_TYPES` array** in `src/components/GearForm.tsx` — add new entries after `helmet`:
```ts
{ id: 'jacket',  label: 'Jacket' },
{ id: 'pants',   label: 'Pants' },
{ id: 'gloves',  label: 'Gloves' },
{ id: 'mittens', label: 'Mittens' },
{ id: 'socks',   label: 'Socks' },
{ id: 'goggle',  label: 'Goggles' },
{ id: 'bag',     label: 'Bag' },
```

**Step 4: Add `tags` state** — in the `GearForm` function, add alongside other state:
```ts
const [tags, setTags] = useState<string>(item?.tags?.join(', ') ?? '');
```

**Step 5: Parse and include tags in submit handler** — find the `handleSubmit` / `onSubmit` call and add:
```ts
const parsedTags = tags.trim()
  ? tags.split(',').map(t => t.trim()).filter(Boolean)
  : undefined;
// include in the submitted data object:
tags: parsedTags,
```

**Step 6: Add tags input field** in the JSX — add a new field group after the Notes field:
```tsx
<div>
  <label htmlFor="gear-tags" className={labelCls}>Tags (comma-separated)</label>
  <input
    id="gear-tags"
    type="text"
    value={tags}
    onChange={e => setTags(e.target.value)}
    placeholder="e.g. carving, powder, race"
    className={inputCls}
  />
</div>
```

**Step 7: Run tests**
```bash
npm run test:run -- GearForm
```
Expected: all GearForm tests pass.

**Step 8: Commit**
```bash
git add src/components/GearForm.tsx src/components/__tests__/GearForm.test.tsx
git commit -m "Add: new gear types and tags input to GearForm"
```

---

## Task 6: Create GearSectionItem Component

**Files:**
- Create: `src/components/GearSectionItem.tsx`
- Create: `src/components/__tests__/GearSectionItem.test.tsx`

**Context:** Compact read-only card for a single gear item inside a section row. Shows brand + model + size + tags. Tap to edit (no edit icon).

**Step 1: Write failing tests** in `src/components/__tests__/GearSectionItem.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearSectionItem } from '../GearSectionItem';
import type { GearItem } from '../../types';

function makeItem(overrides: Partial<GearItem> = {}): GearItem {
  return {
    id: 'g1', userId: 'u1', ownerId: 'm1',
    sports: ['alpine'], type: 'ski',
    brand: 'Blizzard', model: 'Brahma', size: '170 cm',
    condition: 'good', createdAt: '', updatedAt: '',
    ...overrides,
  };
}

describe('GearSectionItem', () => {
  it('renders brand, model, and size', () => {
    render(<GearSectionItem item={makeItem()} onEdit={vi.fn()} />);
    expect(screen.getByText('Blizzard Brahma')).toBeInTheDocument();
    expect(screen.getByText('170')).toBeInTheDocument();
  });

  it('calls onEdit when tapped', () => {
    const onEdit = vi.fn();
    render(<GearSectionItem item={makeItem()} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onEdit).toHaveBeenCalledWith(makeItem());
  });

  it('renders tags as chips', () => {
    render(<GearSectionItem item={makeItem({ tags: ['carving', 'race'] })} onEdit={vi.fn()} />);
    expect(screen.getByText('carving')).toBeInTheDocument();
    expect(screen.getByText('race')).toBeInTheDocument();
  });

  it('renders nothing for tags when tags is empty', () => {
    const { container } = render(<GearSectionItem item={makeItem({ tags: [] })} onEdit={vi.fn()} />);
    expect(container.querySelectorAll('.tag-chip')).toHaveLength(0);
  });
});
```

**Step 2: Run to confirm fail**
```bash
npm run test:run -- GearSectionItem
```
Expected: FAIL (module not found).

**Step 3: Create `src/components/GearSectionItem.tsx`**
```tsx
import type { GearItem } from '../types';
import { RADIUS_INNER } from '../constants/design';

interface Props {
  item: GearItem;
  onEdit: (item: GearItem) => void;
}

/** Split "170 cm" → { num: "170", unit: "cm" } for styled display. */
function splitSize(size: string): { num: string; unit: string } | null {
  const m = size.match(/^([\d.,–/]+)\s+([A-Za-z"'%]+)$/);
  return m ? { num: m[1], unit: m[2] } : null;
}

export function GearSectionItem({ item, onEdit }: Props) {
  const parts = splitSize(item.size);

  return (
    <button
      onClick={() => onEdit(item)}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#F8FAFC] ${RADIUS_INNER} hover:bg-emerald-50 active:scale-[0.98] transition-all text-left`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-slate-800 leading-tight truncate">
          {item.brand} {item.model}
        </p>
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {item.tags.map(tag => (
              <span key={tag} className="tag-chip text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-[2px] flex-shrink-0">
        <span className="text-xs font-black text-slate-700">
          {parts ? parts.num : item.size}
        </span>
        {parts && (
          <span className="text-[10px] font-bold text-slate-400">{parts.unit}</span>
        )}
      </div>
    </button>
  );
}
```

**Step 4: Run tests**
```bash
npm run test:run -- GearSectionItem
```
Expected: all pass.

**Step 5: Commit**
```bash
git add src/components/GearSectionItem.tsx src/components/__tests__/GearSectionItem.test.tsx
git commit -m "Add: GearSectionItem compact card component"
```

---

## Task 7: Create GearAssignSheet Component

**Files:**
- Create: `src/components/GearAssignSheet.tsx`
- Create: `src/components/__tests__/GearAssignSheet.test.tsx`

**Context:** Bottom sheet opened by "+" in a section row. Shows "New" button + list of existing gear items of the matching type belonging to the member. Tapping existing gear calls `onEditGear` (to update sport association via GearForm). Tapping "New" calls `onAddGear`.

**Step 1: Write failing tests**
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearAssignSheet } from '../GearAssignSheet';
import type { GearItem, GearType } from '../../types';

function makeItem(id: string, type: GearType = 'ski'): GearItem {
  return {
    id, userId: 'u1', ownerId: 'm1',
    sports: ['alpine'], type,
    brand: 'Brand', model: `Model ${id}`, size: '170 cm',
    condition: 'good', createdAt: '', updatedAt: '',
  };
}

describe('GearAssignSheet', () => {
  const props = {
    gearType: 'ski' as GearType,
    memberGear: [makeItem('a', 'ski'), makeItem('b', 'boot')],
    onAddGear: vi.fn(),
    onEditGear: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders "New" button', () => {
    render(<GearAssignSheet {...props} />);
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
  });

  it('shows only gear items matching the gearType', () => {
    render(<GearAssignSheet {...props} />);
    expect(screen.getByText('Brand Model a')).toBeInTheDocument();
    expect(screen.queryByText('Brand Model b')).not.toBeInTheDocument();
  });

  it('calls onAddGear when New is tapped', () => {
    render(<GearAssignSheet {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /new/i }));
    expect(props.onAddGear).toHaveBeenCalled();
  });

  it('calls onEditGear when existing item is tapped', () => {
    render(<GearAssignSheet {...props} />);
    fireEvent.click(screen.getByText('Brand Model a'));
    expect(props.onEditGear).toHaveBeenCalledWith(makeItem('a', 'ski'));
  });

  it('shows empty state when no matching gear', () => {
    render(<GearAssignSheet {...props} memberGear={[]} />);
    expect(screen.getByText(/no existing/i)).toBeInTheDocument();
  });

  it('calls onClose when backdrop is tapped', () => {
    render(<GearAssignSheet {...props} />);
    fireEvent.click(screen.getByTestId('sheet-backdrop'));
    expect(props.onClose).toHaveBeenCalled();
  });
});
```

**Step 2: Run to confirm fail**
```bash
npm run test:run -- GearAssignSheet
```

**Step 3: Create `src/components/GearAssignSheet.tsx`**
```tsx
import { Plus } from 'lucide-react';
import type { GearItem, GearType } from '../types';
import { GEAR_TYPE_LABELS } from '../constants/labels';
import { RADIUS_CARD_LG, RADIUS_INNER } from '../constants/design';

interface Props {
  gearType: GearType;
  memberGear: GearItem[];
  onAddGear: () => void;
  onEditGear: (item: GearItem) => void;
  onClose: () => void;
}

export function GearAssignSheet({ gearType, memberGear, onAddGear, onEditGear, onClose }: Props) {
  const matching = memberGear.filter(g => g.type === gearType);
  const label = GEAR_TYPE_LABELS[gearType] ?? gearType;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        data-testid="sheet-backdrop"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className={`relative w-full bg-white ${RADIUS_CARD_LG} rounded-b-none px-6 pt-5 pb-8 shadow-2xl`}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <p className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4">
          Add to {label}
        </p>

        {/* New button */}
        <button
          onClick={onAddGear}
          className={`w-full flex items-center gap-3 px-4 py-3 mb-4 bg-[#008751] text-white font-black text-sm ${RADIUS_INNER} active:scale-[0.98] transition-all`}
          aria-label="New gear"
        >
          <Plus className="w-4 h-4" />
          New {label}
        </button>

        {/* Existing gear */}
        {matching.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold text-center py-3">
            No existing {label.toLowerCase()} in inventory
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 tracking-widest uppercase mb-2">
              Assign Existing
            </p>
            {matching.map(item => (
              <button
                key={item.id}
                onClick={() => onEditGear(item)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] ${RADIUS_INNER} hover:bg-emerald-50 transition-colors text-left`}
              >
                <span className="text-sm font-black text-slate-800">
                  {item.brand} {item.model}
                </span>
                <span className="text-xs font-bold text-slate-400">{item.size}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Run tests**
```bash
npm run test:run -- GearAssignSheet
```
Expected: all pass.

**Step 5: Commit**
```bash
git add src/components/GearAssignSheet.tsx src/components/__tests__/GearAssignSheet.test.tsx
git commit -m "Add: GearAssignSheet bottom sheet for adding/assigning gear to a section"
```

---

## Task 8: Create GearSectionRow Component

**Files:**
- Create: `src/components/GearSectionRow.tsx`
- Create: `src/components/__tests__/GearSectionRow.test.tsx`

**Context:** One row card per gear type. Left col (30%): icon + label + sizing items. Right col (70%): stacked `GearSectionItem`s + "+" button that opens `GearAssignSheet`.

The `sizingItems` prop is `{ label: string; value: string }[] | null` — null for types with no calculator (apparel).

**Step 1: Write failing tests**
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearSectionRow } from '../GearSectionRow';
import type { GearItem } from '../../types';

function makeSki(id: string): GearItem {
  return {
    id, userId: 'u1', ownerId: 'm1',
    sports: ['alpine'], type: 'ski',
    brand: 'Blizzard', model: 'Brahma', size: '170 cm',
    condition: 'good', createdAt: '', updatedAt: '',
  };
}

const baseProps = {
  gearType: 'ski' as const,
  assignedGear: [],
  memberGear: [],
  sizingItems: [{ label: 'Length', value: '170 cm' }],
  onAddGear: vi.fn(),
  onEditGear: vi.fn(),
};

describe('GearSectionRow', () => {
  it('renders the gear type label', () => {
    render(<GearSectionRow {...baseProps} />);
    expect(screen.getByText('Skis')).toBeInTheDocument();
  });

  it('renders sizing value in left column', () => {
    render(<GearSectionRow {...baseProps} />);
    expect(screen.getByText('170')).toBeInTheDocument();
  });

  it('shows dash in sizing col when sizingItems is null', () => {
    render(<GearSectionRow {...baseProps} sizingItems={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders assigned gear items', () => {
    render(<GearSectionRow {...baseProps} assignedGear={[makeSki('g1')]} />);
    expect(screen.getByText('Blizzard Brahma')).toBeInTheDocument();
  });

  it('opens assign sheet when + is tapped', () => {
    render(<GearSectionRow {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/add gear to skis/i));
    expect(screen.getByTestId('sheet-backdrop')).toBeInTheDocument();
  });

  it('closes assign sheet when backdrop is tapped', () => {
    render(<GearSectionRow {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/add gear to skis/i));
    fireEvent.click(screen.getByTestId('sheet-backdrop'));
    expect(screen.queryByTestId('sheet-backdrop')).not.toBeInTheDocument();
  });
});
```

**Step 2: Run to confirm fail**
```bash
npm run test:run -- GearSectionRow
```

**Step 3: Create `src/components/GearSectionRow.tsx`**
```tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { GearItem, GearType } from '../types';
import { GEAR_TYPE_LABELS } from '../constants/labels';
import { GearTypeIcon } from './GearIcons';
import { GearSectionItem } from './GearSectionItem';
import { GearAssignSheet } from './GearAssignSheet';
import { SURFACE_FLOAT, RADIUS_CARD } from '../constants/design';

interface SizingRow {
  label: string;
  value: string;
}

interface Props {
  gearType: GearType;
  assignedGear: GearItem[];   // items of this type for selected sport
  memberGear: GearItem[];     // all member gear (for assign sheet picker)
  sizingItems: SizingRow[] | null;
  onAddGear: () => void;
  onEditGear: (item: GearItem) => void;
}

/** Split "170 cm" into num + unit for styled display. */
function splitVal(val: string): { num: string; unit: string } | null {
  const m = val.match(/^([\d.,–/]+)\s+([A-Za-z"'%]+)$/);
  return m ? { num: m[1], unit: m[2] } : null;
}

export function GearSectionRow({
  gearType,
  assignedGear,
  memberGear,
  sizingItems,
  onAddGear,
  onEditGear,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const label = GEAR_TYPE_LABELS[gearType] ?? gearType;

  const handleAddGear = () => {
    setSheetOpen(false);
    onAddGear();
  };

  const handleEditGear = (item: GearItem) => {
    setSheetOpen(false);
    onEditGear(item);
  };

  return (
    <>
      <div className={`${SURFACE_FLOAT} ${RADIUS_CARD} overflow-hidden`}>
        <div className="flex min-h-[72px]">
          {/* Left: sizing col (30%) */}
          <div className="w-[30%] flex-shrink-0 border-r border-slate-50 px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="flex-shrink-0">
                <GearTypeIcon type={gearType} className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">
                {label}
              </span>
            </div>
            {sizingItems ? (
              sizingItems.map((row, i) => {
                const parts = splitVal(row.value);
                return (
                  <div key={i} className="flex items-baseline gap-[2px]">
                    <span className="text-xs font-black text-slate-800">
                      {parts ? parts.num : row.value}
                    </span>
                    {parts && (
                      <span className="text-[10px] font-bold text-slate-400">{parts.unit}</span>
                    )}
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-slate-300 font-bold">—</span>
            )}
          </div>

          {/* Right: gear items col (70%) */}
          <div className="flex-1 px-3 py-3 flex flex-col gap-1.5">
            {assignedGear.map(item => (
              <GearSectionItem key={item.id} item={item} onEdit={onEditGear} />
            ))}
            <button
              onClick={() => setSheetOpen(true)}
              aria-label={`Add gear to ${label}`}
              className="flex items-center gap-1 text-[10px] font-black text-slate-300 hover:text-emerald-500 transition-colors mt-0.5 self-start"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>
      </div>

      {sheetOpen && (
        <GearAssignSheet
          gearType={gearType}
          memberGear={memberGear}
          onAddGear={handleAddGear}
          onEditGear={handleEditGear}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
```

**Step 4: Run tests**
```bash
npm run test:run -- GearSectionRow
```
Expected: all pass.

**Step 5: Commit**
```bash
git add src/components/GearSectionRow.tsx src/components/__tests__/GearSectionRow.test.tsx
git commit -m "Add: GearSectionRow split-column component with sizing + gear assignment"
```

---

## Task 9: Create GearSectionList Component

**Files:**
- Create: `src/components/GearSectionList.tsx`
- Create: `src/components/__tests__/GearSectionList.test.tsx`

**Context:** The top-level container rendered in `MemberDetail`. Manages enabled sections from `AppSettings.sportSections`, shows "Add Section" menu for optional types.

Props received from MemberDetail: `member`, `gearItems`, `selectedSport`, `sizingCards` (already computed by MemberDetail), `settings`, `onUpdateSettings`, `onAddGear`, `onEditGear`.

The `sizingCards` type is the existing `SizingCard[]` interface from `MemberDetail.tsx`. To avoid duplication, extract the `SizingCard` interface from `MemberDetail.tsx` to a new file `src/types/sizing.ts` in Task 9 step 1.

**Step 1: Extract `SizingCard` interface** — move from `MemberDetail.tsx` to `src/types/sizing.ts`:
```ts
export interface SizingCard {
  label: string;
  type: 'ski' | 'boot' | 'pole' | 'helmet' | 'snowboard' | 'skate';
  toggleKind?: 'length' | 'boot';
  items: { label: string; value: string }[];
}
```
Then update `MemberDetail.tsx` to import from `'../types/sizing'`.

**Step 2: Write failing tests** in `src/components/__tests__/GearSectionList.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearSectionList } from '../GearSectionList';
import { FAMILY_MEMBERS } from '@tests/fixtures/familyMembers';
import type { AppSettings } from '../../types';
import { DEFAULT_SETTINGS } from '../../types';

const props = {
  member: FAMILY_MEMBERS.john,
  gearItems: [],
  selectedSport: 'alpine' as const,
  sizingCards: [],
  settings: DEFAULT_SETTINGS,
  onUpdateSettings: vi.fn(),
  onAddGear: vi.fn(),
  onEditGear: vi.fn(),
};

describe('GearSectionList', () => {
  it('renders default sections for alpine sport', () => {
    render(<GearSectionList {...props} />);
    expect(screen.getByText('Skis')).toBeInTheDocument();
    expect(screen.getByText('Boots')).toBeInTheDocument();
    expect(screen.getByText('Poles')).toBeInTheDocument();
    expect(screen.getByText('Helmet')).toBeInTheDocument();
  });

  it('renders Add Section button', () => {
    render(<GearSectionList {...props} />);
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument();
  });

  it('shows optional section menu when Add Section is tapped', () => {
    render(<GearSectionList {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    expect(screen.getByText('Jacket')).toBeInTheDocument();
  });

  it('does not show already-enabled types in optional menu', () => {
    render(<GearSectionList {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    // 'Skis' is already in default sections, should not appear in menu
    const menuItems = screen.getAllByRole('button', { name: /jacket|pants|gloves|mittens|socks|goggles|bag/i });
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('calls onUpdateSettings when optional section is added', () => {
    render(<GearSectionList {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    fireEvent.click(screen.getByText('Jacket'));
    expect(props.onUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ sportSections: expect.any(Object) })
    );
  });
});
```

**Step 3: Run to confirm fail**
```bash
npm run test:run -- GearSectionList
```

**Step 4: Create `src/components/GearSectionList.tsx`**
```tsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FamilyMember, GearItem, Sport, GearType, AppSettings } from '../types';
import type { SizingCard } from '../types/sizing';
import { GearSectionRow } from './GearSectionRow';
import { GEAR_TYPE_LABELS } from '../constants/labels';
import { DEFAULT_SPORT_SECTIONS, OPTIONAL_SPORT_SECTIONS } from '../constants/sportSections';
import { RADIUS_INNER } from '../constants/design';

interface Props {
  member: FamilyMember;
  gearItems: GearItem[];
  selectedSport: Sport;
  sizingCards: SizingCard[];
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onAddGear: (gearType: GearType) => void;
  onEditGear: (item: GearItem) => void;
}

export function GearSectionList({
  member,
  gearItems,
  selectedSport,
  sizingCards,
  settings,
  onUpdateSettings,
  onAddGear,
  onEditGear,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Resolve enabled sections: user preference or sport default
  const enabledSections: GearType[] =
    settings.sportSections?.[selectedSport] ?? DEFAULT_SPORT_SECTIONS[selectedSport] ?? [];

  // Optional sections not yet enabled
  const availableOptional = (OPTIONAL_SPORT_SECTIONS[selectedSport] ?? []).filter(
    t => !enabledSections.includes(t)
  );

  const memberGear = gearItems.filter(g => g.ownerId === member.id);

  function addSection(gearType: GearType) {
    const updated = [...enabledSections, gearType];
    onUpdateSettings({
      sportSections: {
        ...settings.sportSections,
        [selectedSport]: updated,
      },
    });
    setMenuOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {enabledSections.map(gearType => {
        const sizingCard = sizingCards.find(c => c.type === gearType) ?? null;
        const assignedGear = memberGear.filter(
          g => g.type === gearType && g.sports.includes(selectedSport)
        );

        return (
          <GearSectionRow
            key={gearType}
            gearType={gearType}
            assignedGear={assignedGear}
            memberGear={memberGear}
            sizingItems={sizingCard?.items ?? null}
            onAddGear={() => onAddGear(gearType)}
            onEditGear={onEditGear}
          />
        );
      })}

      {/* Add Section */}
      <div className="relative mt-1">
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Add section"
          className={`flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          Add Section
        </button>

        {menuOpen && availableOptional.length > 0 && (
          <div className={`absolute left-0 mt-2 bg-white border border-slate-100 ${RADIUS_INNER} shadow-lg z-10 min-w-[140px]`}>
            {availableOptional.map(gearType => (
              <button
                key={gearType}
                onClick={() => addSection(gearType)}
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {GEAR_TYPE_LABELS[gearType]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 5: Run tests**
```bash
npm run test:run -- GearSectionList
```
Expected: all pass.

**Step 6: Commit**
```bash
git add src/components/GearSectionList.tsx src/components/__tests__/GearSectionList.test.tsx src/types/sizing.ts
git commit -m "Add: GearSectionList container with per-sport sections and Add Section menu"
```

---

## Task 10: Update MemberDetail

**Files:**
- Modify: `src/components/MemberDetail.tsx`
- Modify: `src/components/__tests__/MemberDetail.test.tsx`

**Context:** Remove the old Sizing Guide and Gear Vault sections. Replace with `<GearSectionList>`. Update the `onAddGear` signature to accept `gearType: GearType` so the GearForm can be pre-typed.

**Step 1: Update `MemberDetailProps` interface** — change `onAddGear`:
```ts
onAddGear: (sport: Sport, gearType?: GearType) => void;
```

**Step 2: Update `MemberDetail.tsx`** — add import for `GearSectionList`:
```ts
import { GearSectionList } from './GearSectionList';
import type { SizingCard } from '../types/sizing';
```
Remove the import of `GearTypeIcon` if it's no longer used directly. Remove the `SizingCard` interface definition (now in `src/types/sizing.ts`). Remove the import of `PlusCircle`, `CheckCircle2`, `AlertCircle` if only used in old Gear Vault section.

**Step 3: Replace the Sizing and Gear Vault JSX blocks** — find the `{/* ── Sizing ── */}` comment block and the `{/* ── Gear Vault ── */}` block. Delete both. Replace with:
```tsx
{/* ── Gear Sections ── */}
<div className="h-5" />
<div className="mb-8">
  <div className="flex items-center justify-between mb-5 ml-1">
    <h2 className={SECTION_HEADER_CLS} style={{ color: COLOR_PRIMARY }}>
      Gear <span style={{ color: COLOR_ACCENT }}>Setup</span>
    </h2>
    <button
      onClick={onGetSizing}
      className="text-xs font-black text-[#008751] uppercase tracking-widest hover:text-emerald-800 transition-colors"
    >
      All Sports →
    </button>
  </div>
  <GearSectionList
    member={member}
    gearItems={gearItems}
    selectedSport={selectedSport}
    sizingCards={sizingCards}
    settings={settings ?? DEFAULT_SETTINGS}
    onUpdateSettings={onUpdateSettings ?? (() => {})}
    onAddGear={(gearType) => onAddGear(selectedSport, gearType)}
    onEditGear={onEditGear}
  />
</div>
```

**Step 4: Update failing MemberDetail tests** — some tests reference the old section headings and gear vault. Update:
- `'renders Sizing section heading'` → check for `'Gear Setup'` heading
- `'renders Gear Inventory section heading'` → remove or update to check for section rows instead
- `'shows empty gear state when no gear items'` → remove (the new design shows empty right columns per row, no full-page empty state)
- `'shows empty state copy with sport name...'` → remove
- The sizing card tests (`'shows Alpine sizing cards by default'`, `'shows Nordic cards'`, `'shows Snowboard cards'`) → update to check for `GearSectionList` section labels via `screen.getByText('Skis')` etc. (these should still work if GearSectionList renders the labels)
- `'calls onAddGear when + button is clicked'` → update to open a GearSectionRow's add sheet and tap "New"

**Step 5: Run MemberDetail tests**
```bash
npm run test:run -- MemberDetail
```
Fix any remaining failures.

**Step 6: Run full suite**
```bash
npm run test:run
```
Expected: all pass.

**Step 7: Commit**
```bash
git add src/components/MemberDetail.tsx src/components/__tests__/MemberDetail.test.tsx
git commit -m "Update: replace Sizing Guide and Gear Vault with unified GearSectionList in MemberDetail"
```

---

## Task 10.5: Swipeable Sport Selector

**Files:**
- Create: `src/components/SportSwiper.tsx`
- Create: `src/components/__tests__/SportSwiper.test.tsx`
- Modify: `src/components/MemberDetail.tsx`

**Context:** Replace the Sport `<select>` dropdown with a full swipe gesture navigator. The user swipes left or right to move through sports pages — the entire content area (SVG silhouette + skill level selector + gear sections) transitions with the swipe. A sport label and dot indicators show the current position. There are no tappable pill buttons.

**Layout:**
```
         ← swipe →
    [ Downhill ]          ← current sport name, centred
  ●  ○  ○  ○  ○           ← dot indicators (not tappable)

  [SVG silhouette]        ← updates to skier / snowboarder / hockey player

  Skill Level: [select]

  Gear Setup section      ← updates to sport's sections
```

**Swipe mechanic:**
- Track `touchstart` X position
- On `touchend`, if `Δx > 60px` → advance to next sport; if `Δx < -60px` → go to previous sport
- CSS `transition: transform 300ms ease` on the content wrapper for smooth feel
- No snap-scrolling on the container itself — the page content transitions as a unit

**Step 1: Write failing tests**
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SportSwiper } from '../SportSwiper';
import type { Sport } from '../../types';

const SPORTS: Sport[] = ['alpine', 'nordic-classic', 'snowboard'];

describe('SportSwiper', () => {
  it('renders current sport label', () => {
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={vi.fn()} />);
    expect(screen.getByText('Downhill')).toBeInTheDocument();
  });

  it('renders dot indicators equal to sport count', () => {
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={vi.fn()} />);
    expect(screen.getAllByRole('presentation')).toHaveLength(SPORTS.length);
  });

  it('active dot is the first when value is first sport', () => {
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={vi.fn()} />);
    const dots = screen.getAllByRole('presentation');
    expect(dots[0]).toHaveAttribute('data-active', 'true');
    expect(dots[1]).toHaveAttribute('data-active', 'false');
  });

  it('calls onChange with next sport on left swipe', () => {
    const onChange = vi.fn();
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={onChange} />);
    const zone = screen.getByTestId('swipe-zone');
    fireEvent.touchStart(zone, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(zone, { changedTouches: [{ clientX: 80 }] });  // Δx = -120
    expect(onChange).toHaveBeenCalledWith('nordic-classic');
  });

  it('calls onChange with previous sport on right swipe', () => {
    const onChange = vi.fn();
    render(<SportSwiper sports={SPORTS} value="nordic-classic" onChange={onChange} />);
    const zone = screen.getByTestId('swipe-zone');
    fireEvent.touchStart(zone, { touches: [{ clientX: 80 }] });
    fireEvent.touchEnd(zone, { changedTouches: [{ clientX: 220 }] });  // Δx = +140
    expect(onChange).toHaveBeenCalledWith('alpine');
  });

  it('does not call onChange when swipe is below threshold', () => {
    const onChange = vi.fn();
    render(<SportSwiper sports={SPORTS} value="alpine" onChange={onChange} />);
    const zone = screen.getByTestId('swipe-zone');
    fireEvent.touchStart(zone, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(zone, { changedTouches: [{ clientX: 170 }] });  // Δx = -30
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not go past last sport on left swipe', () => {
    const onChange = vi.fn();
    render(<SportSwiper sports={SPORTS} value="snowboard" onChange={onChange} />);
    const zone = screen.getByTestId('swipe-zone');
    fireEvent.touchStart(zone, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(zone, { changedTouches: [{ clientX: 50 }] });
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run to confirm fail**
```bash
npm run test:run -- SportSwiper
```

**Step 3: Create `src/components/SportSwiper.tsx`**
```tsx
import { useRef } from 'react';
import type { Sport } from '../types';

const SPORT_LABELS: Partial<Record<Sport, string>> = {
  alpine:           'Downhill',
  'nordic-classic': 'XC Classic',
  'nordic-skate':   'XC Skate',
  'nordic-combi':   'XC Combi',
  snowboard:        'Snowboard',
  hockey:           'Hockey',
};

const SWIPE_THRESHOLD = 60; // px

interface Props {
  sports: Sport[];
  value: Sport;
  onChange: (sport: Sport) => void;
}

export function SportSwiper({ sports, value, onChange }: Props) {
  const touchStartX = useRef<number | null>(null);
  const activeIdx = sports.indexOf(value);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (delta < -SWIPE_THRESHOLD && activeIdx < sports.length - 1) {
      onChange(sports[activeIdx + 1]);
    } else if (delta > SWIPE_THRESHOLD && activeIdx > 0) {
      onChange(sports[activeIdx - 1]);
    }
  }

  return (
    <div
      data-testid="swipe-zone"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="select-none"
    >
      {/* Sport name */}
      <p className="text-center text-xs font-black text-[#008751] uppercase tracking-widest mb-2">
        {SPORT_LABELS[value] ?? value}
      </p>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5">
        {sports.map((sport, i) => (
          <span
            key={sport}
            role="presentation"
            data-active={String(i === activeIdx)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIdx
                ? 'w-4 h-1.5 bg-[#008751]'
                : 'w-1.5 h-1.5 bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Replace the Sport `<select>` in `MemberDetail.tsx`** — find the `{/* ── Sport & Skill Level ── */}` block. Wrap the scrollable body content (from the profile card down) in a swipe-aware div that uses `SportSwiper` for the sport selector:

```tsx
import { SportSwiper } from './SportSwiper';

// ...

{/* ── Sport & Skill Level ── */}
<div className="mb-6">
  <SportSwiper
    sports={SPORT_OPTIONS.map(o => o.value)}
    value={selectedSport}
    onChange={(s) => {
      setSelectedSport(s);
      setSkillLevel(member.skillLevels?.[s] ?? 'intermediate');
    }}
  />
  <div className="mt-3 relative">
    <label className="text-xs text-emerald-700 font-black uppercase tracking-widest block mb-1 ml-1">
      Skill Level
    </label>
    <select
      value={skillLevel}
      onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
      className={`w-full bg-white border border-slate-100 ${RADIUS_INNER} px-3 py-2.5 text-xs font-black text-[#008751] appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]`}
    >
      {LEVEL_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 bottom-3 w-3 h-3 text-emerald-400 pointer-events-none" />
  </div>
</div>
```

**Note:** The swipe gesture is registered on the `SportSwiper` zone. For the full-screen swipe feel, wrap the entire scrollable body div in a `onTouchStart` / `onTouchEnd` handler that calls the same sport-change logic. This means attaching the swipe handlers to `MemberDetail`'s scrollable outer div instead of just the `SportSwiper` component so the user can swipe anywhere on the page.

**Step 5: Update MemberDetail tests** — the sport selector is no longer a `<select>`. Update:
- `'renders sport and level dropdowns'` → expect 1 combobox (level only)
- Any `fireEvent.change(sportSelect)` calls → replace with swipe simulation:
  ```ts
  const zone = screen.getByTestId('swipe-zone');
  fireEvent.touchStart(zone, { touches: [{ clientX: 200 }] });
  fireEvent.touchEnd(zone, { changedTouches: [{ clientX: 50 }] });
  ```

**Step 6: Run tests**
```bash
npm run test:run -- SportSwiper MemberDetail
```
Expected: all pass.

**Step 7: Commit**
```bash
git add src/components/SportSwiper.tsx src/components/__tests__/SportSwiper.test.tsx src/components/MemberDetail.tsx src/components/__tests__/MemberDetail.test.tsx
git commit -m "Add: SportSwiper pill tabs replace sport dropdown in MemberDetail"
```

---

## Task 11: Update App.tsx — Wire New onAddGear Signature

**Files:**
- Modify: `src/App.tsx`

**Context:** `MemberDetail.onAddGear` now accepts `(sport: Sport, gearType?: GearType)`. Update `handleAddGearFromSizing` to receive and use the optional `gearType`.

**Step 1: Check current `handleAddGearFromSizing`** at `src/App.tsx:148`. Update signature:
```ts
const handleAddGearFromSizing = (sport: Sport, gearType?: GearType) => {
  if (selectedMember) {
    setGearOwnerId(selectedMember.id);
    setGearDefaultSport(sport);
    setGearDefaultType(gearType ?? null);   // new state, see step 2
    setSelectedGearItem(null);
    setView('add-gear');
  }
};
```

**Step 2: Add `gearDefaultType` state** near the other gear state variables:
```ts
const [gearDefaultType, setGearDefaultType] = useState<GearType | null>(null);
```

**Step 3: Pass `gearDefaultType` to `GearForm`** — find where `view === 'add-gear'` renders `GearForm` and add:
```tsx
defaultGearType={gearDefaultType ?? undefined}
```

**Step 4: Update `GearForm` to accept `defaultGearType`** — in `src/components/GearForm.tsx`, add to props:
```ts
defaultGearType?: GearType;
```
And initialise the `gearType` state with it:
```ts
const [gearType, setGearType] = useState<GearType>(item?.type ?? defaultGearType ?? 'ski');
```

**Step 5: Run full test suite**
```bash
npm run test:run
```
Expected: all pass.

**Step 6: Commit**
```bash
git add src/App.tsx src/components/GearForm.tsx
git commit -m "Update: wire gearType pre-selection from GearSectionList through to GearForm"
```

---

## Task 12: Smoke Test in Browser + Final Check

**Step 1: Start dev server in worktree**
```bash
npm run dev
```
Open `http://localhost:5173` (or whichever port is free).

**Step 2: Manual checks**
- Log in with test account
- Open a member → see unified Gear Setup section with two-column rows
- Tap "+" on Skis row → GearAssignSheet opens with "New Skis" button
- Tap "New Skis" → GearForm opens with Skis pre-selected
- Add a ski item → it appears in the Skis row right column
- Tap item name → GearForm opens (edit mode)
- Tap "Add Section" → optional types menu appears; add "Jacket" → Jacket row appears with "—" sizing
- Verify sizing column shows calculated sizing (e.g. ski length) from member measurements

**Step 3: Run full test suite one final time**
```bash
npm run test:run
```
Expected: all tests pass.

---

## Task 13: Open PR

**Step 1: Rebase on main**
```bash
git fetch origin
git rebase origin/main
```

**Step 2: Push branch**
```bash
git push -u origin feature/gear-section-redesign
```

**Step 3: Create PR**
```bash
gh pr create \
  --title "Update: unified Gear Setup section with split-column sizing + gear assignment" \
  --body "$(cat <<'EOF'
## Summary
- Merges Sizing Guide and Gear Vault into a single **Gear Setup** section in MemberDetail
- Each gear type is a row card with 30% sizing column (calculated from measurements) and 70% gear column (assigned items)
- Users can add multiple items per type (3 pairs of skis, 2 helmets, etc.)
- GearAssignSheet bottom sheet lets users create new gear or assign existing gear
- Adds optional section catalogue per sport (Jacket, Pants, Gloves, Mittens, Socks, Goggles, Bag)
- Extends GearType enum with 7 new apparel types
- Adds `tags?: string[]` to GearItem — applies to all gear types; renders as chips

## Settings changes
- New `AppSettings.sportSections` field stores per-sport enabled section order (localStorage, backwards-compatible)
- Existing `sizingDisplay: range | single` setting continues to control sizing column display

## Test plan
- [ ] All 790+ unit tests pass (`npm run test:run`)
- [ ] Open member detail → see Skis / Boots / Poles / Helmet sections with sizing in left column
- [ ] Tap + → GearAssignSheet opens → create new gear → appears in section
- [ ] Tap gear card → opens GearForm (edit mode)
- [ ] Add optional section → persists across page reload
- [ ] Tags added in GearForm appear as chips on gear section item

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Reference: Key Files

| File | Role |
|---|---|
| `src/types/index.ts` | GearType enum, GearItem.tags, AppSettings.sportSections |
| `src/types/sizing.ts` | SizingCard interface (extracted from MemberDetail) |
| `src/constants/sportSections.ts` | DEFAULT_SPORT_SECTIONS, OPTIONAL_SPORT_SECTIONS |
| `src/constants/labels.ts` | GEAR_TYPE_LABELS (updated) |
| `src/components/GearSectionItem.tsx` | Compact gear card in right column |
| `src/components/GearAssignSheet.tsx` | Bottom sheet for New / Assign Existing |
| `src/components/GearSectionRow.tsx` | One gear type row (sizing left + gear right) |
| `src/components/GearSectionList.tsx` | Container, manages enabled sections |
| `src/components/MemberDetail.tsx` | Replaces old sections with GearSectionList |
| `src/components/GearForm.tsx` | Adds tags input + new gear types + defaultGearType prop |
| `src/App.tsx` | Wires gearDefaultType state through to GearForm |
