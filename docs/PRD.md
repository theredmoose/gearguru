# GearGuru - Product Requirements Document

## Executive Summary

GearGuru is a mobile application designed to help families track body measurements, calculate equipment sizes, and manage sports gear inventory. As kids grow rapidly and participate in multiple winter sports, keeping track of current sizes and available equipment becomes challenging. GearGuru solves this problem by providing sizing calculators based on industry formulas, gear inventory management, and smart recommendations for equipment purchases.

---

## Problem Statement

Parents face several challenges when managing their family's sports activities:

1. **Rapid Growth**: Children grow quickly, making it difficult to know correct equipment sizes
2. **Complex Sizing Systems**: Different sports use different sizing systems (Mondopoint, EU, US, manufacturer-specific)
3. **Multiple Sports**: Families participating in Nordic, Alpine, snowboarding, and hockey need different gear sets
4. **Sizing Calculations**: Equipment sizing (ski length, pole length, boot size) requires formulas most parents don't know
5. **Scattered Information**: Measurements and gear info stored in spreadsheets, notes, photos
6. **Hand-Me-Down Tracking**: Difficulty knowing when gear will fit the next child

---

## Target Users

### Primary Users
- **Parents/Guardians**: Adults managing gear and sizes for family members
- **Age Range**: 25-55 years old
- **Sports Focus**: Winter sports families (Nordic skiing, Alpine skiing, snowboarding, hockey)

### Secondary Users
- **Extended Family**: Relatives who want to gift appropriate gear
- **Coaches/Team Managers**: May need to reference sizing for team equipment

---

## Product Goals

1. **Automate Size Calculations**: Provide sizing recommendations using industry formulas
2. **Track Body Measurements**: Record and track measurements over time for the whole family
3. **Manage Gear Inventory**: Create a comprehensive inventory with status tracking
4. **Enable Smart Handoffs**: Know when gear will fit the next family member
5. **Recommend Equipment**: Suggest appropriate gear based on measurements and skill level

---

## Core Features

### 1. Family Member Profiles

#### 1.1 Profile Management
- Create profiles for each family member with:
  - Name and photo
  - Date of birth (auto-calculates age)
  - Category: Adult (A), Youth (Y), or Child (C)
  - Sex (for gender-specific sizing)
  - Sports/activities and skill levels

#### 1.2 Body Measurements
Track comprehensive measurements in metric (with imperial display):

| Measurement | Unit | Used For |
|-------------|------|----------|
| Height | cm | Ski length, pole length |
| Weight | kg | Ski stiffness, board length |
| Foot Length | cm | Boot sizing (all sports) |
| Foot Width | cm | Boot last/width selection |
| Hand Length | cm | Glove sizing |
| Hand Width | cm | Glove sizing |
| Waist | cm | Clothing sizing |
| Head Circumference | cm | Helmet sizing |

#### 1.3 Measurement History
- Date-stamped measurement entries
- Track growth over time
- Support multiple entries per measurement type
- Use most recent value for calculations

#### 1.4 Skill Level Tracking
Per-sport skill levels:
- **Beginner**: First season, learning basics
- **Intermediate**: Comfortable on easy/moderate terrain
- **Advanced**: Confident on most terrain
- **Expert**: Aggressive, high-performance skiing

---

### 2. Sizing Calculators

#### 2.1 Shoe Size Conversions
Calculate from foot length (cm):

| Size System | Formula |
|-------------|---------|
| EU Size | (foot_cm + 2 × 0.667) / 0.667 |
| US Men's | (foot_cm + 2 × 0.847) / 0.847 − 24 |
| US Women's | (foot_cm + 2 × 0.847) / 0.847 − 23 |
| US Kids | foot_cm × 1.08 / 0.847 − 11.5 + 0.4 |

*Source: ISO specification (Gear Guru.xlsx > Lookup Data, rows 3-8)*

#### 2.2 Nordic Skiing Sizing

**Classic Skis (by height)**
- Formula: Height (cm) + 10 to 20 cm
- Display range: min/ideal/max

**Classic Skis (by weight - for kids)**
| Weight (kg) | Ski Length (cm) |
|-------------|-----------------|
| < 16 | 90-100 |
| 16-20 | 100-110 |
| 20-25 | 110-120 |
| 25-30 | 120-130 |
| 30-35 | 130-140 |
| 35-40 | 140-150 |
| 40-45 | 150-160 |
| 45+ | 160+ |

**Skate Skis**
- Formula: Height (cm) + 5 to 15 cm

**Classic Poles**
- Formula: Height × 0.83 (shoulder height)

**Skate Poles**
- Formula: Height × 0.89 (chin/nose height)

**Nordic Boot Size**
- Use EU shoe size calculation

*Sources: (Gear Guru.xlsx > Lookup Data)*
- *evo.com Kids Cross Country Ski Size Chart (rows 10-19)*
- *nordicskater.com Nordic Skater Ski and Pole Lengths (rows 95-115)*
- *Salomon Pole Size Guide - Classic: 0.83, Skate: 0.89 (rows 54-58)*
- *Highland Nordic Equipment Needs (rows 72-84)*
- *coastoutdoors.ca manufacturer-specific tables (rows 45-47)*

#### 2.3 Alpine Skiing Sizing

**Ski Length**
Based on height, weight, and skill level:
- Beginner: Height − 15 to 20 cm
- Intermediate: Height − 10 to 15 cm
- Advanced: Height − 5 to 10 cm
- Expert: Height − 0 to 5 cm

**Boot Sizing (Mondopoint)**
- Mondopoint = Foot length in cm × 10
- Example: 27 cm foot = 270 Mondopoint (size 27)
- Shell sizing for precise fit

**Boot Width (Last)**
| Category | Last Width |
|----------|------------|
| Narrow | ~98mm |
| Medium | ~100mm |
| Wide | ~102mm+ |

**Boot Flex Rating**
| Skier Type | Men's Flex | Women's Flex |
|------------|------------|--------------|
| Advanced | 100-120 | 90-110 |

*Sources: (Gear Guru.xlsx > Lookup Data)*
- *evo.com Adult Ski Size Chart (rows 148-187)*
- *evo.com Kids Ski Size Chart (rows 191-225)*
- *calconi.com Mondopoint Size Chart - ISO/TS 19407:2015 (rows 231-314)*
- *evo.com Mondopoint Conversion Chart (rows 318-360)*
- *Nordica Boot Last/Width Guide (rows 365-368)*
- *Nordica Boot Flex Charts - Men's, Women's, Youth (rows 370-381)*

#### 2.4 Snowboard Sizing

**Board Length**
Based on height and weight:
- Beginner: Chin height
- Intermediate: Nose height
- Advanced: Forehead to above head

**Boot Sizing**
- Use standard shoe size conversions

*Source: evo.com Kids Snowboard Size Chart (Gear Guru.xlsx > Lookup Data, rows 389-400)*

#### 2.5 Hockey Skate Sizing

**Skate Size**
- Approximate: US shoe size − 1 to 1.5
- Width/Fit options: D (regular), EE (wide)
- Brand-specific charts (Bauer, CCM)

*Source: Simple calculation (Gear Guru.xlsx > Measurements, rows 75-77)*

---

### 3. Gear Inventory

#### 3.1 Equipment Catalog
Add gear items with:
- **Basic Info**: Name, sport, type, brand, model
- **Sizing**: Size, shell size, last, flex (as applicable)
- **Details**: Color, sidecut, radius (for skis)
- **Assignment**: Current owner, year in use
- **Photo(s)**

#### 3.2 Sport Categories

**Phase 1 (MVP)**
- Nordic Skiing
  - Classic boots, skis, poles
  - Skate boots, skis, poles
  - Combi boots
- Alpine Skiing
- Nordic Skiing Classic
- Nordic Skiing Skate
- Snowboarding
  - Boots, boards, bindings

**Phase 2**
- Hockey
  - Skates, sticks, pads
- Custom categories

#### 3.3 Equipment Types

| Sport | Equipment Types |
|-------|-----------------|
| Nordic | boot classic, boot skate, boot combi, nordic skis classic, nordic skis skate, nordic skis backcountry, nordic poles classic, nordic poles skate |
| Alpine | boot, ski (Park, Cruiser, All-Mountain, Glade, Carving), poles, helmet, goggles |
| Snowboard | boot, board, bindings |
| Hockey | skates, stick, helmet, pads |

#### 3.4 Gear Status
- **Active**: Currently assigned and in use
- **Available**: In inventory, unassigned
- **Outgrown**: Too small for current owner
- **To Sell**: Marked for sale
- **Sold**: Sold/given away
- **Needs Repair**: Requires maintenance

---

### 4. Shopping Recommendations

#### 4.1 Size-Based Recommendations
- Calculate recommended sizes based on current measurements
- Show size ranges (min/ideal/max)
- Highlight when current gear is outgrown

#### 4.2 Skill-Based Recommendations
For each family member, based on:
- Current skill level
- Preferred terrain/style (groomer, all-mountain, park, etc.)
- Age-appropriate features

#### 4.3 Product Suggestions
Curated lists by category:
- Terrain Park/Freestyle
- Groomer Cruiser
- All-Mountain Versatile
- Glade/Tree Skiing
- Race/Performance

---

### 5. Smart Notifications

#### 5.1 Size Alerts
- Reminders to update measurements (configurable intervals)
- Alerts when gear likely outgrown based on growth
- Season prep reminders

#### 5.2 Hand-Me-Down Alerts
- Notify when younger child reaches size of available gear
- Timeline projections for gear transfers

#### 5.3 Maintenance Reminders
- Ski/board waxing schedules
- Boot buckle/liner checks
- Binding DIN checks

---

### 6. Data Entry

#### 6.1 Manual Entry
- Simple forms for measurements
- Quick-add for gear items

#### 6.2 Form Integration (Phase 2)
- Google Forms integration for family data entry
- Import from existing spreadsheets

#### 6.3 Professional Scan Import (Phase 2)
- Import foot scan data (Pure Foot Scan, etc.)
- Detailed measurements: instep height, heel width, forefoot width

---

## Technical Requirements

### Platform Support
- **iOS**: iOS 14.0 and later
- **Android**: Android 8.0 (API level 26) and later
- **Framework**: React Native for cross-platform development

### Data Storage
- Local-first architecture with cloud sync
- Offline functionality for core features
- Secure cloud backup

### Measurement System
- Store all measurements in metric internally
- Display in user-preferred units (metric/imperial)
- Automatic unit conversion

### Performance Requirements
- App launch time: < 2 seconds
- Calculation updates: Real-time
- Offline mode: Full functionality for read/calculate operations

### Security Requirements
- Local data encryption on device
- End-to-end encryption for cloud sync
- No sharing of personal information with third parties
- COPPA compliance

---

## User Experience

### Design Principles
1. **Calculation First**: Quick access to sizing calculations
2. **Family View**: Easy switching between family members
3. **Visual Sizing**: Clear display of recommended sizes
4. **Quick Update**: One-tap measurement updates

### Key Screens

#### Home Dashboard
- Family member cards with key measurements
- Quick-access sizing calculators
- Upcoming reminders
- Recent activity

#### Member Profile
- All measurements at a glance
- Calculated sizes for all sports
- Assigned gear list by sport
- Measurement history chart

#### Sizing Calculator
- Select sport and equipment type
- Input measurements (or pull from profile)
- Display calculated sizes with ranges
- Brand-specific notes

#### Gear Inventory
- Filter by: owner, sport, status, type
- Grid or list view
- Quick status updates
- Search functionality

---

## MVP Scope (Version 1.0)

### Included in MVP
- [ ] User authentication (email/password)
- [ ] Family member profiles with measurements
- [ ] Shoe size calculator (EU, US Men/Women/Kids)
- [ ] Nordic sizing calculator (skis, poles, boots)
- [ ] Alpine sizing calculator (skis, boots with Mondopoint)
- [ ] Basic gear inventory (add, edit, delete, view)
- [ ] Gear status tracking
- [ ] Photo capture for gear items
- [ ] Local data storage
- [ ] Search and filter functionality

### Deferred to Future Versions
- Cloud sync and backup
- Social login
- Snowboard/Hockey calculators
- Shopping recommendations
- Form/spreadsheet import
- Professional scan import
- Hand-me-down automation
- Notifications

---

## Future Roadmap

### Version 1.1
- Cloud sync and backup
- Snowboard sizing calculator
- Hockey skate sizing
- Enhanced notifications

### Version 1.2
- Shopping recommendations
- Growth history charts
- Export functionality
- Spreadsheet import

### Version 2.0
- Family sharing (multi-user)
- Professional foot scan import
- AI-powered recommendations
- Community gear exchange

---

## Appendix

*All formulas and lookup tables are sourced from: `requirements/Gear Guru.xlsx`*

### A. Sizing Formula Reference

#### Nordic Classic Skis
```
height_cm + 10 to 20 cm
```

#### Nordic Skate Skis
```
height_cm + 5 to 15 cm
```

#### Nordic Classic Poles
```
height_cm × 0.83
```

#### Nordic Skate Poles
```
height_cm × 0.89
```

#### EU Shoe Size
```
(foot_length_cm + 2 × 0.667) / 0.667
```

#### Mondopoint (Ski Boot)
```
foot_length_cm × 10
```

### B. Key Domain Concepts

- **Mondopoint**: Ski boot sizing system in mm (shell size = foot length in cm × 10, e.g., 27cm foot = size 270)
- **FA Value**: Fischer ski stiffness measurement (110-130% of body weight recommended)
- **Boot Last**: Width measurement in mm (narrow ~97mm, medium ~100mm, wide ~102mm+)
- **Flex Rating**: Boot stiffness - varies by gender and skill level
- **Shell Size**: Interior boot measurement for precise fit

### C. Data Model Summary

#### Family Member
- id, name, photo, birthday, sex, category (A/Y/C)
- Measurements[] (date, type, value)
- SkillLevels[] (sport, level)

#### Gear Item
- id, sport, type, brand, model, size
- shell_size, last, flex (for boots)
- color, sidecut, radius (for skis)
- owner_id, year_used, status
- photos[]

---

*Document Version: 0.3*
*Last Updated: January 2026*
*Author: GearGuru Product Team*

## Changelog

### v0.3 (January 2026)
- Added source references from Gear Guru.xlsx spreadsheet for all calculations
- Updated alpine ski types (Terrain Park/Freestyle, Groomer Cruiser, All-Mountain Versatile, Glade/Tree Skiing, Race/Performance Carving)
- Renamed nordic skis to: nordic skis classic, nordic skis skate, nordic skis backcountry

### v0.2 (January 2026)
- Added comprehensive sizing calculators with formulas
- Added Mondopoint and boot fitting details
- Added detailed measurement tracking requirements
- Added sport-specific equipment types
- Added shopping recommendations feature
- Refined gear inventory attributes
- Added sizing formula appendix
- Added data model summary
