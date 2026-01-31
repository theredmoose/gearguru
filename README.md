# GearGuru

A mobile-first web app to help families track body measurements and get equipment sizing recommendations for sports gear.

## Features

- **Family Member Profiles** - Track measurements for each family member
- **Equipment Sizing** - Auto-calculated sizes for skis, boots, boards, and skates
- **Shoe Size Converter** - Convert between EU, US, UK, and Mondopoint systems
- **Multi-Sport Support** - Nordic, Alpine, Snowboard, and Hockey sizing

## Sports Supported

| Sport | Equipment Sized |
|-------|-----------------|
| Nordic Classic | Skis, Poles, Boots |
| Nordic Skate | Skis, Poles, Boots |
| Alpine Skiing | Skis, Boots, DIN Settings |
| Snowboarding | Board, Boots, Stance |
| Hockey | Skates (Bauer, CCM) |

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Database**: Firebase Firestore
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/theredmoose/gearguru.git
cd gearguru

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a Web app to the project
4. Copy the config values to `.env.local`
5. Enable Firestore in the console
6. Deploy security rules: `firebase deploy --only firestore:rules`

### Development

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/       # React components
├── services/         # Business logic (sizing, conversions)
├── hooks/            # React hooks (Firebase integration)
├── types/            # TypeScript type definitions
└── config/           # Firebase configuration

tests/
├── fixtures/         # Test data
└── setup.ts          # Test environment setup

docs/
├── testing/          # Testing documentation
└── PRD.md            # Product requirements
```

## Test Coverage

All tests pass with 80%+ coverage:

| Area | Tests |
|------|-------|
| Sizing Calculations | 39 |
| Shoe Conversions | 35 |
| Component Tests | 49 |
| **Total** | **123** |

## Sizing Formulas

### Nordic Skiing
- Classic Ski: height + 10-20cm (skill dependent)
- Skate Ski: height + 5-15cm (skill dependent)
- Classic Poles: height × 0.83
- Skate Poles: height × 0.89-0.91

### Alpine Skiing
- Ski Length: chin to forehead height (skill dependent)
- DIN: 1-12 (weight and skill dependent)
- Boot Flex: 60-140 (skill and gender dependent)

### Snowboard
- Board Length: height - 15-25cm (skill dependent)
- Waist Width: based on boot size

### Hockey
- Skate Size: shoe size - 1.5 (runs smaller than shoes)

## License

Private - All rights reserved
