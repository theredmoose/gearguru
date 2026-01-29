# Test Cases Documentation

## 1. Sizing Service Tests

### 1.1 Nordic Ski Sizing

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| NORDIC-001 | Skill level affects ski length | Beginner gets shorter skis, expert gets longer |
| NORDIC-002 | Classic vs Skate pole length | Skate poles are longer than classic poles |
| NORDIC-003 | Weight adjustment (heavy) | >80kg adds +2cm to ski length |
| NORDIC-004 | Weight adjustment (light) | <60kg subtracts -2cm from ski length |
| NORDIC-005 | Combi style sizing | Falls between classic and skate |

### 1.2 Nordic Boot Sizing

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| NORDIC-BOOT-001 | Mondopoint calculation | Foot length × 10 = Mondopoint |
| NORDIC-BOOT-002 | Uses larger foot | Max of left/right foot for sizing |
| NORDIC-BOOT-003 | EU/US conversion | Returns valid EU and US sizes |

### 1.3 Alpine Ski Sizing

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| ALPINE-001 | Beginner vs Expert length | Beginners get chin height, experts get head height |
| ALPINE-002 | Gender adjustment | Female skiers get -3cm offset |
| ALPINE-003 | DIN range validity | DIN values between 1-12 |
| ALPINE-004 | Skill affects DIN | Higher skill = higher DIN |

### 1.4 Alpine Boot Sizing

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| ALPINE-BOOT-001 | Mondopoint/Shell calculation | Shell size = rounded foot length |
| ALPINE-BOOT-002 | Default width | No measurement defaults to medium (100mm) |
| ALPINE-BOOT-003 | Narrow foot detection | Low width ratio → narrow last |
| ALPINE-BOOT-004 | Wide foot detection | High width ratio → wide/extra-wide last |
| ALPINE-BOOT-005 | Flex by skill | Beginner 60-80, Expert 120-140 |
| ALPINE-BOOT-006 | Flex gender adjustment | Female gets -15 flex reduction |

### 1.5 Snowboard Sizing

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| SNOWBOARD-001 | Board length from height | Height - 10 to - 25 range |
| SNOWBOARD-002 | Skill affects length | Expert gets longer board |
| SNOWBOARD-003 | Waist width from boot | Larger boot = wider waist |
| SNOWBOARD-004 | Stance width | Based on height (28-33% of height) |

### 1.6 Hockey Skate Sizing

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| HOCKEY-001 | Skate smaller than shoe | Skate size = shoe size - 1.5 |
| HOCKEY-002 | Bauer width codes | Returns C, D, or EE |
| HOCKEY-003 | CCM width codes | Returns C, D, EE, R, or W |
| HOCKEY-004 | Default width | No measurement defaults to D |
| HOCKEY-005 | Narrow foot detection | Low ratio → C width |

---

## 2. Shoe Size Conversion Tests

### 2.1 Conversion Accuracy

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| SHOE-001 | CM to Mondopoint | 27cm → 270 MP |
| SHOE-002 | CM to EU | 27cm → ~43 EU |
| SHOE-003 | CM to UK | 27cm → ~15 UK |
| SHOE-004 | CM to US Men | 27cm → ~16 US M |
| SHOE-005 | CM to US Women | 27cm → ~17.5 US W |

### 2.2 Round-Trip Accuracy

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| SHOE-RT-001 | CM → EU → CM | Returns original ±1 |
| SHOE-RT-002 | CM → UK → CM | Returns original ±1 |
| SHOE-RT-003 | CM → US Men → CM | Returns original ±1 |
| SHOE-RT-004 | CM → Mondopoint → CM | Returns exact original |

### 2.3 Edge Cases

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| SHOE-EDGE-001 | Small foot (18cm) | Returns valid child sizes |
| SHOE-EDGE-002 | Large foot (32cm) | Returns valid large sizes |
| SHOE-EDGE-003 | Half sizes | Rounds to nearest 0.5 |

---

## 3. Component Tests

### 3.1 MemberForm

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| FORM-001 | Empty name validation | Shows "Name is required" error |
| FORM-002 | Empty DOB validation | Shows "Date of birth is required" error |
| FORM-003 | Zero height validation | Shows "Height must be greater than 0" error |
| FORM-004 | Add mode title | Shows "Add Family Member" |
| FORM-005 | Edit mode pre-fill | Pre-fills form with existing data |
| FORM-006 | Submit calls handler | Calls onSubmit with form data |
| FORM-007 | Cancel button | Calls onCancel |
| FORM-008 | Gender default | Defaults to "male" |

### 3.2 MemberCard

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| CARD-001 | Display name | Shows member name |
| CARD-002 | Display avatar | Shows first letter of name |
| CARD-003 | Display measurements | Shows height and weight |
| CARD-004 | Click selects | Clicking card calls onSelect |
| CARD-005 | Edit button | Calls onEdit, doesn't trigger onSelect |
| CARD-006 | Delete confirmation | Shows confirm dialog |
| CARD-007 | Delete when confirmed | Calls onDelete |
| CARD-008 | No delete when cancelled | Doesn't call onDelete |

### 3.3 SportSizing

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| SPORT-001 | Default tab | Shows Nordic Classic by default |
| SPORT-002 | Tab switching | Clicking tab changes content |
| SPORT-003 | Skill selector visible | Shows skill buttons for non-hockey |
| SPORT-004 | Hockey hides skill | No skill buttons for hockey |
| SPORT-005 | Skill change updates sizing | Changing skill updates displayed values |
| SPORT-006 | Back button | Calls onBack |
| SPORT-007 | Swipe indicators | Shows 5 dots, active dot matches current tab |

### 3.4 ShoeSizeConverter

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| CONVERT-001 | Pre-fill from foot | Shows foot length when provided |
| CONVERT-002 | Default system | CM when foot provided, EU otherwise |
| CONVERT-003 | Empty shows dashes | Shows "-" when no input |
| CONVERT-004 | Input updates results | Entering value shows conversions |
| CONVERT-005 | Highlight input system | Input system has special style |
| CONVERT-006 | Back button | Calls onClose |

---

## 4. Utility Function Tests

### 4.1 Age Calculation

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| AGE-001 | Birthday passed | Returns correct age |
| AGE-002 | Birthday not yet | Returns age - 1 |
| AGE-003 | Birthday today | Returns correct age |
| AGE-004 | Child age | Returns small number for recent DOB |

### 4.2 Size Range Formatting

| Test ID | Description | Expected Behavior |
|---------|-------------|-------------------|
| FORMAT-001 | Range format | Returns "160-170 cm" |
| FORMAT-002 | Same min/max | Returns "165 cm" (single value) |
| FORMAT-003 | Default unit | Uses "cm" when not specified |
