# Hero Component QA Checklist

## Overview
This checklist verifies that the Hero component matches the mockup and meets all requirements for layout, overflow prevention, animations, and accessibility.

---

## ✅ Layout & Overflow Tests

### Desktop (≥1100px)
- [ ] **No horizontal scrollbar** at 1366×768
- [ ] **No horizontal scrollbar** at 1280×800
- [ ] **No horizontal scrollbar** at 1920×1080
- [ ] Left column is **vertically centered** (using `items-center` on grid)
- [ ] Left column has **max-width: 480px**
- [ ] Right mosaic is **constrained** and does not overflow container
- [ ] Layout follows **40% / 60%** split (left col-span-5, right col-span-7)
- [ ] Container is **centered** with max-width 1100px

### Tablet (640px - 1100px)
- [ ] **No horizontal scrollbar** at 1024×768
- [ ] **No horizontal scrollbar** at 768×1024
- [ ] Layout stacks or maintains two-column
- [ ] Mosaic tiles scale to **120-140px**
- [ ] Mosaic wrapper has `overflow: hidden`

### Mobile (<640px)
- [ ] **No horizontal scrollbar** at 375×812 (iPhone X)
- [ ] **No horizontal scrollbar** at 414×896 (iPhone 11)
- [ ] Layout stacks **vertically**
- [ ] Mosaic collapses to **2 columns** or single column
- [ ] Tile sizes are **90-110px**
- [ ] No overflow from animations

---

## ✅ Tile Sizing & Uniformity

- [ ] All tiles have **explicit width and height** (no flex-grow/auto)
- [ ] Desktop tiles are **140px × 140px**
- [ ] Tablet tiles are **120px × 120px**
- [ ] Mobile tiles are **100px × 100px**
- [ ] Tiles do not grow beyond their grid cell
- [ ] Mosaic grid uses `grid-template-columns: repeat(3, var(--tile-size))`
- [ ] Mosaic wrapper max-width: `calc(3 * var(--tile-size) + 2 * gap)`

---

## ✅ Animations & Parallax

### Animation Behavior
- [ ] Animations use **transform and opacity only** (no layout/paint)
- [ ] All animated tiles have `will-change: transform`
- [ ] Animations are **continuous and smooth**
- [ ] No janky or stuttering animations
- [ ] Animations do not cause layout shifts

### Reduced Motion Support
- [ ] **`prefers-reduced-motion: reduce`** disables all animations
- [ ] **`data-motion="off"`** on `.hero` disables all animations
- [ ] Parallax is disabled when reduced motion is enabled
- [ ] Static mosaic displays correctly when animations disabled

### Parallax Behavior
- [ ] Mouse parallax works on **desktop only** (≥1024px)
- [ ] Parallax is **disabled on touch devices**
- [ ] Parallax movement is **limited to 6-8px max**
- [ ] Parallax uses `transform: translate3d()` for GPU acceleration
- [ ] Parallax is throttled with `requestAnimationFrame`
- [ ] Parallax does not cause horizontal scroll

### QA Toggle Test
- [ ] Add `data-motion="off"` to `.hero` element
- [ ] Verify all animations stop
- [ ] Verify parallax stops
- [ ] Remove attribute - animations resume

---

## ✅ Accessibility

### Keyboard Navigation
- [ ] **Tab to CTA button** - visible focus ring (3px soft-blue)
- [ ] Focus ring is **visible and clear**
- [ ] Tab order is logical (label → heading → text → button)

### Screen Readers
- [ ] H1 heading is **semantic** (`<h1>`)
- [ ] Decorative SVGs have `aria-hidden="true"`
- [ ] Stat tiles have `aria-label` with descriptions
- [ ] All interactive elements are labeled

### Color Contrast
- [ ] CTA button: **4.6:1** contrast (WCAG AA ✓)
- [ ] Stat tiles: **4.5:1+** contrast (WCAG AA ✓)
- [ ] All text meets contrast requirements

### Reduced Motion
- [ ] Test with Chrome DevTools → Rendering → "prefers-reduced-motion"
- [ ] Verify animations are disabled
- [ ] Verify parallax is disabled
- [ ] Content is still readable and functional

---

## ✅ Performance

### Animation Performance
- [ ] Open Chrome DevTools → Performance tab
- [ ] Record while scrolling and interacting
- [ ] Verify **60fps** maintained
- [ ] No layout thrashing (check "Layout" in Performance)
- [ ] No paint thrashing (check "Paint" in Performance)
- [ ] Only `transform` and `opacity` properties change

### Network & Load
- [ ] Fast initial load
- [ ] No blocking resources
- [ ] SVGs are inline (no extra HTTP requests)

---

## ✅ Responsive Breakpoints

### Desktop (≥1100px)
- [ ] Left column: **col-span-5** (max 480px)
- [ ] Right column: **col-span-7**
- [ ] Mosaic: **3×4 grid**, 140px tiles
- [ ] Parallax: **Enabled**

### Tablet (640px - 1100px)
- [ ] Layout: **Stacked or two-column**
- [ ] Mosaic: **3×4 grid**, 120px tiles
- [ ] Parallax: **Disabled**

### Mobile (<640px)
- [ ] Layout: **Stacked vertically**
- [ ] Mosaic: **2 columns** or single column
- [ ] Tiles: **100px**
- [ ] Parallax: **Disabled**

---

## ✅ Visual Match to Mockup

- [ ] Left text block spacing matches mockup
- [ ] Mosaic structure matches **3×4 grid**
- [ ] Tile colors match design system
- [ ] Typography sizes correct (H1: 40px desktop, 32px tablet, 28px mobile)
- [ ] Button styling matches (48px height, 50px radius, shadow)
- [ ] Overall proportions: **left ~40% (max 480px), right ~60%**

---

## 🧪 Testing Steps

### 1. Test Overflow Prevention
```
1. Open page at 1366×768
2. Scroll horizontally - should NOT be possible
3. Check DevTools → Elements → body → computed styles
4. Verify no elements extend beyond viewport width
```

### 2. Test Reduced Motion
```
1. Chrome DevTools → Rendering tab
2. Enable "prefers-reduced-motion"
3. Reload page
4. Verify animations are disabled
5. Verify parallax is disabled
```

### 3. Test data-motion Toggle
```
1. Open browser console
2. Run: document.querySelector('.hero').setAttribute('data-motion', 'off')
3. Verify animations stop immediately
4. Run: document.querySelector('.hero').removeAttribute('data-motion')
5. Verify animations resume
```

### 4. Test Performance
```
1. Chrome DevTools → Performance tab
2. Click "Record"
3. Scroll page and move mouse
4. Stop recording
5. Check FPS (should be 60fps)
6. Check "Layout" and "Paint" (should be minimal)
```

### 5. Test Responsive
```
1. Chrome DevTools → Toggle device toolbar
2. Test at: 375px, 768px, 1024px, 1280px, 1366px
3. Verify no horizontal scroll at any size
4. Verify layout adapts correctly
```

---

## 📸 Screenshots Required

### Before (Current Broken State)
- [ ] Desktop 1366×768 - showing overflow issues
- [ ] Mobile 375×812 - showing layout issues

### After (Fixed State)
- [ ] Desktop 1366×768 - no overflow, proper layout
- [ ] Mobile 375×812 - stacked layout, no overflow

### Additional
- [ ] Tablet 1024×768 - two-column or stacked
- [ ] Focus state on CTA button

---

## ✅ Final Verification

- [ ] All checklist items pass
- [ ] No console errors
- [ ] No accessibility violations (Lighthouse)
- [ ] Performance score ≥ 90 (Lighthouse)
- [ ] Visual match to mockup confirmed
- [ ] Code follows requirements exactly

---

## Notes

- **Overflow Prevention**: The key fix is using explicit tile sizes and `overflow: hidden` on mosaic wrapper
- **Centering**: Using `items-center` on grid ensures vertical centering
- **Parallax**: Only enabled on desktop, disabled on touch devices and reduced motion
- **Animations**: All use `transform` only for GPU acceleration

---

**Last Updated**: 2024
**Version**: 1.0

