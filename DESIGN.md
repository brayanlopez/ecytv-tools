# ECYTV Tools — DESIGN.md

## Design Philosophy

ECYTV Tools is an institutional productivity platform.
The UI should feel:

- professional
- calm
- operational
- efficient
- accessible
- maintainable

Avoid:

- flashy gradients
- excessive shadows
- overly playful visuals
- unnecessary animations

Primary inspiration:

- GitHub
- Linear
- Vercel
- Radix UI
- shadcn/ui

---

# Core Principles

1. Consistency over creativity
2. Accessibility first
3. Dense but readable interfaces
4. Fast scanning
5. Reusable patterns
6. Minimal visual noise

---

# Grid & Layout

## Container Widths

- Content max width: 1440px
- Reading width: 720px
- Dashboard padding desktop: 32px
- Dashboard padding mobile: 16px

## Grid

Use 12-column responsive grid.

### Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1440px

---

# Spacing System

Use 4px base grid.

## Spacing Tokens

- space-1: 4px
- space-2: 8px
- space-3: 12px
- space-4: 16px
- space-5: 20px
- space-6: 24px
- space-8: 32px
- space-10: 40px
- space-12: 48px
- space-16: 64px

Rules:

- Related elements stay close together
- Unrelated sections use 2x spacing
- Never use arbitrary spacing values

---

# Typography

## Font

Primary:

- Inter

Fallback:

- system-ui
- sans-serif

## Typography Scale

### Display

- 48px
- weight 700
- line-height 1.1

### H1

- 36px
- weight 700

### H2

- 28px
- weight 600

### H3

- 22px
- weight 600

### Body

- 16px
- weight 400
- line-height 1.6

### Small

- 14px

### Caption

- 12px

---

# Colors

## Primary

Teal:

- primary-500: #0F9D8A
- primary-600: #0B7D6E

## Neutral

- background: #F8FAFC
- surface: #FFFFFF
- border: #E5E7EB
- text-primary: #111827
- text-secondary: #6B7280

## Semantic

- success
- warning
- danger
- info

Must meet WCAG AA contrast.

---

# Radius

- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px

Do not mix arbitrary radii.

---

# Shadows / Elevation

## Elevation Levels

### Level 0

No shadow

### Level 1

Subtle card shadow

### Level 2

Dropdowns

### Level 3

Modals

Avoid heavy shadows.

---

# Components

## Buttons

### Variants

- primary
- secondary
- ghost
- link
- destructive

Rules:

- Avoid too many primary buttons on screen
- Documentation cards should prefer secondary or ghost

---

## Cards

### Default Card

- padding: 24px
- radius: 16px
- border: 1px solid neutral
- subtle hover state

Rules:

- Avoid excessive vertical height
- Prioritize scanability

---

## Documentation Cards

Compact mode required.

Structure:

1. Icon
2. Title
3. Category
4. Short description
5. Metadata tags
6. Action

---

# Navigation

Top navigation must:

- clearly indicate active state
- support keyboard navigation
- have visible hover/focus states

---

# Responsive Rules

## Mobile

Prioritize:

- vertical scanning
- condensed spacing
- reduced card height

Avoid:

- giant cards
- duplicated metadata
- excessive whitespace

---

# Accessibility

Minimum requirements:

- WCAG AA contrast
- keyboard navigation
- visible focus rings
- 44x44px target sizes
- semantic HTML
- ARIA labels where needed

---

# Motion

Animations must:

- be subtle
- under 200ms
- never block interaction

Avoid decorative animations.

---

# Iconography

Use:

- Lucide icons

Rules:

- consistent stroke width
- avoid mixing filled and outline styles

---

# Design Tokens

All visual values must use tokens.

Never hardcode:

- colors
- spacing
- shadows
- radius
- typography sizes

---

# Agent Rules

When implementing UI:

1. Reuse existing components
2. Respect spacing scale
3. Do not invent new colors
4. Prefer composition over duplication
5. Maintain accessibility
6. Optimize for scanning speed
7. Keep interfaces visually calm

---

# Preferred Stack

- CSS variables
- Lucide Icons

---

# Future Improvements

- global search
- command palette
- saved filters
- favorites
- compact density mode
- dark mode refinement
- keyboard shortcuts
