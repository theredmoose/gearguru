# Gear Guru TODO List

## MVP Complete
- [x] Family member CRUD
- [x] Body measurements tracking
- [x] Nordic ski/pole/boot sizing
- [x] Alpine ski/boot sizing with DIN
- [x] Snowboard sizing with stance width
- [x] Hockey skate sizing (Bauer/CCM)
- [x] Shoe size converter (EU/US/UK/Mondo)
- [x] Mobile-first CSS
- [x] Firebase integration
- [x] Skill level per sport
- [x] List layout for gear types
- [x] Separate settings section (DIN, Stance)
- [x] 131 tests passing
- [x] CI/CD with GitHub Actions
- [x] Deployed to Firebase Hosting

## Next Up
- [x] Persist skill levels per member in database
- [ ] Add gear inventory tracking (owned equipment)
- [ ] Add authentication (Google sign-in)
- [ ] Add data export (PDF/CSV)

## Future Enhancements
- [ ] Growth tracking / size history
- [ ] Hand-me-down suggestions between family members
- [ ] Brand-specific sizing charts
- [ ] PWA support (offline, installable)
- [ ] Dark mode
- [ ] Multiple families / sharing

## Technical Debt
- [ ] Code-split Firebase to reduce bundle size (currently 630KB)
- [ ] Add E2E tests with Playwright
- [ ] Increase test coverage to 80%+ for branches/functions

## Known Issues

### Critical
- [ ] skillLevels field lost on Firestore read — `docToFamilyMember()` in `src/services/firebase.ts` doesn't include `skillLevels` in the returned object, losing skill level data on every fetch
- [ ] No user-scoped Firebase queries — `getAllFamilyMembers()` and `getAllGearItems()` don't filter by user ID, potential data leakage if Firestore rules are misconfigured

### Medium
- [ ] Negative/zero size values after conversion — shoe size and equipment size calculations can produce negative or zero values with edge-case inputs
- [ ] Zero foot measurements cause invalid shoe sizes — `getShoeSizesFromFootLength(0)` returns bad data instead of "N/A" in `src/components/MemberDetail.tsx`
- [ ] No validation for negative/zero measurements — weight and foot measurements in MemberForm accept 0 or negative values
- [ ] Missing Firebase env var validation — `src/config/firebase.ts` silently accepts undefined env vars, causing cryptic runtime crash
- [ ] No account linking flow — users get stuck signing in with Google after creating email account with same address
- [ ] No offline error handling — Firebase operations show raw errors when offline

### Low
- [ ] `parseFloat(value) || undefined` treats 0 as undefined — optional numeric fields in MemberForm save 0 values as undefined
- [ ] No date-of-birth bounds validation — future dates and unrealistic ages accepted in MemberForm
- [ ] nordic-combi in skillLevels but not in SPORTS array — skill levels initialized for a sport that isn't selectable
- [ ] US shoe size conversion inconsistency — different functions use different EU-to-US formulas
- [ ] Potential undefined skillLevel access — `skillLevels[currentSport.id]` in SportSizing has no fallback
- [ ] No loading state for gear operations — gear delete/submit in App.tsx show no loading indicators
- [ ] Race condition in useAuth — `setLoading(false)` can fire after component unmounts
- [ ] No email verification on signup — email accounts created without verifying address

## Notes
- App URL: https://gearguru-b3bc8.web.app
- Firebase Console: https://console.firebase.google.com/project/gearguru-b3bc8
