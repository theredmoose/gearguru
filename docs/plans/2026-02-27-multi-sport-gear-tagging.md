# Multi-Sport Gear Tagging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `GearItem.sport: Sport` with `GearItem.sports: Sport[]`, add sport-chip multi-select to GearForm, filter Gear Vault by selected sport in MemberDetail, and show sport badge chips on GearCard.

**Architecture:** Type change flows outward — types first, then service migration, then components, then tests. Each task is independently testable with no shared state risk.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest + Testing Library, Firebase Firestore (no-write migration)

---

## Task 1: Update GearItem type

**Files:**
- Modify: `src/types/index.ts:247-267`

**Step 1: Add `sports` field, keep `sport` temporarily**

In `src/types/index.ts`, change the `GearItem` interface.

Replace:
```ts
sport: Sport;
```
With:
```ts
sports: Sport[];  // required, min 1
/** @deprecated use sports */
sport?: Sport;
```

**Step 2: Run TypeScript check to see all broken call sites**

Run: `npx tsc --noEmit 2>&1 | head -60`
Expected: Errors listing every file that references `item.sport` or `data.sport`.

**Step 3: Commit the type change (broken state, will fix in follow-on tasks)**

```bash
git add src/types/index.ts
git commit -m "Add: GearItem.sports array field (sport deprecated)"
```

---

## Task 2: Firebase service — on-read migration + write path

**Files:**
- Modify: `src/services/firebase.ts:431-453` (docToGearItem)
- Modify: `src/services/firebase.ts:334-371` (createGearItem)
- Modify: `src/services/firebase.ts:373-403` (updateGearItem)
- Test: `src/services/__tests__/firebase.test.ts`

**Step 1: Write failing migration test**

In `src/services/__tests__/firebase.test.ts`, inside the `docToGearItem` describe block, add:

```ts
describe('sports migration', () => {
  it('returns sports array from legacy sport field', () => {
    const legacyData = { ...baseMockData, sport: 'alpine' };
    const result = docToGearItem('gear-1', legacyData);
    expect(result.sports).toEqual(['alpine']);
  });

  it('returns sports array when sports field exists', () => {
    const modernData = { ...baseMockData, sports: ['alpine', 'snowboard'] };
    const result = docToGearItem('gear-1', modernData);
    expect(result.sports).toEqual(['alpine', 'snowboard']);
  });

  it('prefers sports over sport when both exist', () => {
    const bothData = { ...baseMockData, sport: 'alpine', sports: ['snowboard'] };
    const result = docToGearItem('gear-1', bothData);
    expect(result.sports).toEqual(['snowboard']);
  });
});
```

Also update the existing `'maps all required fields correctly'` test: remove `expect(result.sport).toBe('alpine')` and add `expect(result.sports).toEqual(['alpine'])`.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run src/services/__tests__/firebase.test.ts`
Expected: FAIL — `result.sports` is undefined.

**Step 3: Update `docToGearItem` in `src/services/firebase.ts`**

Replace the function body to add migration logic:

```ts
export function docToGearItem(id: string, data: DocumentData): GearItem {
  // On-read migration: old docs have `sport` (string), new docs have `sports` (array)
  const sports: Sport[] = data.sports ?? (data.sport ? [data.sport as Sport] : []);
  return {
    id,
    userId: data.userId,
    ownerId: data.ownerId,
    sports,
    type: data.type,
    brand: data.brand,
    model: data.model,
    size: data.size,
    year: data.year,
    condition: data.condition,
    status: data.status,
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
```

**Step 4: Update `createGearItem` write path**

In `createGearItem`, change `sport: data.sport` to `sports: data.sports` in the `docData` object (line ~344).

**Step 5: Update `updateGearItem` write path**

In `updateGearItem`, change:
```ts
if (data.sport !== undefined) updateData.sport = data.sport;
```
to:
```ts
if (data.sports !== undefined) updateData.sports = data.sports;
```

**Step 6: Run tests**

Run: `npm test -- --run src/services/__tests__/firebase.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add src/services/firebase.ts src/services/__tests__/firebase.test.ts
git commit -m "Add: Firebase on-read migration sport→sports, update write path"
```

---

## Task 3: GearForm — sport chips multi-select

**Files:**
- Modify: `src/components/GearForm.tsx`
- Test: `src/components/__tests__/GearForm.test.tsx`

**Step 1: Write failing tests**

In `src/components/__tests__/GearForm.test.tsx`:

1. Update `baseGearItem`: change `sport: 'nordic-classic'` → `sports: ['nordic-classic']`.

2. Update the `'shows ski specifications section when sport=alpine and type=ski'` test — the default sport init needs a chip selected. The test already works by default state; no query change needed since chips replace the select.

3. Update `'hides ski specifications section when sport is changed to nordic'` — this test used `fireEvent.change(screen.getByLabelText('Sport'), ...)`. With chips, we click a chip button instead. Change to:
```ts
it('hides ski specifications section when sport is changed to nordic', () => {
  render(<GearForm {...defaultProps} />);
  // Click the Alpine chip to deselect it (it's selected by default)
  fireEvent.click(screen.getByRole('button', { name: /^alpine$/i }));
  // Click Nordic Classic chip to select it
  fireEvent.click(screen.getByRole('button', { name: /^nordic classic$/i }));
  expect(screen.queryByText('Ski Specifications')).not.toBeInTheDocument();
});
```

4. Add new tests in the `rendering` describe:
```ts
it('shows sport chip buttons for each sport', () => {
  render(<GearForm {...defaultProps} />);
  expect(screen.getByRole('button', { name: /^alpine$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^nordic classic$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^hockey$/i })).toBeInTheDocument();
});

it('pre-selects sports from item prop', () => {
  const multiSportItem = { ...baseGearItem, sports: ['alpine', 'snowboard'] as Sport[] };
  render(<GearForm {...defaultProps} item={multiSportItem} />);
  // Both should appear selected (aria-pressed or specific class — just check they're present)
  expect(screen.getByRole('button', { name: /^alpine$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^snowboard$/i })).toBeInTheDocument();
});
```

5. Add validation test:
```ts
it('shows error when no sport is selected on submit', async () => {
  render(<GearForm {...defaultProps} />);
  // Deselect default Alpine chip
  fireEvent.click(screen.getByRole('button', { name: /^alpine$/i }));
  fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Atomic' } });
  fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Redster' } });
  fireEvent.change(screen.getByLabelText('Size'), { target: { value: '170' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add Gear' }));
  expect(await screen.findByText('Select at least one sport.')).toBeInTheDocument();
  expect(mockOnSubmit).not.toHaveBeenCalled();
});
```

6. Update the `submit` test that checks `onSubmit` is called — add `sports` to `expect.objectContaining`:
```ts
expect(mockOnSubmit).toHaveBeenCalledWith(
  expect.objectContaining({
    ownerId: 'member-1',
    sports: ['alpine'],   // ← add this
    brand: 'Atomic',
    model: 'Redster',
    size: '170',
  })
);
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/components/__tests__/GearForm.test.tsx`
Expected: Several failures.

**Step 3: Implement sport chips in GearForm**

Replace the `sport` state and the `<select id="sport">` with multi-select chip logic:

In the state section, replace:
```ts
const [sport, setSport] = useState<Sport>(item?.sport ?? defaultSport ?? 'alpine');
```
With:
```ts
const [selectedSports, setSelectedSports] = useState<Sport[]>(
  item?.sports ?? (defaultSport ? [defaultSport] : ['alpine'])
);
const toggleSport = (sportId: Sport) => {
  setSelectedSports((prev) =>
    prev.includes(sportId) ? prev.filter((s) => s !== sportId) : [...prev, sportId]
  );
};
```

Update `showAlpineSkiDetails`:
```ts
const showAlpineSkiDetails = type === 'ski' && selectedSports.includes('alpine');
```

Update `handleAnalyzePhotos` call — change `sport` argument to `selectedSports[0]` (first sport for analysis hint):
```ts
const result = await analyzeGearPhotos(photos, { sport: selectedSports[0] ?? 'alpine', type });
```

Add validation in `handleSubmit` before the brand/model check:
```ts
if (selectedSports.length === 0) {
  setError('Select at least one sport.');
  return;
}
```

Update `onSubmit` call — replace `sport,` with `sports: selectedSports,`.

Replace the sport `<select>` in JSX with chip row:
```tsx
<div>
  <label className={labelCls}>Sport</label>
  <div className="flex flex-wrap gap-1.5 mt-1">
    {SPORTS.map((s) => {
      const active = selectedSports.includes(s.id);
      return (
        <button
          key={s.id}
          type="button"
          onClick={() => toggleSport(s.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-colors ${
            active
              ? 'bg-[#008751] text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {s.label}
        </button>
      );
    })}
  </div>
</div>
```

**Step 4: Run tests**

Run: `npm test -- --run src/components/__tests__/GearForm.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/GearForm.tsx src/components/__tests__/GearForm.test.tsx
git commit -m "Add: GearForm sport chip multi-select, replace single sport dropdown"
```

---

## Task 4: GearCard — sport badge chips

**Files:**
- Modify: `src/components/GearCard.tsx:152-156`
- Test: `src/components/__tests__/GearCard.test.tsx`

**Step 1: Update GearCard test fixtures and assertions**

In `src/components/__tests__/GearCard.test.tsx`:

1. Update `baseGearItem`: change `sport: 'alpine'` → `sports: ['alpine']`.

2. Update test `'displays sport label'`:
```ts
it('displays alpine sport badge', () => {
  render(<GearCard {...defaultProps} />);
  expect(screen.getByText('Alpine / Downhill')).toBeInTheDocument();
});
```
(No change needed if SPORT_LABELS already maps `'alpine'` → `'Alpine / Downhill'`.)

3. Update test `'hides sport label when showing owner'`:
```ts
it('hides sport badges when showing owner', () => {
  render(<GearCard {...defaultProps} showOwner members={members} />);
  expect(screen.queryByText('Alpine / Downhill')).not.toBeInTheDocument();
});
```

4. Add a multi-sport test:
```ts
it('renders a badge for each sport in the sports array', () => {
  const multiSportItem = { ...baseGearItem, sports: ['alpine', 'snowboard'] as Sport[] };
  render(<GearCard {...defaultProps} item={multiSportItem} />);
  expect(screen.getByText('Alpine / Downhill')).toBeInTheDocument();
  expect(screen.getByText('Snowboard')).toBeInTheDocument();
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/components/__tests__/GearCard.test.tsx`
Expected: Failures on `baseGearItem` shape + sport display tests.

**Step 3: Update GearCard component**

In `src/components/GearCard.tsx`, replace the sport display section (lines ~153-156):

Replace:
```tsx
: <p className="text-[10px] text-slate-400 font-bold mt-0.5">{SPORT_LABELS[item.sport] ?? item.sport}</p>
```
With:
```tsx
: (
  <div className="flex flex-wrap gap-1 mt-0.5">
    {item.sports.map((s) => (
      <span key={s} className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wide">
        {SPORT_LABELS[s] ?? s}
      </span>
    ))}
  </div>
)
```

**Step 4: Run tests**

Run: `npm test -- --run src/components/__tests__/GearCard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/GearCard.tsx src/components/__tests__/GearCard.test.tsx
git commit -m "Add: GearCard sport badge chips, replace single sport label"
```

---

## Task 5: MemberDetail — filter Gear Vault by selected sport

**Files:**
- Modify: `src/components/MemberDetail.tsx:432-469`
- Test: `src/components/__tests__/MemberDetail.test.tsx`

**Step 1: Write failing test**

In `src/components/__tests__/MemberDetail.test.tsx`, find the gear vault describe block and add:

```ts
it('shows only gear tagged for selected sport', () => {
  const alpineGear = { ...baseGearItem, id: 'g1', sports: ['alpine'] };
  const nordicGear = { ...baseGearItem, id: 'g2', sports: ['nordic-classic'] };
  render(<MemberDetail {...defaultProps} gearItems={[alpineGear, nordicGear]} />);
  // Default sport is alpine — only alpine gear visible
  expect(screen.getByText(alpineGear.brand + ' ' + alpineGear.model)).toBeInTheDocument();
  expect(screen.queryByText(nordicGear.brand + ' ' + nordicGear.model)).not.toBeInTheDocument();
});

it('shows empty state copy with sport name when no gear matches', () => {
  const nordicGear = { ...baseGearItem, sports: ['nordic-classic'] };
  render(<MemberDetail {...defaultProps} gearItems={[nordicGear]} />);
  // Default sport is alpine — nordic gear is hidden, show sport-specific empty state
  expect(screen.getByText(/No Downhill gear yet/i)).toBeInTheDocument();
});
```

Note: Check `MemberDetail.test.tsx` for the actual `baseGearItem` shape and update it to use `sports: ['alpine']` too.

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/components/__tests__/MemberDetail.test.tsx`
Expected: Failures on vault filter tests.

**Step 3: Update MemberDetail Gear Vault section**

In `src/components/MemberDetail.tsx`:

Find the Gear Vault section around line 432. Change:
```tsx
{gearItems.length === 0 ? (
  <div ...>
    ...
    <p className="text-slate-500 text-sm font-bold">No gear added yet</p>
    <p className="text-slate-300 text-xs">Tap + to start building your vault</p>
  </div>
) : (
  <div className="space-y-3">
    {gearItems.map((item) => {
```

To:
```tsx
{(() => {
  const sportLabel = SPORT_OPTIONS.find(o => o.value === selectedSport)?.label ?? selectedSport;
  const filteredGear = gearItems.filter((item) => item.sports.includes(selectedSport));
  if (filteredGear.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 bg-white rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.02)]">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
          <PlusCircle className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-slate-500 text-sm font-bold">
          {gearItems.length === 0 ? 'No gear added yet' : `No ${sportLabel} gear yet`}
        </p>
        <p className="text-slate-300 text-xs">Tap + to add.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {filteredGear.map((item) => {
```

Close with `})}` after the map close.

**Step 4: Run tests**

Run: `npm test -- --run src/components/__tests__/MemberDetail.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/MemberDetail.tsx src/components/__tests__/MemberDetail.test.tsx
git commit -m "Add: MemberDetail Gear Vault filters by selected sport"
```

---

## Task 6: SportSizing — update gear filter

**Files:**
- Modify: `src/components/SportSizing.tsx:73`

**Step 1: The change**

In `src/components/SportSizing.tsx`, find line 73:
```ts
const sportGearItems = gearItems.filter((item) => item.sport === currentSport.id);
```
Change to:
```ts
const sportGearItems = gearItems.filter((item) => item.sports.includes(currentSport.id));
```

**Step 2: Run all tests**

Run: `npm test -- --run`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/components/SportSizing.tsx
git commit -m "Fix: SportSizing gear filter uses sports array"
```

---

## Task 7: Fix remaining TypeScript errors and run full suite

**Step 1: Check for remaining TS errors**

Run: `npx tsc --noEmit 2>&1`
Expected: Only warnings or zero errors. Fix any remaining references to `item.sport` that weren't caught by earlier tasks.

Common locations to check:
- `src/components/GearInventory.tsx` (if it exists and uses `item.sport`)
- Any other component that reads `item.sport`

**Step 2: Run full test suite**

Run: `npm test -- --run`
Expected: All tests PASS. Note the count.

**Step 3: Remove deprecated `sport` from `GearItem` type (optional cleanup)**

If you want a clean type with no deprecated field, remove `sport?: Sport` from `src/types/index.ts`. This is safe because no component reads it anymore (only Firestore docs have it).

Run: `npm test -- --run` to confirm still passing.

**Step 4: Final commit**

```bash
git add -A
git commit -m "Fix: remove deprecated sport field, all TypeScript clean"
```

---

## Task 8: Update TODO.md and create PR

**Step 1: Update TODO.md**

- Check off "Multi-sport gear tagging" if present
- Update test count

**Step 2: Create PR**

```bash
gh pr create --title "feat: multi-sport gear tagging" --body "..."
```

**Step 3: Merge and deploy**

After PR review:
```bash
npm run build && firebase deploy --only hosting
```
