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
- [x] 473 tests passing
- [x] CI/CD with GitHub Actions
- [x] Deployed to Firebase Hosting

## Next Up
- [x] Persist skill levels per member in database
- [x] Add gear inventory tracking (owned equipment)
- [x] Add authentication (Google sign-in)
- [ ] Add data export (PDF/CSV)

## Future Enhancements
- [ ] Growth tracking / size history
- [ ] Hand-me-down suggestions between family members
- [ ] Brand-specific sizing charts
- [ ] PWA support (offline, installable)
- [ ] Dark mode
- [ ] Multiple families / sharing

## Technical Debt
- [x] Code-split Firebase to reduce bundle size — chunks exceed 500KB after minification (currently 680KB), use dynamic imports
- [ ] Add E2E tests with Playwright
- [x] Increase test coverage to 80%+ for branches/functions — 87% stmts, 82% branches, 85% functions, 89% lines

## Known Issues

### Critical
- [x] skillLevels field lost on Firestore read — was already fixed in `docToFamilyMember()`
- [x] photos/extendedDetails fields lost on Firestore read — was already fixed in `docToGearItem()`
- [x] No user-scoped Firebase queries — was already fixed in `getAllFamilyMembers()` and `getAllGearItems()`

### Medium
- [x] Negative/zero size values after conversion — MemberDetail now guards against footLength <= 0
- [x] Zero foot measurements cause invalid shoe sizes — `MemberDetail.tsx` shows "N/A" message when footLength is 0
- [x] No validation for negative/zero measurements — MemberForm now validates weight > 0
- [x] Missing Firebase env var validation — `src/config/firebase.ts` now throws with clear error listing missing vars
- [ ] No account linking flow — users get stuck signing in with Google after creating email account with same address
- [ ] No offline error handling — Firebase operations show raw errors when offline

### Low
- [x] `parseFloat(value) || undefined` treats 0 as undefined — optional numeric fields now use `e.target.value === '' ? undefined : parseFloat()`
- [x] No date-of-birth bounds validation — MemberForm now rejects future dates and dates > 120 years ago
- [x] nordic-combi in skillLevels but not in SPORTS array — `SportSizing.tsx` now omits nordic-combi when persisting skill levels
- [x] US shoe size conversion inconsistency — `sizing.ts` now uses `getShoeSizesFromFootLength()` from shoeSize service
- [ ] Potential undefined skillLevel access — `skillLevels[currentSport.id]` in SportSizing has no fallback
- [ ] No loading state for gear operations — gear delete/submit in App.tsx show no loading indicators
- [x] Race condition in useAuth — `setLoading(false)` and `setError()` now guarded by mounted ref
- [ ] No email verification on signup — email accounts created without verifying address

## Notes
- App URL: https://gearguru-b3bc8.web.app
- Firebase Console: https://console.firebase.google.com/project/gearguru-b3bc8
