# Gear Guru TODO List

## MVP Complete
- [x] Family member CRUD
- [x] Body measurements tracking
- [x] Nordic ski/pole/boot sizing
- [x] Alpine ski/boot sizing with DIN
- [x] Snowboard sizing with stance width
- [x] Hockey skate sizing (Bauer/CCM)
- [x] Shoe size converter (EU/US/UK/Mondo)
- [x] Mobile-first CSS with Tailwind v4 (full v3 UI redesign complete)
- [x] Firebase integration
- [x] Skill level per sport
- [x] List layout for gear types
- [x] Separate settings section (DIN, Stance)
- [x] 527 tests passing
- [x] CI/CD with GitHub Actions
- [x] Deployed to Firebase Hosting
- [x] Real gear photo analysis via Claude Vision API (with mock fallback)
- [x] Fischer and Evosports Nordic sizing models with FA Value
- [x] Range vs single size display toggle (per-session + default in Settings)
- [x] Square UI (all rounded corners removed globally)

## Next Up
- [x] Persist skill levels per member in database
- [x] Add gear inventory tracking (owned equipment)
- [x] Add authentication (Google sign-in)
- [ ] Add data export (PDF/CSV)

## Future Enhancements
- [ ] Growth tracking / size history
- [ ] Hand-me-down suggestions between family members
- [x] Brand-specific sizing charts — Fischer + Evosports Nordic models added; more manufacturers (Salomon, Atomic, Rossignol, K2) for Alpine/Snowboard
- [ ] Add remaining manufacturer Alpine/Snowboard models (Salomon, Atomic, Rossignol, K2)
- [ ] PWA support (offline, installable)
- [ ] Dark mode
- [ ] Multiple families / sharing
- [ ] Age-specific sizing adjustments for children
- [ ] Growth projections for kids (next season sizing)
- [ ] Waist width recommendations for alpine skis
- [ ] Binding safety check — warn when DIN setting is outside safe range for user's weight/skill
- [ ] Multi-brand sizing comparison view when adding gear
- [ ] Equipment lifespan tracking based on condition progression
- [ ] Stance width measurement guide (visual diagram)
- [ ] Coach/instructor notes on family member profiles
- [ ] Ski base condition analyzer — take a photo of the bottom of a ski and use Claude Vision to determine if it needs waxing, base grinding, edge sharpening, or base repair (ptex fill)

## Technical Debt
- [x] Code-split Firebase to reduce bundle size — chunks exceed 500KB after minification (currently 680KB), use dynamic imports
- [x] Add E2E tests with Playwright — 15 auth-page smoke tests (PR #53)
- [x] Increase test coverage to 80%+ for branches/functions — 88% stmts, 82% branches, 86% functions, 90% lines (516 tests)
- [x] Increase PhotoCapture test coverage — from 38.2% to 96.6% statements / 100% functions (PR #52)
- [x] Extract GEAR_TYPE_LABELS and SPORT_LABELS to a shared constants file — moved to `src/constants/labels.ts` (PR #51)
- [x] Add useMemo to MemberDetail sizingCards calculation (PR #51)

## Known Issues

### Critical
- [x] skillLevels field lost on Firestore read — was already fixed in `docToFamilyMember()`
- [x] photos/extendedDetails fields lost on Firestore read — was already fixed in `docToGearItem()`
- [x] No user-scoped Firebase queries — was already fixed in `getAllFamilyMembers()` and `getAllGearItems()`
- [x] status/location/checkedOutTo/checkedOutDate lost on Firestore read — fixed in `docToGearItem()` (PR #39)
- [x] `getGearItemsByOwner()` not filtered by userId — fixed: compound query now filters by both `userId` and `ownerId` (PR #45)

### High
- [x] Boot unit preference (MP/EU/US) resets on every visit — fixed: `bootUnit` added to `AppSettings`, persisted via `onUpdateSettings` when cycled in MemberDetail
- [x] Hockey skate fallback size formula wrong — fixed: `MemberInfoTable.tsx` now uses `calculateHockeySkateSize()` which delegates to `getShoeSizesFromFootLength()`

### Medium
- [x] Negative/zero size values after conversion — MemberDetail now guards against footLength <= 0
- [x] Zero foot measurements cause invalid shoe sizes — `MemberDetail.tsx` shows "N/A" message when footLength is 0
- [x] No validation for negative/zero measurements — MemberForm now validates weight > 0
- [x] Missing Firebase env var validation — `src/config/firebase.ts` now throws with clear error listing missing vars
- [x] No account linking flow — fixed: `auth/account-exists-with-different-credential` detected in `useAuth`; conflict email extracted and surfaced; `AuthForm` auto-switches to sign-in mode with email pre-filled and shows guidance banner
- [x] No offline error handling — read errors in App.tsx now use `getOperationErrorMessage()` with `'load'` context; network/unavailable codes produce friendly messages
- [x] Year field in GearForm accepts invalid values — added submit-time validation (1980–currentYear+1); HTML min/max updated to match
- [x] GearForm numeric fields (tip/waist/tail profile) use parseFloat/parseInt without isNaN guard — fixed: profile only built when all three fields parse to valid integers
- [x] Foot measurement bounds not validated — MemberForm now validates 12–30 cm range with error message; HTML min/max updated

### Low
- [x] `parseFloat(value) || undefined` treats 0 as undefined — optional numeric fields now use `e.target.value === '' ? undefined : parseFloat()`
- [x] No date-of-birth bounds validation — MemberForm now rejects future dates and dates > 120 years ago
- [x] nordic-combi in skillLevels but not in SPORTS array — `SportSizing.tsx` now omits nordic-combi when persisting skill levels
- [x] US shoe size conversion inconsistency — `sizing.ts` now uses `getShoeSizesFromFootLength()` from shoeSize service
- [x] Potential undefined skillLevel access — already handled: `skillLevels` state initialised for all 6 sports with `?? 'intermediate'` fallback on line 68 of SportSizing.tsx
- [x] No loading state for gear operations — gear delete/submit in App.tsx show no loading indicators; mutations now catch errors and surface a dismissible toast
- [x] Race condition in useAuth — `setLoading(false)` and `setError()` now guarded by mounted ref
- [x] No email verification on signup — fixed: `sendEmailVerification` called after email signup; amber banner shown to unverified users with "Resend email" button in `App.tsx`
- [x] Hockey skate width thresholds (0.36, 0.40) hardcoded without source documentation — added Bauer/CCM fit guide comments to `determineSkateWidth()`
- [x] Firestore timestamp conversion drops nanoseconds — fixed: now includes `Math.round(nanoseconds / 1e6)` in milliseconds calculation

## Notes
- App URL: https://gearguru-b3bc8.web.app
- Firebase Console: https://console.firebase.google.com/project/gearguru-b3bc8
