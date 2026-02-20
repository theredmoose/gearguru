# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gear Guru is a personal sports equipment sizing database and calculator for tracking family members' measurements and calculating appropriate gear sizes across multiple sports:

- **Nordic skiing** (classic, skate, combi) - ski length, pole length, boot sizing
- **Alpine skiing** - ski length by age/height/weight, boot sizing (Mondopoint), flex ratings
- **Snowboarding** - board length by height/weight
- **Hockey** - skate sizing with width/fit conversions (Bauer, CCM)

The application manages personal measurements (height, weight, foot dimensions, etc.) and uses sizing formulas from various manufacturer charts to recommend appropriate equipment sizes.

## Project Status

This project is in the requirements/planning phase. The requirements specification is in `docs/requirements/Gear Guru.xlsx` which contains:
- Data entry forms for family member measurements
- Lookup tables for equipment sizing from various vendors
- Sizing calculation formulas and conversion charts
- Existing gear inventory tracking

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

### Workflow
1. **Create a feature branch** from `main` before making changes
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
