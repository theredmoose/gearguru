# GearGuru - Vibe Coding Prompt Samples

A collection of natural, conversational coding prompts for working on the GearGuru mobile sports gear inventory app.

---

## 🎯 About GearGuru

**GearGuru** is a mobile-first web app that helps families track body measurements and get equipment sizing recommendations for winter sports gear (Nordic skiing, Alpine skiing, Snowboarding, Hockey).

**Tech Stack**: React 18 + TypeScript, Vite, Firebase Firestore, Vitest + React Testing Library

**Key Concepts**:
- Mondopoint: Ski boot sizing (foot length cm × 10)
- Nordic Classic vs Skate skiing (different ski/pole lengths)
- Skill-based sizing (beginner skis are shorter)
- Multi-sport family profiles

---

## 📋 Table of Contents

1. [New Features](#new-features)
2. [Sizing Calculators](#sizing-calculators)
3. [UI/UX Improvements](#uiux-improvements)
4. [Data & State Management](#data--state-management)
5. [Testing](#testing)
6. [Bug Fixes](#bug-fixes)
7. [Refactoring](#refactoring)
8. [Performance](#performance)
9. [Documentation](#documentation)

---

## 🆕 New Features

### Add Gear Inventory Management

```
Hey, I need to add gear inventory tracking to the app. Users should be able to:
- Add gear items for each family member (skis, boots, poles, boards, etc.)
- Track gear details: brand, model, size, condition, year purchased
- Mark gear as "active", "outgrown", or "available for hand-me-down"
- See all gear for a specific family member
- Filter gear by sport type

The gear data should be stored in Firestore in a "gear" collection with ownerId 
linking to family members. Can you create the GearItem type (if not already in types/index.ts), 
a GearInventory component, and the Firebase CRUD operations for gear?
```

### Photo Upload for Gear Items

```
I want to let users upload photos of their gear items to help identify them later. 
Add photo upload functionality to the gear form:
- Support multiple photos per gear item (up to 3)
- Store images in Firebase Storage
- Show thumbnails in the gear card/list view
- Use proper image compression for mobile
- Handle loading states and upload errors gracefully

Keep it mobile-friendly - the image picker should work well on phones.
```

### Measurement History & Growth Tracking

```
Create a measurement history feature so parents can track how their kids are growing:
- Store all measurement updates with timestamps (don't overwrite)
- Show a line chart of height/weight over time for each family member
- Predict when they'll outgrow current gear based on growth rate
- Display "last measured 3 months ago" prompts to remind users to update

Use the existing Measurements type but convert it to allow multiple timestamped 
entries. Maybe add a MeasurementHistory interface?
```

### Hand-Me-Down Recommendations

```
Build a smart hand-me-down system that suggests when gear can be passed down:
- When gear is marked "outgrown" by one member, check if it fits another
- Compare gear size to calculated size recommendations for other family members
- Show alerts like "Sarah's old skis (150cm) will fit Jake next year!"
- Sort by youngest to oldest when showing available hand-me-downs

This should work with the existing sizing calculator functions in services/sizing.ts
```

### Export Family Data

```
Add a "Export Data" feature that lets users download their family profile:
- Export as JSON (all data: members, measurements, gear, skill levels)
- Export as PDF report (formatted, human-readable)
- Include a CSV option for measurements only (importable to spreadsheet)
- Add an "Import from JSON" feature to restore backups

Put the export/import logic in a new services/export.ts file with proper TypeScript types.
```

---

## 📏 Sizing Calculators

### Add Helmet Sizing

```
Add helmet sizing to the app. Helmets are sized by head circumference:
- Add headCircumference to the Measurements type (in cm)
- Create a calculateHelmetSize() function in services/sizing.ts
- Map circumference to sizes: XS (<52cm), S (52-54), M (55-56), L (57-58), XL (59+)
- Show helmet size in the SportSizing component for all sports
- Add tests in services/__tests__/sizing.test.ts

Follow the same pattern as the existing boot sizing calculations.
```

### Improve Ski Stiffness Calculator

```
The Nordic ski sizing doesn't account for weight properly. Update it to:
- For kids under 40kg, recommend ski stiffness based on weight ranges (see PRD.md section 2.2)
- For adults, calculate recommended stiffness as 110-130% of body weight
- Add a "stiffness" field to NordicSkiSizing interface
- Display stiffness recommendation in the UI as "Ski Stiffness: 65-75kg"

Reference the weight-based kids' sizing table in docs/PRD.md lines 125-134.
```

### Add Pole Grip Size Calculator

```
Pole grip size matters for comfort. Add grip size recommendations:
- Small grip: hand length < 18cm
- Medium grip: hand length 18-21cm  
- Large grip: hand length > 21cm

Add handLength to Measurements, calculate grip size in both Nordic and Alpine 
pole recommendations. Show it in the SportSizing display like "Pole Length: 145cm (Medium Grip)"
```

### DIN Setting Improvements

```
The current DIN calculator in services/sizing.ts (calculateAlpineSkiSizing) is too 
simplified. Improve it by:
- Factoring in skier type: cautious (Type 1), moderate (Type 2), aggressive (Type 3)
- Adding age consideration (kids and seniors use lower DIN)
- Creating a more accurate lookup table based on weight + height + skier type
- Adding a warning if DIN is outside safe range (1-14 for most bindings)

Check out the actual DIN setting chart formulas online and implement them properly.
```

### Snowboard Flex Rating

```
Add flex rating recommendations for snowboards (like we have for alpine boots):
- Soft flex (1-3): beginners, park riders, lighter weight
- Medium flex (4-6): all-mountain, intermediate
- Stiff flex (7-10): advanced, freeride, heavier riders

Calculate based on skill level, weight, and riding style. Add a ridingStyle field 
to the FamilyMember profile with options: park, allmountain, freeride, powder.
Update the SnowboardSizing interface and calculation function.
```

---

## 🎨 UI/UX Improvements

### Dark Mode

```
Add dark mode support to the app:
- Use CSS variables for colors (--bg-primary, --text-primary, etc.)
- Add a theme toggle button in the header
- Store preference in localStorage
- Make sure all components look good in both themes
- Test that the Firebase data tables are readable in dark mode

The app should respect the user's system preference on first load, then remember 
their manual choice.
```

### Mobile Navigation Menu

```
The current desktop navigation doesn't work well on mobile. Create a hamburger menu:
- Slide-out drawer on mobile (< 768px)
- Keep the horizontal nav on desktop
- Add smooth animations (slide-in from left)
- Close drawer when clicking outside or selecting an item
- Show member count badge on "Family Members" nav item

Use CSS transitions, not a heavy library. Keep it snappy.
```

### Loading Skeletons

```
Replace the generic loading spinners with skeleton screens:
- MemberCard should show skeleton rectangles for name, age, measurements
- GearInventory should show skeleton gear cards in a grid
- SportSizing should show skeleton lines for each size recommendation

Use CSS animations for the shimmer effect. Make them the right size to prevent 
layout shift when real content loads.
```

### Onboarding Flow

```
Create a first-time user onboarding:
1. Welcome screen explaining what GearGuru does
2. "Add your first family member" guided form
3. "Take their measurements" tutorial with measurement tips
4. "Get sizing recommendations" demo showing the calculator
5. "Track your gear" intro (when that feature is ready)

Store onboarding completion in localStorage. Add a "Show tutorial" button in 
settings to replay it. Make it skippable at any step.
```

### Responsive Tables

```
The measurement tables in MemberDetail don't work well on phones. Make them mobile-friendly:
- Stack data vertically on small screens instead of horizontal scrolling
- Use card layout for each measurement on mobile
- Keep table layout on desktop (> 768px)
- Add icons next to measurement types (ruler for height, scale for weight)
- Use larger touch targets for edit buttons

Check out mobile-first table patterns - cards or accordion might work better than a table.
```

### Search and Filter Gear

```
When the gear inventory gets large, users need search/filter:
- Add a search box that filters by brand, model, type
- Add filter chips for: sport, condition, owner, status
- Show result count: "Showing 8 of 24 items"
- Add sort options: newest, oldest, by owner, by sport
- Clear all filters button

Use debounced search (300ms delay) for better performance. Keep filter state in URL 
query params so it's shareable.
```

---

## 💾 Data & State Management

### Offline Support with Service Worker

```
Add offline functionality so the app works without internet:
- Install a service worker to cache the app shell and assets
- Use Firestore's offline persistence (already available, just enable it)
- Show an offline indicator in the UI when there's no connection
- Queue writes and sync when back online
- Cache the last-viewed family member data in IndexedDB

Make it a PWA so users can install it on their home screen.
```

### Optimistic Updates

```
The app feels slow because we wait for Firebase writes. Add optimistic updates:
- Update the UI immediately when users edit a family member
- Show the change right away, then sync to Firebase in the background
- If the Firebase write fails, revert the UI and show an error toast
- Add a retry mechanism for failed writes

Do this for member updates, measurement changes, and skill level edits.
```

### Batch Operations

```
Add bulk operations for managing family gear:
- "Mark all as outgrown" for a family member
- "Delete all gear for [member]" when they age out
- "Duplicate measurements" to quickly add similar measurements
- Bulk edit: change condition, owner, or status for multiple items

Use checkboxes to select multiple items, show a batch actions toolbar when 
items are selected. Make sure to batch the Firestore writes for efficiency.
```

### Data Migration Script

```
We changed the Measurements type to support history. Write a one-time migration:
- Read all existing familyMembers from Firestore
- Convert old single Measurements object to array with one entry
- Add measuredAt timestamp if missing (use createdAt as fallback)
- Write back to Firestore
- Log progress and any errors

Make it safe to run multiple times (idempotent). Add a dry-run mode that just 
logs what it would do without changing data.
```

### Context API for Global State

```
Right now we're prop drilling the family members everywhere. Set up React Context:
- Create a FamilyContext with members, selectedMemberId, loading state
- Add actions: selectMember, addMember, updateMember, deleteMember
- Wrap the app in a FamilyProvider
- Create a useFamilyContext hook for easy access

This will clean up the component tree and make state management clearer.
```

---

## 🧪 Testing

### E2E Tests for Critical Flows

```
Set up Playwright for end-to-end testing and cover the critical user journeys:
1. Create a new family member and add measurements
2. Calculate Nordic ski sizing for different skill levels
3. Convert shoe sizes between EU/US/Mondopoint systems
4. Edit an existing member's measurements
5. Delete a family member

Include tests for error states (offline, invalid data, etc.). Run in CI/CD before 
deployment to catch regressions.
```

### Component Visual Regression Tests

```
Add visual regression testing to catch UI bugs:
- Use Playwright or Percy to snapshot key components
- Test MemberCard in different states (loading, error, with/without data)
- Test SportSizing with various sports and skill levels
- Test responsive layouts (mobile, tablet, desktop)
- Test dark mode if implemented

Fail the build if screenshots differ from baseline by more than 1%.
```

### Improve Test Coverage

```
Our test coverage is at 80% but we're missing some edge cases. Add tests for:
- Sizing calculations with extreme values (very tall/short, very heavy/light)
- Date of birth edge cases (today, 100 years ago, future date)
- Measurement validation (negative numbers, zero, extremely large values)
- Shoe size conversion edge cases (tiny kids' sizes, large adult sizes)
- Skill level impact on sizing recommendations

Get us to 90%+ coverage on the sizing service and form validation.
```

### Mock Firebase in Component Tests

```
The component tests are flaky because of real Firebase calls. Improve mocking:
- Mock the entire Firebase SDK in src/__mocks__/firebase/firestore.ts
- Create test fixtures in tests/fixtures/ for consistent test data
- Use msw (Mock Service Worker) if we add REST APIs later
- Add helpers like createMockMember() and createMockGearItem()

Make tests fast, deterministic, and runnable without network access.
```

### Performance Testing

```
Add performance tests to catch slow renders:
- Use React Testing Library's performance utilities
- Measure render time for MemberCard with 10+ family members
- Test scroll performance on GearInventory with 50+ items
- Check bundle size and flag if it grows beyond 500KB
- Add lighthouse CI for page load metrics

Set thresholds and fail CI if we regress.
```

---

## 🐛 Bug Fixes

### Fix Shoe Size Conversion Rounding

```
The shoe size converter has rounding issues. A 25.5cm foot shows as "EU 40.25" 
but should be "EU 40". Fix the rounding:
- Round EU sizes to nearest 0.5 (40, 40.5, 41, 41.5...)
- Round US sizes to nearest 0.5
- Round Mondopoint to nearest 5mm (255, 260, 265...)

Update the formulas in services/shoeSize.ts and add regression tests for 
the specific values that were wrong.
```

### Handle Missing Measurements Gracefully

```
The app crashes if a family member has no foot measurements when calculating 
boot sizes. Fix this:
- Check for required measurements before calculating
- Show helpful error: "Add foot length to calculate boot size"
- Highlight the missing fields in the measurement form
- Allow partial calculations (e.g., ski length without boot size)

Add defensive checks in all sizing calculator functions.
```

### Fix Date Picker Safari Bug

```
The date of birth picker doesn't work in Safari on iOS. It shows an empty field:
- Use a proper date input with type="date"
- Add a polyfill for browsers that don't support it
- Validate the date format on both client and server side
- Show a clear placeholder "MM/DD/YYYY" or whatever format
- Test on iPhone Safari specifically

Check that the stored ISO date string formats correctly in all browsers.
```

### Prevent Negative Measurements

```
Users can enter negative measurements which breaks the calculations. Add validation:
- Block negative numbers in measurement inputs
- Show error message if they try to submit negative values
- Set min="0" on all number inputs
- Add backend validation too (don't trust client)
- Handle edge case of zero values appropriately

Fix in both MemberForm.tsx and the Firestore security rules.
```

### Fix Skill Level Not Persisting

```
When users set skill levels for sports, they're not saving to Firebase properly.
Debug and fix:
- Check that skillLevels is being sent in the update payload
- Verify Firestore security rules allow updating the skillLevels field
- Add console logging to track the update flow
- Make sure the UI reflects the saved value after reload

Add a test that verifies skill level persistence in the Firebase integration tests.
```

---

## ♻️ Refactoring

### Extract Sizing Constants

```
The sizing formulas have magic numbers scattered throughout. Refactor:
- Create a sizing-constants.ts file with all the multipliers and ranges
- Document each constant: CLASSIC_SKI_MIN_ADDITION = 10 // cm above height
- Make it easy to adjust sizing recommendations in one place
- Export typed constant objects, not just numbers

This will make it easier to add manufacturer-specific sizing later.
```

### Split Sizing Service by Sport

```
services/sizing.ts is 510 lines and getting hard to maintain. Split it:
- nordicSizing.ts - all Nordic classic/skate/combi logic
- alpineSizing.ts - Alpine ski and boot sizing
- snowboardSizing.ts - Snowboard sizing
- hockeySizing.ts - Hockey skate sizing
- Keep sizing.ts as a barrel export that re-exports everything

Maintain the same API, just organize the code better. Update imports in tests.
```

### Component Composition Refactor

```
The MemberForm component is 298 lines with too many concerns. Break it down:
- Extract a MeasurementsInputSection component
- Extract a PersonalInfoSection component
- Extract a SkillLevelsSection component
- Keep MemberForm as the orchestrator with form state

Use composition to make it more maintainable. Each section should be independently 
testable.
```

### TypeScript Strict Mode

```
Enable strict mode in tsconfig.json and fix all the errors:
- Add explicit return types to all functions
- Fix all implicit any types
- Handle null/undefined properly with optional chaining
- Use unknown instead of any where appropriate
- Add proper type guards

This will catch bugs at compile time instead of runtime.
```

### CSS Module Migration

```
We're using global CSS which causes naming collisions. Migrate to CSS Modules:
- Convert component.css to component.module.css
- Import styles as objects: import styles from './MemberCard.module.css'
- Use styles.className instead of className="..."
- Enables scoped styling and better tree-shaking

Do one component at a time to avoid breaking everything. Start with MemberCard.
```

---

## ⚡ Performance

### Code Splitting

```
The bundle is 630KB (mostly Firebase). Improve load time with code splitting:
- Lazy load Firebase config until user logs in
- Lazy load sport-specific sizing calculators
- Split routes with React.lazy() and Suspense
- Use dynamic imports for heavy components

Aim for initial bundle < 200KB, async chunks for the rest.
```

### Image Optimization

```
If we add gear photos, we need image optimization:
- Compress images before uploading to Firebase Storage
- Generate thumbnails (small, medium, large) on upload
- Use WebP format with PNG/JPEG fallback
- Lazy load images below the fold
- Add blur-up placeholder while loading

Use a library like sharp for server-side processing or compress client-side.
```

### Memoization

```
Some calculations run on every render unnecessarily. Add memoization:
- Use React.memo for MemberCard (only re-render if props change)
- Use useMemo for expensive sizing calculations
- Use useCallback for event handlers passed to children
- Identify hot paths with React DevTools Profiler

Focus on components that render frequently or have expensive computations.
```

### Virtual Scrolling

```
When gear inventory has 100+ items, scrolling gets janky. Add virtual scrolling:
- Use react-virtual or react-window to render only visible items
- Keep the DOM size constant regardless of data size
- Maintain scroll position when items update
- Handle dynamic item heights gracefully

This is especially important for mobile devices with slower GPUs.
```

### Database Indexing

```
Firestore queries are slow without proper indexes. Add indexes for common queries:
- Composite index on (ownerId, sport) for filtering gear by owner and sport
- Index on (sport, condition) for filtering available gear
- Index on createdAt for sorting
- Use Firebase console or firebase.indexes.json to define them

Document which queries need which indexes in comments.
```

---

## 📚 Documentation

### Inline Code Comments

```
Add JSDoc comments to all public functions in services/sizing.ts:
- Explain what each function does
- Document parameters with @param tags
- Document return values with @returns
- Include example usage with @example
- Note any edge cases or gotchas

This will help new developers understand the sizing logic faster.
```

### Component Storybook

```
Set up Storybook to document our components:
- Show MemberCard with different states (loading, error, populated)
- Show MemberForm in add vs edit mode
- Show SportSizing for each sport type
- Include knobs to interactively change props
- Document component APIs and usage patterns

This becomes our living component library and design system.
```

### Architecture Documentation

```
Create a docs/ARCHITECTURE.md file explaining:
- How data flows from Firebase → hooks → components
- The sizing calculation pipeline
- File structure and where to find things
- Naming conventions and code style
- How to add a new sport or gear type

Include a diagram of the component hierarchy and data flow.
```

### Contribution Guide

```
Write a CONTRIBUTING.md for the project:
- How to set up the dev environment
- How to run tests and linting
- Commit message format (we use conventional commits?)
- How to submit PRs and what to include
- Code review process and expectations

Make it welcoming for new contributors.
```

### API Documentation

```
Document the Firebase data model in docs/DATABASE.md:
- Collections: familyMembers, gearItems (future)
- Document structure for each with field types
- Firestore security rules explained
- Query patterns and indexes needed
- Migration strategy for schema changes

Include example documents and query code snippets.
```

---

## 🎓 Advanced Features

### Multi-Family Support

```
Let users manage multiple families (coach managing teams):
- Add a Families collection with family name, members[], owner
- Add family switcher in the header
- Share families with other users (invites via email)
- Each user has a default family
- Permissions: owner can edit, members can view

This is a big change - probably need auth first and a data model redesign.
```

### Gear Rental Marketplace

```
Add a marketplace for families to rent/lend gear to each other:
- Mark gear as "available to lend"
- Post gear with rental price per day/week
- Search for gear by sport, size, location
- In-app messaging to arrange pickup
- Track rental history

This would need user auth, payments (Stripe?), and location services.
```

### AI Size Recommendations

```
Use machine learning to improve size recommendations:
- Collect data: actual gear sizes owned vs calculated recommendations
- Train a model to predict "this person prefers slightly longer skis"
- Adjust recommendations based on user feedback ("too long", "just right")
- Personalize to individual preferences over time

Start simple with collaborative filtering, upgrade to ML model later.
```

### Integration with Retailer APIs

```
Connect to retailer APIs to show in-stock gear that fits:
- Integrate with evo.com, REI, Backcountry APIs
- Show "Skis that fit Emma (148-155cm): [Products...]"
- Affiliate links for purchases
- Price tracking and sale alerts
- "Save for later" wishlist

Requires API partnerships and affiliate program sign-ups.
```

---

## 🎯 Quick Wins (Good First Issues)

### Add Tooltips for Sizing Terms

```
New users don't know what "Mondopoint" or "DIN" means. Add tooltips:
- Hovering over "Mondopoint" shows "Boot sizing in millimeters = foot length × 10"
- Hovering over "DIN" shows "Binding release value - higher for heavier/aggressive skiers"
- Use a simple tooltip library or build custom with CSS
- Add to all jargon terms in the UI

This makes the app more beginner-friendly.
```

### Add Unit Tests for Edge Cases

```
Our test coverage has gaps. Add tests for:
- calculateNordicSkiSizing with height < 100cm (small children)
- calculateNordicSkiSizing with height > 200cm (very tall people)
- Shoe size conversion with foot length < 15cm or > 35cm
- Invalid date of birth (future date, 200 years ago)

These should take < 1 hour and improve reliability.
```

### Improve Error Messages

```
Replace generic errors with helpful ones:
- "Error saving member" → "Could not save Emma's profile. Check your internet connection."
- "Invalid input" → "Height must be between 50cm and 250cm"
- "Failed to load" → "Could not load family members. Tap to retry."

Make errors actionable and specific. Users should know what to do next.
```

### Add Loading States

```
Some buttons don't show loading state when clicked. Fix:
- Add spinner to "Save" button in MemberForm while submitting
- Disable button during save to prevent double-clicks
- Show "Deleting..." on delete button
- Use the existing submitting state, just wire it up to the UI

Small UX improvement that makes the app feel more polished.
```

### Format Measurement Display

```
Measurements show ugly numbers: "180.5000000001cm". Format them nicely:
- Round to 1 decimal place for display: "180.5 cm"
- Add thousands separator for weight: "72.5 kg"
- Format dates nicely: "Measured 3 weeks ago" instead of ISO timestamp
- Use user's locale for number formatting

Update the display logic in MemberCard and MemberDetail components.
```

---

## 💡 Prompt Writing Tips

**Good prompts for GearGuru include:**

1. **Context**: Mention the app name, tech stack, or relevant file
2. **Specifics**: Exact file paths, function names, or component names
3. **User Impact**: Why the feature matters to families using the app
4. **Constraints**: Mobile-first, offline support, performance needs
5. **References**: Point to docs/PRD.md or existing code patterns

**Example of a GREAT prompt:**

> "The MemberForm component (src/components/MemberForm.tsx) doesn't validate that 
> foot measurements are less than height. Add validation that shows an error if 
> footLength > height because that's physically impossible. Display the error below 
> the foot length input. Also add a test case in MemberForm.test.tsx to verify this."

**Example of an OK prompt:**

> "Add form validation for measurements."

The first gives actionable details, the second is too vague.

---

## 📝 Notes

- GearGuru is currently in MVP phase with core sizing features complete
- Authentication and cloud sync are planned but not yet implemented
- The app targets mobile-first but works on desktop too
- All measurements are stored in metric (cm, kg) and converted for display
- The codebase follows React + TypeScript best practices

**Project Files Reference:**
- Types: [`src/types/index.ts`](../src/types/index.ts)
- Sizing Logic: [`src/services/sizing.ts`](../src/services/sizing.ts)
- Components: [`src/components/`](../src/components/)
- Tests: [`src/**/__tests__/`](../src/)
- Requirements: [`docs/PRD.md`](PRD.md)
- Architecture: [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)

---

*Last Updated: February 2026*
*GearGuru Version: MVP (1.0)*