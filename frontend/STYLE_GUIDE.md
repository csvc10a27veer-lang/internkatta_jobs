# InternKatta UI Style Guide

## Design System Overview

This style guide defines the visual language and design tokens for the InternKatta platform redesign, ensuring consistency, accessibility, and professional appearance across all components.

---

## 🎨 Color Palette

### Primary Colors
- **Brand Blue**: `#2563EB` - Primary brand color for buttons, links, and key UI elements
- **Brand Blue 700**: `#1E4ED8` - Hover/focus states for brand blue
- **Brand Purple**: `#6366F1` - Secondary accent for gradients and highlights

### Accent Color
- **Accent Orange**: `#FF8C42` - **Use sparingly** - Only for the single most important CTA or urgent badges

### Neutral Colors
- **Surface**: `#F8FAFC` - Card and section backgrounds
- **Muted**: `#6B7280` - Secondary text, labels, and less important information
- **Text**: `#0F172A` - Primary body text
- **Border**: `#E6E9EE` - Dividers, borders, and separators

### Usage Rules
- **Brand Blue** is the primary color - use for primary actions, links, and key elements
- **Accent Orange** should appear **only once per page** - reserved for the most important CTA
- **Gradients** are minimal - only use on homepage hero and at most one promo banner
- Maintain contrast ratios of **≥4.5:1** for text against backgrounds

---

## 📝 Typography

### Font Families
- **Headline Font**: Poppins (weights: 600, 700)
- **Body Font**: Inter (weights: 400, 500)

### Font Sizes (Desktop)
- **H1**: 40px (line-height: 1.2, weight: 700) - Main page titles
- **H2**: 28px (line-height: 1.3, weight: 600) - Section headings
- **H3**: 20px (line-height: 1.4, weight: 600) - Subsection headings
- **Body**: 15px (line-height: 1.6, weight: 400) - Default text
- **Small**: 13px (line-height: 1.5, weight: 400) - Labels, captions

### Responsive Typography
- On mobile/tablet, scale down proportionally (typically 80-90% of desktop sizes)

---

## 📏 Spacing System

### Base Unit
- **Base Unit**: 8px - All spacing values are multiples of 8px

### Section Padding
- **Desktop**: 64px vertical padding
- **Tablet**: 40px vertical padding
- **Mobile**: 24px vertical padding

### Container Width
- **Max Width**: 1100px - Main content container

### Common Spacing Values
- `4px` (0.5 unit) - Tight spacing
- `8px` (1 unit) - Base spacing
- `16px` (2 units) - Standard spacing
- `24px` (3 units) - Comfortable spacing
- `32px` (4 units) - Section spacing
- `48px` (6 units) - Large spacing
- `64px` (8 units) - Section padding

---

## 🔲 Border Radius

- **Card Radius**: 8px - Standard cards and containers
- **Hero CTA Radius**: 12px - Primary call-to-action buttons in hero sections
- **Button Radius**: 10px - Standard buttons
- **Tag/Chip Radius**: Full (pill-shaped) - Category tags and badges

---

## 🌑 Shadows

- **Card Shadow**: `0 6px 20px rgba(2, 6, 23, 0.06)` - Standard card elevation
- **Hover Shadow**: Slightly stronger shadow on hover (increase opacity to 0.1)

---

## 🔘 Buttons

### Primary Button
- **Style**: Filled with brand-blue background, white text
- **Border Radius**: 10px
- **Padding**: 12px 24px (desktop), 10px 20px (mobile)
- **Font**: Inter, 500 weight, 15px
- **Hover**: Background changes to brand-blue-700
- **Focus**: Visible soft-blue glow outline (accessibility requirement)

### Secondary Button
- **Style**: White background, 1px border (#E6E9EE), brand-blue text
- **Border Radius**: 10px
- **Padding**: Same as primary
- **Hover**: Light gray background (#F8FAFC)
- **Focus**: Visible soft-blue glow outline

### Accent Button (Limited Use)
- **Style**: Filled with accent-orange background, white text
- **Usage**: **Only one per page** - for the most important CTA
- **Border Radius**: 10px
- **Same padding and hover behavior as primary**

### Button States
- **Default**: As defined above
- **Hover**: Subtle lift (translateY -2px to -6px) + stronger shadow
- **Active**: Slight scale down (0.98)
- **Disabled**: 50% opacity, no pointer events
- **Focus**: Visible outline (2px solid brand-blue with 4px offset)

---

## 🏷️ Tags & Chips

### Style
- **Shape**: Pill-shaped (fully rounded)
- **Size**: Small - typically 24-28px height
- **Padding**: 6px 12px
- **Font**: Inter, 500 weight, 13px
- **Background**: Light gray (#F8FAFC) or brand-blue (for selected)
- **Text**: Muted (#6B7280) or white (on colored background)
- **Border**: Optional 1px border (#E6E9EE) for subtle variants

### Usage
- Use for categories, difficulty levels, and metadata
- Replace large colored icons with small tag chips
- Keep consistent sizing across all tags

---

## 📐 Grid System

### Listing Grid Breakpoints
- **Mobile** (< 768px): 1 column
- **Tablet** (768px - 1023px): 2 columns
- **Laptop** (1024px - 1399px): 2 columns
- **Desktop** (≥ 1400px): 3 columns

### Card Requirements
- **Uniform Heights**: All cards in a grid must have the same height
- **Thumbnail Ratio**: 4:3 preferred
- **Thumbnail Height**: 120-140px
- **Gap**: 16px between cards

---

## 🎯 Component-Specific Rules

### Cards
- **Height**: Uniform within grid
- **Thumbnail**: 4:3 ratio, 120-140px height
- **Hover**: Subtle lift (translateY -2px to -6px) + stronger shadow
- **Transition**: Quick (200-300ms)

### Filters Sidebar
- **Desktop**: Sticky positioning
- **Mobile**: Slide-in overlay with backdrop
- **Collapsible Groups**: Category, Duration, Price, Difficulty
- **Selected Counts**: Show number of selected filters per group
- **Clear All**: Prominent button at top

### Detail Pages
- **Hero Height**: Reduced (not full viewport)
- **Tags**: Display under title
- **Sidebar CTA**: Right sidebar on desktop
- **Mobile Sticky CTA**: Full-width, 56px height, appears after scroll

### Skeleton Loaders
- **Required**: All list views must show skeleton states while loading
- **Style**: Animated pulse with gray backgrounds
- **Layout**: Match actual card structure

---

## ♿ Accessibility Guidelines

### Contrast Requirements
- **Text on Background**: Minimum 4.5:1 contrast ratio
- **Large Text** (18px+): Minimum 3:1 contrast ratio
- **Interactive Elements**: Minimum 3:1 contrast ratio

### Keyboard Navigation
- **Focus Indicators**: Visible on all interactive elements
- **Focus Style**: Soft-blue glow (2px solid brand-blue, 4px offset)
- **Tab Order**: Logical and intuitive
- **Skip Links**: Available for main content

### ARIA Roles
- Use semantic HTML where possible
- Add ARIA labels for icon-only buttons
- Provide descriptive alt text for images
- Use proper heading hierarchy (h1 → h2 → h3)

### Screen Reader Support
- All images have descriptive alt text
- Form inputs have associated labels
- Error messages are announced
- Loading states are communicated

---

## 📱 Responsive Design

### Mobile-First Approach
- Design for mobile first, then enhance for larger screens
- Use breakpoints: 768px (tablet), 1024px (laptop), 1400px (desktop)

### Touch Targets
- Minimum 44x44px for touch elements
- Adequate spacing between interactive elements

### Performance
- Lazy-load images in list views
- Use skeleton loaders to avoid blank screens
- Optimize images (WebP format, appropriate sizes)

---

## 🎨 Visual Consistency

### Gradients
- **Minimal Usage**: Only homepage hero and at most one promo banner
- **Hero Gradient**: Blue → Purple (from brand-blue to brand-purple)

### Icons
- Use consistent icon library (Heroicons or Lucide)
- Size: 20-24px for standard use
- Color: Match text color or use brand-blue

### Images
- **Thumbnails**: 4:3 aspect ratio, 120-140px height
- **Alt Text**: Descriptive and meaningful
- **Lazy Loading**: Enabled for list views

---

## ✅ Quick Reference Checklist

### Before Deploying Any Component:
- [ ] Uses brand-blue as primary color (accent-orange only for single CTA)
- [ ] Text contrast meets 4.5:1 minimum
- [ ] Focus states are visible on all interactive elements
- [ ] Responsive breakpoints implemented correctly
- [ ] Skeleton loader included for loading states
- [ ] Images have descriptive alt text
- [ ] Hover interactions are subtle and quick (200-300ms)
- [ ] Card heights are uniform in grids
- [ ] Typography follows size hierarchy
- [ ] Spacing uses 8px base unit

---

## 📚 Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: 2024
**Version**: 1.0

