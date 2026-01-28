# GearGuru

A mobile app to help parents track their children's sizes and manage sports gear inventory.

## Problem

Parents struggle to keep track of rapidly changing kids' sizes across multiple children and sports, leading to:
- Wrong size purchases
- Duplicate gear buying
- Forgotten equipment between seasons
- Missed hand-me-down opportunities

## Solution

GearGuru provides a centralized platform for:
- **Size Tracking** - Body measurements with growth history
- **Gear Inventory** - Equipment catalog organized by sport
- **Smart Sizing** - Auto-calculated sizes from measurements
- **Hand-Me-Down Management** - Sibling matching when gear is outgrown

## Sports Supported

| Phase | Sports |
|-------|--------|
| Phase 1 | Alpine Skiing, Nordic Skiing (Classic/Skate), Snowboarding |
| Phase 2 | Hockey, Mountain Biking, Lacrosse |
| Phase 3 | Custom categories |

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Database**: SQLite (local-first)
- **State**: Zustand
- **UI**: React Native Paper + NativeWind

## Documentation

- [Product Requirements (PRD)](docs/PRD.md) - v0.3
- [System Architecture](docs/ARCHITECTURE.md)
- [Requirements Spreadsheet](requirements/Gear%20Guru.xlsx)

## Key Features

### Size Tracking
- Metric measurements (height, weight, foot, hand, head, inseam)
- EU sizing as base with US/UK/Mondopoint conversions
- Manufacturer-specific sizing references

### Gear Inventory
- Track equipment by sport, child, and status
- Status options: Active, Stored, Outgrown, Loaned, Needs Replacement, Retired
- Photo capture and brand/model tracking

### Privacy
- Local-first architecture (works offline)
- COPPA compliant
- No third-party data sharing

## Project Status

**Current Phase**: Documentation & Planning

- [x] Product Requirements Document (PRD v0.3)
- [x] System Architecture
- [x] Requirements Spreadsheet
- [ ] Project Setup (Expo + TypeScript)
- [ ] Database Layer
- [ ] Core Screens
- [ ] MVP Release

## License

Private - All rights reserved
