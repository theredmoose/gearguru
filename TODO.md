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
- [x] 516 tests passing
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
- [ ] Add E2E tests with Playwright
- [x] Increase test coverage to 80%+ for branches/functions — 88% stmts, 82% branches, 86% functions, 90% lines (516 tests)
- [ ] Increase PhotoCapture test coverage (currently 38.2% — lowest in codebase)
- [ ] Extract GEAR_TYPE_LABELS and SPORT_LABELS to a shared constants file (currently duplicated across GearCard, MemberDetail, SettingsScreen, etc.)
- [ ] Add useMemo to MemberDetail sizingCards calculation (recalculates on every render)

## Known Issues

### Critical
- [x] skillLevels field lost on Firestore read — was already fixed in `docToFamilyMember()`
- [x] photos/extendedDetails fields lost on Firestore read — was already fixed in `docToGearItem()`
- [x] No user-scoped Firebase queries — was already fixed in `getAllFamilyMembers()` and `getAllGearItems()`
- [x] status/location/checkedOutTo/checkedOutDate lost on Firestore read — fixed in `docToGearItem()` (PR #39)
- [ ] `getGearItemsByOwner()` not filtered by userId — queries by ownerId only, not `userId + ownerId`; a user could fetch another user's gear if they know the ownerId (`src/services/firebase.ts`)

### High
- [ ] Boot unit preference (MP/EU/US) resets on every visit — `bootUnit` state in MemberDetail is local and not persisted in AppSettings
- [ ] Hockey skate fallback size formula wrong — `MemberInfoTable.tsx:55` uses `footLength * 1.5 + 2 - 32` fallback instead of `getShoeSizesFromFootLength()` from shoeSize service

### Medium
- [x] Negative/zero size values after conversion — MemberDetail now guards against footLength <= 0
- [x] Zero foot measurements cause invalid shoe sizes — `MemberDetail.tsx` shows "N/A" message when footLength is 0
- [x] No validation for negative/zero measurements — MemberForm now validates weight > 0
- [x] Missing Firebase env var validation — `src/config/firebase.ts` now throws with clear error listing missing vars
- [ ] No account linking flow — users get stuck signing in with Google after creating email account with same address
- [ ] No offline error handling — Firebase operations show raw errors when offline
- [ ] Year field in GearForm accepts invalid values (0, negative, far future) — needs validation to 1980–current year + 1
- [ ] GearForm numeric fields (tip/waist/tail profile) use parseFloat/parseInt without isNaN guard — NaN silently stored on submit
- [ ] Foot measurement bounds not validated — MemberForm accepts values outside reasonable range (12–30 cm)

### Low
- [x] `parseFloat(value) || undefined` treats 0 as undefined — optional numeric fields now use `e.target.value === '' ? undefined : parseFloat()`
- [x] No date-of-birth bounds validation — MemberForm now rejects future dates and dates > 120 years ago
- [x] nordic-combi in skillLevels but not in SPORTS array — `SportSizing.tsx` now omits nordic-combi when persisting skill levels
- [x] US shoe size conversion inconsistency — `sizing.ts` now uses `getShoeSizesFromFootLength()` from shoeSize service
- [ ] Potential undefined skillLevel access — `skillLevels[currentSport.id]` in SportSizing has no fallback
- [x] No loading state for gear operations — gear delete/submit in App.tsx show no loading indicators; mutations now catch errors and surface a dismissible toast
- [x] Race condition in useAuth — `setLoading(false)` and `setError()` now guarded by mounted ref
- [ ] No email verification on signup — email accounts created without verifying address
- [ ] Hockey skate width thresholds (0.36, 0.40) hardcoded without source documentation (`sizing.ts:653`)
- [ ] Firestore timestamp conversion drops nanoseconds (`firebase.ts:32`) — minor precision loss

## Notes
- App URL: https://gearguru-b3bc8.web.app
- Firebase Console: https://console.firebase.google.com/project/gearguru-b3bc8
