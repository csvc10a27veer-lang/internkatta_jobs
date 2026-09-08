# InternKatta Hero Component - Integration Guide

## Overview

This is a pixel-faithful hero component for the InternKatta homepage featuring:
- Left side: Large headline, subheading, and primary CTA button
- Right side: Animated mosaic of colorful geometric blocks (no photos)
- Continuous, subtle animations
- Full accessibility support
- Performance optimized

---

## Files Structure

```
frontend/src/components/ui/
├── HeroNew.jsx              # Main React component
├── HeroMosaic.jsx           # Mosaic grid component
├── GeometricShapes.jsx      # SVG shape components
├── mosaic-tiles.json       # Tile layout configuration
├── Hero.html                # HTML fallback (static)
└── HERO_README.md          # This file

frontend/src/styles/
└── theme.tokens.css         # CSS variables for theme
```

---

## Installation & Setup

### 1. Import Theme Tokens

The theme tokens are already imported in `index.css`. If not, add:

```css
@import "./styles/theme.tokens.css";
```

### 2. Import Component

```jsx
import HeroNew from './components/ui/HeroNew';
```

### 3. Use in Homepage

```jsx
import HeroNew from '../components/ui/HeroNew';

const Home = () => {
  return (
    <div>
      <HeroNew />
      {/* Rest of your page */}
    </div>
  );
};
```

---

## Component Props

```jsx
<HeroNew
  label="LEARN WITH INTERNKATTA"           // Optional: Label above heading
  title="Unlock Your Potential..."         // Optional: Main heading
  subtitle="Your journey to..."            // Optional: Subheading text
  ctaText="EXPLORE COURSES"                // Optional: Button text
  ctaLink="/courses"                       // Optional: Button link
  enableParallax={true}                    // Optional: Enable mouse parallax
  className=""                              // Optional: Additional classes
/>
```

---

## Responsive Behavior

### Desktop (≥ 1100px)
- Left column: 40% width (max 480px)
- Right column: 60% width
- Mosaic: Full 3×4 grid, 160px blocks
- Mouse parallax: Enabled

### Tablet (640px - 1100px)
- Stacked or side-by-side layout
- Mosaic: 140px blocks
- Mouse parallax: Disabled

### Mobile (< 640px)
- Stacked vertically
- Mosaic: 100px blocks, 2 columns
- Mouse parallax: Disabled

---

## Accessibility Features

### 1. Reduced Motion Support

The component automatically detects `prefers-reduced-motion` and:
- Disables all animations
- Removes parallax effects
- Shows static mosaic

**Test reduced motion:**
- Chrome DevTools: Rendering → Emulate CSS media feature `prefers-reduced-motion`
- Or set in OS: System Preferences → Accessibility → Display → Reduce motion

### 2. Keyboard Navigation

- CTA button is fully keyboard accessible
- Focus ring: 3px soft-blue outline
- Tab order is logical

### 3. Screen Readers

- H1 heading is semantic
- Decorative SVGs have `aria-hidden="true"`
- Stat tiles have `aria-label` with descriptive text
- All interactive elements have proper labels

### 4. Color Contrast

- Text meets WCAG AA (4.5:1 minimum)
- Button: Brand-blue (#2563EB) on white = 4.6:1 ✓
- All stat tiles: White text on colored backgrounds = 4.5:1+ ✓

---

## Performance Optimization

### Animation Performance

- Uses `transform` and `opacity` only (GPU-accelerated)
- `will-change: transform` applied to animated tiles
- Animations use `requestAnimationFrame` for parallax
- Throttled mouse events (passive listeners)

### Asset Optimization

- All SVGs are inline (no HTTP requests)
- Small file sizes (< 1KB per shape)
- No raster images

### Performance Checklist

- [ ] Animations use `transform` only
- [ ] No layout thrashing
- [ ] `will-change` used sparingly
- [ ] Mouse events are throttled
- [ ] Reduced motion respected

---

## Animation Details

### Animation Types

1. **Bob**: Vertical movement (±6-12px)
2. **Scale**: Subtle size change (0.98-1.02)
3. **Parallax**: Horizontal movement (±6-8px)
4. **Rotate**: Gentle rotation (±2°)

### Animation Timing

- Duration: 6s - 14s (varies per tile)
- Easing: `cubic-bezier(0.22, 0.9, 0.36, 1)`
- Delay: Staggered (0s - 2s)
- Loop: Infinite

### Mouse Parallax

- Max movement: 8px
- Applied to entire mosaic container
- Disabled on mobile and reduced motion
- Throttled with `requestAnimationFrame`

---

## Toggle Animations (For Testing)

### Disable All Animations

In `HeroMosaic.jsx`, set:

```jsx
<HeroMosaic enableParallax={false} />
```

Or add CSS:

```css
.mosaic-tile-1,
.mosaic-tile-2,
/* ... all tiles ... */ {
  animation: none !important;
}
```

### Disable Parallax Only

```jsx
<HeroNew enableParallax={false} />
```

---

## Mosaic Tile Configuration

Edit `mosaic-tiles.json` to change:
- Tile colors
- Tile positions
- Animation types
- Stat values

**Example:**
```json
{
  "id": 1,
  "type": "rounded-square",
  "color": "#2563EB",
  "row": 1,
  "col": 1,
  "animation": {
    "type": "bob",
    "duration": 8,
    "delay": 0
  }
}
```

---

## Customization

### Change Colors

Update CSS variables in `theme.tokens.css`:

```css
:root {
  --color-brand-blue: #2563EB;
  --color-accent-orange: #FF8C42;
  /* ... */
}
```

### Change Typography

Update font sizes in `theme.tokens.css`:

```css
:root {
  --font-size-h1-desktop: 40px;
  --font-size-h1-mobile: 28px;
  /* ... */
}
```

### Change Spacing

```css
:root {
  --hero-padding-desktop: 100px;
  --mosaic-gap: 12px;
  /* ... */
}
```

---

## Troubleshooting

### Animations Not Working

1. Check browser DevTools → Console for errors
2. Verify `prefers-reduced-motion` is not enabled
3. Check CSS animations are loaded
4. Verify `will-change` is supported

### Mosaic Not Displaying

1. Check `mosaic-tiles.json` is imported correctly
2. Verify grid CSS is applied
3. Check block sizes are valid numbers
4. Inspect grid container in DevTools

### Performance Issues

1. Disable parallax: `enableParallax={false}`
2. Reduce animation complexity
3. Check `will-change` usage
4. Profile with Chrome DevTools Performance tab

### Accessibility Issues

1. Test with screen reader (NVDA/JAWS/VoiceOver)
2. Test keyboard navigation (Tab key)
3. Verify focus indicators visible
4. Check color contrast ratios

---

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support (parallax disabled)

---

## Testing Checklist

### Visual
- [ ] Left text block spacing matches mockup
- [ ] Mosaic structure matches 3×4 grid
- [ ] Colors match design system
- [ ] Typography sizes correct

### Animations
- [ ] Continuous, smooth motion
- [ ] No janky animations
- [ ] Reduced motion disables animations
- [ ] Parallax works on desktop only

### Performance
- [ ] 60fps animations (check DevTools)
- [ ] No layout shifts
- [ ] Fast initial load
- [ ] Smooth scrolling

### Accessibility
- [ ] Keyboard focus visible
- [ ] Screen reader announces correctly
- [ ] Color contrast passes
- [ ] Reduced motion respected

### Responsive
- [ ] Desktop layout (40/60 split)
- [ ] Tablet layout (stacked or side-by-side)
- [ ] Mobile layout (stacked)
- [ ] Block sizes adjust correctly

---

## Integration Example

```jsx
// pages/Home.jsx
import React from 'react';
import HeroNew from '../components/ui/HeroNew';

const Home = () => {
  return (
    <div>
      <HeroNew />
      {/* Other sections */}
    </div>
  );
};

export default Home;
```

---

## Static HTML Fallback

For email templates or non-React environments, use `Hero.html`:

1. Copy `Hero.html` to your static assets
2. Update paths if needed
3. Embed in your HTML page

**Note:** HTML version has no animations (static mosaic).

---

## Support & Questions

For issues or questions:
1. Check this README
2. Review component code comments
3. Test with reduced motion enabled
4. Verify browser console for errors

---

**Last Updated**: 2024
**Version**: 1.0

