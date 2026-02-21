# GUI Redesign — v3 Tailwind Style

Reference document capturing the gap analysis, design decisions, and status of the UI overhaul based on the `gearguru-memberdetails-v3.jsx` screen sample.

---

## Source Material

The redesign was driven by a screen sample located at:

```
docs/requirements/screen samples/gearguru-memberdetails-v3.jsx
```

The file had no extension and was identified via `file` command as JSX source. It was renamed with a `.jsx` extension during the analysis.

---

## Gap Analysis — v3 Sample vs. Original Implementation

### What the v3 Sample Showed

| Area | v3 Sample |
|------|-----------|
| **Header** | Blue `bg-blue-700` bar with member initial avatar, name, green "online" dot, and 5 stat rows (age, height, weight, foot size, head) on the right |
| **Sport selection** | Dropdown for sport and skill level directly on MemberDetail — no separate navigation needed for a quick sizing summary |
| **Sizing cards** | 2×2 grid of sport-specific cards (Skis, Boots, Poles, Helmet) each showing key measurements computed from the selected sport + level |
| **Gear inventory** | Inline gear list on MemberDetail with **Ready** (green checkmark) / **Update** (amber pulse) status badges per item |
| **Bottom nav** | Persistent 4-tab bar: FAMILY · GEAR · MEASURE · RESOURCES |
| **Icons** | Lucide React icons throughout (no emoji for UI actions) |
| **Card style** | `rounded-2xl`, `shadow-sm`, `font-black` typography, uppercase tracking-widest labels |
| **Action buttons** | Small icon-only buttons (Pencil, Trash2, ChevronRight) replacing text buttons |

### What the Original Had

| Area | Original |
|------|----------|
| **Header** | Plain white, plain `<button>← Back</button>`, no avatar, no stat summary |
| **Sport selection** | Separate `SportSizing` screen — required navigation away from MemberDetail to see sizes |
| **Sizing cards** | None on MemberDetail — user had to visit SportSizing to see any numbers |
| **Gear inventory** | `GearInventory` was a completely separate screen; not surfaced from MemberDetail at all |
| **Bottom nav** | None — full-page view swaps via `setView()` state |
| **Icons** | Emoji (✏️ 🗑️) used as button labels |
| **Card style** | Plain CSS class-based, no Tailwind |
| **Action buttons** | Emoji text buttons |

### UX Elements Worth Preserving from the Original

Before redesigning, these features of the original were identified as **better UX** that should be carried forward — not discarded:

| Feature | Location | Why Keep It |
|---------|----------|-------------|
| **Swipe navigation** | SportSizing | Touch-native gesture to move between sports; keeps one-handed use |
| **GearLoadoutPanel silhouette** | SportSizing | Visual gear slot diagram — quickly shows what's missing vs. owned |
| **MemberInfoTable** | SportSizing | Compact reference of member stats on the sizing screen |
| **Gear photos in tile** | GearCard | A photo thumbnail makes inventory scannable at a glance |
| **Condition indicator** | GearCard | Color-coded condition badge (new/good/fair/worn) |
| **Extended alpine ski details** | GearCard | Profile (tip/waist/tail mm), radius, binding brand/model |
| **Checkout/location tracking** | GearCard | `checkedOutTo` and `location` fields shown inline on card |
| **Grouped inventory by owner** | GearInventory | When viewing all family gear, grouping by owner avoids confusion |

---

## Changes Made

### Infrastructure (PR #31 — merged)

**Goal:** Install Tailwind v4 and build the shared shell components.

| File | Change |
|------|--------|
| `vite.config.ts` | Added `tailwindcss()` Vite plugin |
| `src/index.css` | Added `@import "tailwindcss"` at top (coexists with existing plain CSS) |
| `src/components/GearIcons.tsx` | New — SVG sport icons: SkiIcon, BootIcon, PoleIcon, HelmetIcon, SnowboardIcon, SkateIcon; dispatched by `GearTypeIcon` |
| `src/components/ScreenHeader.tsx` | New — blue `bg-blue-700` header bar with ChevronLeft back, centered title, optional right slot |
| `src/components/BottomNav.tsx` | New — 4-tab persistent nav (FAMILY/GEAR/MEASURE/RESOURCES) using `TopLevelTab` type |
| `src/components/MeasureScreen.tsx` | New — MEASURE tab: member list → edit form |
| `src/components/ResourcesScreen.tsx` | New — RESOURCES tab: static sizing reference cards |
| `src/components/index.ts` | Updated exports |
| `src/App.tsx` | Added `activeTab` state, `renderTabContent()` switch, BottomNav always visible |

**Note:** The `icons/` subdirectory was initially used for GearIcons but the `.gitignore` rule `Icon?` (intended for macOS `Icon\r` files) matched `icons/` (Icon + s). Moved to `src/components/GearIcons.tsx` directly.

---

### MemberDetail, MemberCard, GearCard (PR #32 — merged)

**Goal:** Match the v3 sample's card style and bring sizing/gear inline on MemberDetail.

#### MemberDetail.tsx — full rewrite

- **ScreenHeader** with Settings icon (triggers `onEdit`)
- **Two-column profile**: left = 3/4-aspect initial avatar + sport dropdown + level dropdown; right = name + green dot + 5 stat rows
- **Sport** defaults to first key in `member.skillLevels` or `'alpine'`; level syncs when sport changes
- **`getSizingCards()`** — computes 2×2 grid using all sizing service functions for the selected sport:
  - Alpine: Skis / Boots / Poles / Helmet
  - Nordic classic/skate: Skis / Poles / Boots / Helmet
  - Snowboard: Board / Boots / Stance / Helmet
  - Hockey: Bauer / CCM (no skill selector)
- **Inline gear inventory** — filters `gearItems` by owner; shows Ready (green CheckCircle2) or Update (amber AlertCircle + `animate-pulse`) per item, derived from `condition === 'worn'`
- **"All Sports →"** link navigates to full `SportSizing` view

New interface:
```ts
interface MemberDetailProps {
  member: FamilyMember;
  gearItems: GearItem[];
  onBack: () => void;
  onEdit: () => void;
  onGetSizing: () => void;
  onOpenConverter: () => void;
  onAddGear: () => void;
  onEditGear: (item: GearItem) => void;
}
```

#### MemberCard.tsx — rewritten

- `rounded-2xl` with `shadow-sm`, `hover:shadow-md`, `active:scale-[0.98]`
- Blue circle avatar with member initial
- Lucide `Pencil` / `Trash2` / `ChevronRight` replacing emoji

#### GearCard.tsx — rewritten

- **Icon tile**: `GearTypeIcon` with condition-colored background (`bg-green-50`, `bg-slate-50`, `bg-amber-50`, `bg-red-50`)
- **Photo tile**: `gear-card-photo` wrapper (CSS class preserved for tests) shows photo when available; photo count badge overlay
- **Condition badge**: inline `style={{ backgroundColor }}` with hex colors — required because jsdom cannot compute Tailwind utility classes in tests
- **Size display**: `"Size: {item.size}"` and year as separate `<span>` (test compatibility)
- Root div has `gear-card` CSS class (for test querySelector)
- All original features preserved: alpine extended details, location (MapPin icon), checkout status, owner/sport label, `GearStatusBadge`

---

### GearInventory, MemberForm, GearForm (PR #33 — open)

**Goal:** Apply Tailwind styling to the remaining screens without touching test-sensitive text content.

#### GearInventory.tsx — rewritten

- Blue header bar matching the family tab style (no ScreenHeader — `← Home` sr-only text keeps test passing)
- `<select>` filter preserved exactly for `getByRole('combobox')` tests
- Owner group headings as `<h2>` with `uppercase tracking-widest` styling
- `+ Add` button text preserved exactly (for `getAllByText('+ Add')` test)

#### MemberForm.tsx — rewritten

- **ScreenHeader** with `title="Add/Edit Family Member"` and `onBack={onCancel}`
- Scrollable field area + actions pinned at bottom
- `grid grid-cols-2` for side-by-side pairs
- `rounded-xl` inputs with `focus:ring-2 focus:ring-blue-400`
- All label text, section headings, button names preserved exactly (14 tests)

#### GearForm.tsx — rewritten

- Same ScreenHeader pattern
- Sections: Photos → Gear Info → Ski Specifications (conditional) → Notes
- All exact label strings preserved (32 tests): `"Sport"`, `"Type"`, `"Brand"`, `"Model"`, `"Size"`, `"Year (optional)"`, `"Condition"`, `"Status"`, `"Location (optional)"`, `"Notes (optional)"`
- Heading role preserved for `getByRole('heading', { name: 'Add Gear' })`

---

## Test Compatibility Strategy

All 278 tests continue to pass. The key patterns used to maintain compatibility while redesigning:

| Pattern | Reason |
|---------|--------|
| Add Tailwind classes alongside existing CSS hook classes (`.swipe-dot`, `.active`, `.gear-card`, `.gear-card-photo`) | Tests use `document.querySelector('.class')` — CSS hook classes must be in DOM |
| Inline `style={{ backgroundColor }}` for condition badge | `toHaveStyle()` checks computed/inline styles; jsdom has no CSS engine so Tailwind color utilities return nothing |
| `<span className="sr-only">← Home</span>` | `getByText('← Home')` finds DOM text regardless of visual visibility |
| Preserve all `htmlFor`/`id` label associations | `getByLabelText()` relies on these |
| Preserve exact button text | `getByRole('button', { name: 'exact text' })` requires exact match |
| Preserve exact `<h1>`/`<h2>`/`<h3>` section text | `getByRole('heading')` and `getByText()` both target DOM text content |

---

## What Remains

| Screen | Status | Notes |
|--------|--------|-------|
| SportSizing | Not started | Complex — has `.swipe-dot` + `.active` CSS hooks, swipe gestures, GearLoadoutPanel, MemberInfoTable. Keep all CSS hooks. Back button must include member name in accessible text. |
| ShoeSizeConverter | Not started | Small, read-only display screen — low risk |
| AuthForm | Not started | Login/signup screen — can use ScreenHeader style |

---

## Bundle Size Impact

| Metric | Before redesign | After PR #31–32 |
|--------|----------------|-----------------|
| Main JS bundle | ~680 KB | ~248 KB |
| Firebase chunk | (included above) | ~478 KB (separate, cached) |

The main bundle reduction is primarily from the Firebase code-splitting (PR #30), not the Tailwind redesign. Tailwind v4 added ~57 KB to the CSS chunk.
