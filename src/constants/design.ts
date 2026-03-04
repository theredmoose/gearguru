/**
 * Gear Guru Design System
 *
 * Single source of truth for visual styles.
 * Import these constants instead of hardcoding Tailwind classes so that a
 * change here propagates to every component that references it.
 *
 * Usage:
 *   import { BTN_ADD_CLS, SECTION_HEADER_CLS } from '../constants/design';
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR TOKENS
// ─────────────────────────────────────────────────────────────────────────────

/** Primary brand green */
export const COLOR_PRIMARY = '#008751';

/** Dark accent — used for the second word in two-tone section headers */
export const COLOR_ACCENT = '#1e3a32';

/** Page / screen background */
export const COLOR_BG = '#F8FAFC';

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Section header — h2 className.
 * Used for: "Your Family", "Alerts", "Sizing Guide", "Gear Vault".
 * Pair with COLOR_PRIMARY (+ optional COLOR_ACCENT span for two-tone).
 */
export const SECTION_HEADER_CLS = 'text-xl font-black tracking-tighter uppercase';

// ─────────────────────────────────────────────────────────────────────────────
// STAT ROWS (label/value pairs in member cards and detail panels)
// ─────────────────────────────────────────────────────────────────────────────

/** Stat row grid — label at 60%, value at 40% */
export const STAT_ROW_CLS = 'grid grid-cols-[3fr_2fr] items-center border-b border-slate-50 py-1.5';

/** Stat row label */
export const STAT_LABEL_CLS = 'text-xs text-slate-400 font-bold tracking-wide';

/** Stat row value */
export const STAT_VALUE_CLS = 'text-xs font-black text-slate-800';

// ─────────────────────────────────────────────────────────────────────────────
// BUTTONS (all sized to ≥ 44 px touch targets per Apple HIG / WCAG 2.5.5)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Header / section icon button — navigation, settings.
 * Neutral slate background; used in ScreenHeader and alongside section titles.
 * Example: Back button, Settings button, filter header buttons.
 */
export const BTN_ICON_HEADER_CLS =
  'p-3 bg-slate-50 border border-slate-100 rounded-2xl text-emerald-700 shadow-sm hover:bg-white transition-all';

/**
 * Primary Add button — green filled circle.
 * Use for ALL add / create actions throughout the app.
 * Example: Gear Vault "+", "Your Family +", gear inventory header "+".
 */
export const BTN_ADD_CLS =
  'flex items-center justify-center text-[#008751] hover:text-emerald-700 transition-colors active:scale-90 p-2';

/**
 * Inline icon button — neutral edit / view action inside a card.
 * 44 px touch target; transparent until hovered.
 */
export const BTN_ICON_INLINE_CLS =
  'w-11 h-11 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-300 hover:text-[#008751]';

/**
 * Inline icon button — destructive action (delete) inside a card.
 * 44 px touch target; red on hover.
 */
export const BTN_ICON_DANGER_CLS =
  'w-11 h-11 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-slate-300 hover:text-red-400';

/**
 * Pill filter / toggle — ACTIVE state.
 * Used in filter bars (owner filter, sport filter, etc.).
 */
export const BTN_PILL_ACTIVE_CLS =
  'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold bg-[#008751] text-white shadow-sm transition-all';

/**
 * Pill filter / toggle — INACTIVE state.
 * Pair with BTN_PILL_ACTIVE_CLS for toggle groups.
 */
export const BTN_PILL_INACTIVE_CLS =
  'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all';

// ─────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────────────────────

/** Standard card / list-item radius (24 px) */
export const RADIUS_CARD = 'rounded-3xl';

/** Large panel / detail card radius (40 px) */
export const RADIUS_CARD_LG = 'rounded-[2.5rem]';

/** Inner element radius — inputs, icon tiles, inline buttons (12 px) */
export const RADIUS_INNER = 'rounded-xl';

// ─────────────────────────────────────────────────────────────────────────────
// SURFACE ELEVATION (background + border + shadow combos)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Flat surface — border separation only, no shadow.
 * Use for inline items or tightly-packed rows.
 */
export const SURFACE_FLAT = 'bg-white border border-slate-200';

/**
 * Raised surface — subtle shadow that deepens on hover.
 * Use for interactive list cards (MemberCard, GearCard).
 */
export const SURFACE_RAISED =
  'bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all';

/**
 * Floating surface — soft diffuse shadow for elevated panels.
 * Use for detail cards, sizing cards, and modals.
 */
export const SURFACE_FLOAT =
  'bg-white border border-white shadow-[0_15px_30px_rgba(0,0,0,0.02)]';
