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



## Best Practise 

Always create a new branch for changes moving forward. Use standard naming conventions such as : /feature /fix /update before the actual branch name.
