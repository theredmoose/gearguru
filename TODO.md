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
- [x] 686 tests passing (branch coverage 81.98%, above 80% threshold)
- [x] CI/CD with GitHub Actions
- [x] Deployed to Firebase Hosting
- [x] Real gear photo analysis via Claude Vision API (with mock fallback)
- [x] Fischer and Evosports Nordic sizing models with FA Value
- [x] Range vs single size display toggle (per-session + default in Settings)
- [x] Square UI (all rounded corners removed globally)
- [x] Gear notifications — worn/fair/old-gear alerts on home screen with dismiss, view dismissed page, settings toggle (626 tests)

## Next Up
- [x] Persist skill levels per member in database
- [x] Add gear inventory tracking (owned equipment)
- [x] Add authentication (Google sign-in)
- [ ] Add data export (PDF/CSV)

## Future Enhancements
- [x] Settings toggle: track foot and hand measurements as a single value or left/right separately — controls whether MemberForm and EditMeasurementEntryScreen show one field or paired L/R fields for foot length, foot width, and hand size

- [x] Growth tracking / size history — measurement history with per-entry edit/delete, growth-trend analysis, ⚠ badge in MemberCard/MemberDetail/MeasureScreen
- [ ] Hand-me-down suggestions between family members
- [x] Brand-specific sizing charts — Fischer + Evosports Nordic models added; more manufacturers (Salomon, Atomic, Rossignol, K2) for Alpine/Snowboard
- [ ] Add remaining manufacturer Alpine/Snowboard models (Salomon, Atomic, Rossignol, K2)
- [ ] PWA support (offline, installable)
- [ ] Dark mode
- [ ] Personalized color theme — let users pick an accent color (or preset theme) in Settings, replacing the hardcoded green (#008751)
- [ ] Multiple families / sharing
- [ ] Age-specific sizing adjustments for children
- [ ] Growth projections for kids (next season sizing)
- [x] Waist width recommendations for alpine skis — terrain selector (Groomed/All-Mountain/Powder) with mm ranges (PR #54)
- [x] Binding safety check — inline green/amber/red badges in Gear Settings when stored DIN is outside safe range (PR #55)
- [ ] Multi-brand sizing comparison view when adding gear
- [ ] Equipment lifespan tracking based on condition progression
- [ ] Stance width measurement guide (visual diagram)
- [ ] Coach/instructor notes on family member profiles
- [ ] Ski base condition analyzer — take a photo of the bottom of a ski and use Claude Vision to determine if it needs waxing, base grinding, edge sharpening, or base repair (ptex fill)

## Notes
- App URL: https://gearguru-b3bc8.web.app
- Firebase Console: https://console.firebase.google.com/project/gearguru-b3bc8
