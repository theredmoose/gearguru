# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gear Guru is a personal sports equipment sizing database and calculator for tracking family members' measurements and calculating appropriate gear sizes across multiple sports:

- **Nordic skiing** (classic, skate, combi) - ski length, pole length, boot sizing
- **Alpine skiing** - ski length by age/height/weight, boot sizing (Mondopoint), flex ratings
- **Snowboarding** - board length by height/weight
- **Hockey** - skate sizing with width/fit conversions (Bauer, CCM)

The application manages personal measurements (height, weight, foot dimensions, etc.) and uses sizing formulas from various manufacturer charts to recommend appropriate equipment sizes.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (dev server at `http://localhost:5173`)
- **Styling**: Tailwind CSS v4
- **Backend/DB**: Firebase Firestore + Firebase Hosting
- **AI Integration**: Anthropic SDK (`@anthropic-ai/sdk`)
- **Routing**: React Router DOM v7
- **Testing**: Vitest + React Testing Library (unit), Playwright (e2e)
- **Node.js**: 20+, **npm**: 10+

## Commands

```bash
npm run dev            # Start dev server (localhost:5173)
npm run build          # tsc + Vite production build
npm run preview        # Preview production build locally
npm run lint           # ESLint
npm test               # Vitest in watch mode
npm run test:run       # Vitest run once (CI)
npm run test:coverage  # Coverage report
npm run test:e2e       # Playwright e2e tests
firebase deploy --only hosting   # Deploy to Firebase Hosting
firebase deploy --only firestore:rules  # Deploy security rules
```

## Project Structure

```
src/
├── components/   # Reusable React components
├── screens/      # Top-level screen components
├── services/     # Business logic (sizing calculations, conversions)
├── hooks/        # React hooks (Firebase integration)
├── types/        # TypeScript type definitions
├── config/       # Firebase configuration
├── constants/    # Shared constants
└── utils/        # Utility functions
tests/            # Vitest unit tests
e2e/              # Playwright e2e tests (auth.spec.ts)
docs/             # PRD, testing docs
```

## Environment Setup

Requires `.env.local` with Firebase credentials (copy from `.env.example`):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

## Project Status

The app is fully implemented and deployed at https://gearguru-b3bc8.web.app.
The requirements specification at `docs/requirements/Gear Guru.xlsx` serves as the source of truth for sizing formulas and lookup tables.

## Key Domain Concepts

- **Mondopoint**: Ski boot sizing system in mm (shell size = foot length in cm × 10, e.g., 27cm foot = size 270)
- **FA Value**: Fischer ski stiffness measurement (110-130% of body weight recommended)
- **Boot Last**: Width measurement in mm (narrow ~97mm, medium ~100mm, wide ~102mm+)
- **Flex Rating**: Boot stiffness - varies by gender and skill level

## Sizing Formula Reference

Nordic Classic Skis: height (cm) + 10-20 cm
Nordic Skate Skis: height (cm) + 5-15 cm
Classic Poles: height × 0.83
Skate Poles: height × 0.89
Hockey Skates: US shoe size - 1 (approximately)



## Git Practices

### Branch Naming
Always create a new branch for changes. Use standard naming conventions:
- `feature/` - new features (e.g., `feature/gear-photo-analysis`)
- `fix/` - bug fixes (e.g., `fix/sizing-calculation-error`)
- `update/` - updates to existing functionality (e.g., `update/member-form-validation`)
- `refactor/` - code refactoring (e.g., `refactor/services-cleanup`)

### Worktrees (Required)
All feature work **must** be done in a git worktree — never directly on a checked-out branch in the main working directory. This project is developed across multiple concurrent CLI sessions, and shared working directory state (HEAD, stash, uncommitted files) causes conflicts between sessions.

```bash
# Start new feature work
git worktree add .worktrees/<branch-name> -b <branch-name>
cd .worktrees/<branch-name>

# List active worktrees
git worktree list

# Remove after merging
git worktree remove .worktrees/<branch-name>
```

Worktrees live in `.worktrees/` (gitignored). Each has its own working directory and index, so concurrent sessions cannot interfere.

### Workflow
1. **Create a worktree** from `main` for every branch before making changes
2. **Run all tests** before committing (`npm test`)
3. **Ensure tests pass** - do not commit with failing tests
4. **Write descriptive commit messages** explaining the "why" not just the "what"
5. **Create a PR** for review before merging to `main`
6. **All tests must pass** before merging a branch
7. **Do not delete branches** after merging unless explicitly asked to

### Commit Message Format
```
<type>: <short description>

<detailed description if needed>
```

Types: `Add`, `Fix`, `Update`, `Refactor`, `Remove`, `Move`

### TODO.md Maintenance
- **Update `TODO.md` at the end of every feature branch or bug fix** — check off completed items, add any new issues discovered, and update the test count if it changed
- Maintain bugs in both GitHub Issues (with `bug` label) and the `TODO.md` Known Issues section
- When creating a bug, add it to both locations with matching description and priority
- When resolving a bug, close the GitHub Issue and check off the item in `TODO.md`

### Testing Requirements
- All new features must include tests
- All existing tests must pass before merging
- Run `npm test` to execute the test suite

### PR Review Checklist
When preparing or reviewing a PR, always recommend whether any new settings should be tracked:
- If the feature introduces user-configurable behaviour, add a field to `AppSettings` (persisted via `useSettings` / localStorage) and expose a toggle in `SettingsScreen`.
- Add `notificationsEnabled: true` (or equivalent default) to `DEFAULT_SETTINGS` so the field is backwards-compatible with existing stored settings.
- Note in the PR description which, if any, new settings were added.
