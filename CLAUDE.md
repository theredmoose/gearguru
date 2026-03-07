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



## Design Review / Screenshots

For mobile UI review, use Chrome DevTools at **iPhone 14 Pro** dimensions:
1. `Cmd+Option+I` → click phone icon (Toggle device toolbar)
2. Select **iPhone 14 Pro** from the Dimensions dropdown (393 × 852, DPR 3)
3. Reload so styles render at mobile size
4. Use the camera icon in the device toolbar to screenshot each screen

Test account for manual review: `tester@3rbar.com` / `testertester`

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

**After creating a worktree**, always copy `.env.local` from the repo root so Firebase loads:
```bash
cp .env.local .worktrees/<branch-name>/.env.local
```

### Bug Fix Protocol
When the user asks to fix a bug or issue:
1. **Compact context first** — run `/compact` to compress history and retain the bug description
2. **Create a worktree** — then proceed with the workflow below

### Workflow
1. **Create a worktree** from `main` for every branch before making changes
2. **Run all tests** before committing (`npm test`)
3. **Ensure tests pass** - do not commit with failing tests
4. **Write descriptive commit messages** explaining the "why" not just the "what"
5. **Rebase on `main` before opening a PR** — always run `git rebase main` in the worktree before creating a PR. This surfaces conflicts early, keeps them in the branch's own history, and avoids "Fix: resolve merge conflicts" commits polluting `main`.
6. **Create a PR** for review before merging to `main`
7. **All tests must pass** before merging a branch
8. **Do not use `--delete-branch`** with `gh pr merge` when using worktrees — it leaves the local branch stranded. Instead: `gh pr merge` → `git worktree remove .worktrees/<name>` → `git branch -d <branch>`
9. **Do not delete branches** after merging unless explicitly asked to

### Commit Message Format
```
<type>: <short description>

<detailed description if needed>
```

Types: `Add`, `Fix`, `Update`, `Refactor`, `Remove`, `Move`

### TODO.md Maintenance
`TODO.md` tracks **sprint-level work only** — epics, milestones, and feature themes. It is not a task tracker for individual items.

- **Bugs** → GitHub Issues with `bug` label. Not in `TODO.md`.
- **Individual coding tasks** → GitHub Issues. Not in `TODO.md`.
- **When resolving a bug or task** → close the GitHub Issue. No `TODO.md` update needed.
- **When completing a sprint or major milestone** → update `TODO.md` to reflect the new state of the roadmap (check off epics, add new themes). Also update the test count if it changed.

### Testing Requirements
- All new features must include tests
- All existing tests must pass before merging
- Run `npm test` to execute the test suite

### PR Review Checklist
When preparing or reviewing a PR, always recommend whether any new settings should be tracked:
- If the feature introduces user-configurable behaviour, add a field to `AppSettings` (persisted via `useSettings` / localStorage) and expose a toggle in `SettingsScreen`.
- Add the new field with a sensible default to `DEFAULT_SETTINGS` for backwards compatibility with existing stored settings.
- Note in the PR description which, if any, new settings were added.
