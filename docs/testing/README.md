# Testing Guide

## Overview

Gear Guru uses [Vitest](https://vitest.dev/) for testing with React Testing Library for component tests. The test suite covers:

- **Unit tests** for pure functions (sizing calculations, shoe size conversions)
- **Component tests** for React components
- **Integration tests** with mocked Firebase

## Running Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode (re-runs on file changes)
npm test

# Run with coverage report
npm run test:coverage

# Open visual test UI
npm run test:ui
```

## Test Structure

```
src/
├── services/__tests__/
│   ├── sizing.test.ts       # Sizing calculation tests
│   └── shoeSize.test.ts     # Shoe size conversion tests
├── components/__tests__/
│   ├── MemberForm.test.tsx  # Form validation tests
│   ├── MemberCard.test.tsx  # Card display/interaction tests
│   ├── SportSizing.test.tsx # Sport tab switching tests
│   └── ShoeSizeConverter.test.tsx
└── hooks/__tests__/         # (Future: hook tests)

tests/
├── setup.ts                 # Global test setup
└── fixtures/
    ├── measurements.ts      # Sample measurement data
    └── familyMembers.ts     # Sample family member data
```

## Writing Tests

### Unit Tests (Services)

For pure functions like sizing calculations:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateNordicSkiSizing } from '../sizing';
import { MEASUREMENTS } from '@tests/fixtures/measurements';

describe('calculateNordicSkiSizing', () => {
  it('calculates ski length based on height and skill', () => {
    const result = calculateNordicSkiSizing(
      MEASUREMENTS.adultMale,
      'nordic-classic',
      'intermediate'
    );
    expect(result.skiLengthRecommended).toBeGreaterThan(180);
  });
});
```

### Component Tests

For React components, use React Testing Library:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberCard } from '../MemberCard';
import { FAMILY_MEMBERS } from '@tests/fixtures/familyMembers';

describe('MemberCard', () => {
  it('displays member name', () => {
    render(
      <MemberCard
        member={FAMILY_MEMBERS.john}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Fixtures

Test fixtures provide consistent sample data. Use factory functions to create test data:

```typescript
import { createFamilyMember, FAMILY_MEMBERS } from '@tests/fixtures/familyMembers';
import { createMeasurements, MEASUREMENTS } from '@tests/fixtures/measurements';

// Use pre-defined fixtures
const john = FAMILY_MEMBERS.john;
const adultMale = MEASUREMENTS.adultMale;

// Or create custom fixtures
const customMember = createFamilyMember({
  name: 'Custom Name',
  measurements: createMeasurements({ height: 200 }),
});
```

## Coverage

Run `npm run test:coverage` to generate a coverage report. The project targets 80% coverage across:

- Lines
- Functions
- Branches
- Statements

Coverage reports are generated in `./coverage/` directory.

## CI/CD

Tests run automatically on:
- Every push to `main`
- Every pull request targeting `main`

See `.github/workflows/test.yml` for the CI configuration.
