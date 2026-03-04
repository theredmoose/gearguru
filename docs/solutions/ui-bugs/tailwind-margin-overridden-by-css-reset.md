---
title: Tailwind margin utilities silently overridden by unlayered CSS reset
date: 2026-03-04
category: ui-bugs
tags:
  - tailwind
  - css-cascade
  - margin
  - spacing
  - react
  - tailwind-v4
symptoms:
  - Physical margin utilities (e.g. mt-5, mb-3) present in JSX but computed margin is 0px
  - Physical padding utilities (e.g. pt-6, pb-8) present in JSX but computed padding is 0px
  - Section spacing collapses to zero with no visible error or warning
  - gap-*, px-*, py-* and h-* spacing works fine; mt-*/mb-*, pt-*/pb-* do not
root_cause: An unlayered `* { margin: 0 }` reset in index.css outranks Tailwind utility classes in @layer utilities regardless of specificity
stack:
  - React
  - TypeScript
  - Tailwind CSS v4
  - Vite
severity: medium
time_to_solve: 30 min
related_files:
  - src/index.css
  - src/App.tsx
---

## Symptoms

A `mt-5` (`margin-top: 1.25rem`) Tailwind utility applied to a wrapper `<div>` in `App.tsx` had no visible effect. The `NotificationsPanel` component appeared flush against the element above it despite the margin class being present in the DOM. Other spacing utilities like `gap-*` and `h-*` worked correctly in the same file, making the failure non-obvious.

## Investigation

The class was correctly applied — inspecting the DOM confirmed `mt-5` was present. Adjacent utilities like `gap-4` and `h-5` on sibling elements rendered as expected, which ruled out a build or class-purging issue. The inconsistency pointed toward a cascade conflict rather than a missing utility or typo.

Checking `src/index.css` revealed a CSS reset block immediately after the Tailwind import:

```css
@import "tailwindcss";

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;   /* ← This overrides ALL Tailwind margin utilities */
  padding: 0;
}
```

## Root Cause

In Tailwind CSS v4, all utility classes are emitted inside a `@layer utilities` declaration:

```css
@layer utilities {
  .mt-5 { margin-top: 1.25rem; }
  /* ... */
}
```

The CSS cascade specification defines that **unlayered styles always win over layered styles**, regardless of specificity. The reset block in `src/index.css` is unlayered — it sits outside any `@layer` declaration. This means:

| Rule | Layer | Specificity | Result |
|---|---|---|---|
| `* { margin: 0 }` | none (unlayered) | 0,0,0 | **Wins** |
| `.mt-5 { margin-top: 1.25rem }` | `@layer utilities` | 0,1,0 | Loses |

Despite `.mt-5` having higher specificity, it loses because layered styles are always lower priority than unlayered styles. This is a key architectural change in Tailwind v4 vs v3 — in v3, utilities were not layer-wrapped, so specificity resolved conflicts normally.

`gap-*` and `h-*` utilities are unaffected because the reset only zeroes `margin` and `padding` — `gap` and `height` are untouched.

Importantly, Tailwind v4 switched many utilities to **logical CSS properties** (e.g. `padding-inline`, `margin-block`), which are different CSS properties from the physical shorthand equivalents:

| Tailwind utility | Generated CSS property | Type | Affected by reset? |
|---|---|---|---|
| `px-*` | `padding-inline` | logical | ❌ No — `padding: 0` only sets `padding-top/right/bottom/left` |
| `py-*` | `padding-block` | logical | ❌ No |
| `pt-*`, `pb-*` | `padding-top`, `padding-bottom` | physical | ✅ Yes — directly set to 0 by reset |
| `p-*` | `padding` shorthand | physical | ✅ Yes |
| `mt-*`, `mb-*` | `margin-top`, `margin-bottom` | physical | ✅ Yes — directly set to 0 by reset |
| `mx-*`, `my-*` | `margin-inline`, `margin-block` | logical | ❌ No |

This is why `px-6` padding appears to work while `pt-6` padding does not.

## Solution

Replace `mt-5` wrapper divs with self-closing `h-5` spacer divs, which use `height` instead of `margin-top` and are therefore not subject to the reset conflict.

**Before (`src/App.tsx`):**

```jsx
<div className="mt-5">
  <NotificationsPanel ... />
</div>
```

**After (`src/App.tsx`):**

```jsx
<div className="h-5" />
<NotificationsPanel ... />
```

This pattern was already established at `App.tsx:264` and `App.tsx:279` for spacing elsewhere in the same file.

## Why This Works

`h-5` sets `height: 1.25rem` on the spacer element — the same visual distance as `mt-5`. The `height` property is not reset by `* { margin: 0 }`, so the `@layer utilities` rule for `.h-5` is never challenged by an unlayered override. The spacer div occupies vertical space in normal flow, pushing subsequent elements down by exactly `1.25rem`.

---

## Prevention

### Long-term Fix (Recommended)

Wrap the CSS reset in `@layer base` so Tailwind utilities outrank it:

```css
/* src/index.css */
@import "tailwindcss";

@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}
```

Tailwind's `@layer utilities` beats `@layer base` in the cascade, so all margin utilities would work again with no component changes required. Alternatively, remove the manual reset entirely — Tailwind v4 ships its own preflight via `@import "tailwindcss"` and may already cover it.

### Safe Spacing Patterns (Until Fixed)

| Technique | CSS property | Works? | Notes |
|---|---|---|---|
| `gap-*` | `gap` | ✅ | Preferred for flex/grid layouts |
| `px-*`, `py-*` | `padding-inline`, `padding-block` | ✅ | Logical padding — not set by `* { padding: 0 }` |
| `mx-*`, `my-*` | `margin-inline`, `margin-block` | ✅ | Logical margin — not set by `* { margin: 0 }` |
| `<div className="h-5" />` spacer | `height` | ✅ | Established pattern in this codebase |
| `mt-*`, `mb-*`, `ml-*`, `mr-*` | `margin-top`, etc. | ❌ | Physical margin, zeroed by unlayered `* { margin: 0 }` |
| `p-*`, `pt-*`, `pb-*`, `pl-*`, `pr-*` | `padding-top`, etc. | ❌ | Physical padding, zeroed by unlayered `* { padding: 0 }` |
| `space-y-*` / `space-x-*` | `margin-block-*` | ⚠️ | Tailwind v4 uses logical margin, but physical/logical interaction with cascade layers is browser-dependent — prefer `gap-*` instead |

### Detection

**DevTools**: Select the element → Styles tab → look for `margin`. If `* { margin: 0 }` shows without strikethrough above the Tailwind rule, the reset is winning.

**Behavioral signal**: Spacing works with `gap-*`, `px-*`, or `py-*` but not `mt-*` / `mb-*` / `pt-*` / `pb-*` for the same element.

**Quick test** — add temporarily to the component under test:

```tsx
<div className="mt-8 bg-red-500 h-1" />
```

If the red bar appears with no top gap, `mt-8` is being suppressed.

**Code audit** — find unlayered `*` rules in CSS files:

```bash
grep -n "^\*\s*{" src/index.css
```

---

## Related

- `docs/solutions/logic-errors/form-validation-field-bounds.md`
- 17 source files use physical `mt-*`/`mb-*` utilities that are currently silently broken; `pt-*`/`pb-*` physical padding utilities are equally affected — audit against the safe spacing patterns table above.
