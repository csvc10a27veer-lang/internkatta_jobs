# InternKatta UI Redesign - Migration Checklist

This document provides a step-by-step guide to migrate the InternKatta frontend to the new design system.

---

## 📋 Pre-Migration Checklist

Before starting, ensure you have:
- [ ] Backed up the current codebase
- [ ] Reviewed the [Style Guide](./STYLE_GUIDE.md)
- [ ] Installed required fonts (Poppins, Inter) - Add to `index.html` or use Google Fonts
- [ ] Verified Tailwind CSS v4 is properly configured

---

## 🎯 Priority Order for Implementation

Follow this order for the smoothest migration:

1. **Theme & Global Styles** (Foundation)
2. **Listing Grid + Card + Filters** (Highest conversion impact)
3. **Header + Hero** (First impression)
4. **Detail Page** (User engagement)
5. **Contact + Footer** (Polish)

---

## Step 1: Theme & Global Styles

### 1.1 Update CSS Variables
- [x] Theme tokens file created: `src/styles/theme.js`
- [x] CSS variables added to `src/index.css` using `@theme` directive
- [ ] Verify Tailwind v4 recognizes custom colors:
  - `brand-blue`, `brand-blue-700`, `brand-purple`, `accent-orange`
  - `surface`, `muted`, `text`, `border`

### 1.2 Add Fonts
Add to `index.html` or use a CDN:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

### 1.3 Update Base Styles
- [x] Updated `src/index.css` with theme tokens
- [ ] Test that custom classes work:
  - `text-brand-blue`, `bg-brand-blue`
  - `text-muted`, `bg-surface`
  - `rounded-card`, `rounded-button`, `rounded-hero-cta`
  - `shadow-card`

---

## Step 2: Listing Grid + Card + Filters (Priority 1)

### 2.1 Install New Components
- [x] `src/components/ui/SkeletonCard.jsx` - Skeleton loader
- [x] `src/components/ui/InternshipCard.jsx` - Card component
- [x] `src/components/ui/FiltersSidebar.jsx` - Filters sidebar
- [x] `src/components/ui/TagChip.jsx` - Tag component
- [x] `src/components/ui/Button.jsx` - Button component

### 2.2 Update Internships Listing Page
File: `src/pages/Internship.jsx`

**Changes needed:**
- [ ] Replace existing card component with `InternshipCard`
- [ ] Replace existing filter sidebar with `FiltersSidebar`
- [ ] Update grid classes to: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- [ ] Add `SkeletonGrid` for loading states
- [ ] Ensure card heights are uniform
- [ ] Update colors to use new design tokens
- [ ] Remove coupon input from cards (move to detail/checkout)

**Grid Breakpoints:**
- Mobile (< 768px): 1 column
- Tablet (768px - 1023px): 2 columns
- Desktop (≥ 1400px): 3 columns

### 2.3 Test Listing Page
- [ ] Cards display with 4:3 thumbnails (120-140px height)
- [ ] Grid adjusts correctly at breakpoints
- [ ] Filters sidebar is collapsible with counts
- [ ] Skeleton loaders show while loading
- [ ] Cards have uniform heights
- [ ] Hover effects work (subtle lift + shadow)

---

## Step 3: Header + Hero (Priority 2)

### 3.1 Update Header
File: `src/components/layout/Header.jsx`

- [x] Updated with new design system colors
- [x] Improved accessibility (focus states)
- [ ] Test mobile hamburger menu
- [ ] Verify scroll behavior (hide/show on scroll)
- [ ] Check all navigation links work

### 3.2 Create Hero Component
- [x] `src/components/ui/Hero.jsx` created
- [ ] Update Homepage to use new Hero component
- [ ] Verify blue→purple gradient displays correctly
- [ ] Test CTAs (primary accent + secondary)

### 3.3 Update Homepage
File: `src/pages/Home.jsx`

**Changes needed:**
- [ ] Replace existing hero section with `<Hero />` component
- [ ] Update section padding to use: `py-section-mobile md:py-section-tablet lg:py-section-desktop`
- [ ] Replace old cards with new `InternshipCard` components
- [ ] Update colors throughout to use design tokens
- [ ] Remove excessive gradients (keep only hero)
- [ ] Replace large colored icons with tag chips

---

## Step 4: Detail Page (Priority 3)

### 4.1 Update Internship Detail Page
File: `src/pages/InternshipDetail.jsx`

**Changes needed:**
- [ ] Reduce hero height (not full viewport)
- [ ] Display tags under title using `TagChip`
- [ ] Add right sidebar CTA (desktop)
- [ ] Add mobile sticky CTA (full-width, 56px height, appears after scroll)
- [ ] Update colors to design system
- [ ] Add "Estimated apply time" text (e.g., "Takes < 5 mins to apply")

**Mobile Sticky CTA Implementation:**
```jsx
// Add state for scroll position
const [showStickyCTA, setShowStickyCTA] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setShowStickyCTA(window.scrollY > 300);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Add sticky CTA at bottom of page (mobile only)
{showStickyCTA && (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50 p-4">
    <Button variant="accent" className="w-full h-14">
      Register Now
    </Button>
  </div>
)}
```

---

## Step 5: Contact + Footer (Priority 4)

### 5.1 Update Contact Page
File: `src/pages/Contact.jsx`

**Changes needed:**
- [ ] Replace with `ContactSection` component
- [ ] Verify form submission works
- [ ] Test responsive layout (left info, right form)
- [ ] Check map/illustration placeholder displays

### 5.2 Update Footer
File: `src/components/layout/Footer.jsx`

- [x] Updated with new dark theme
- [x] Using design system colors
- [ ] Test all links work
- [ ] Verify newsletter form functionality
- [ ] Check social media links

---

## Step 6: Additional Components

### 6.1 Courses Page
File: `src/pages/Courses.jsx`

- [ ] Apply same card component (`InternshipCard` can be reused)
- [ ] Update grid layout
- [ ] Add filters sidebar if needed
- [ ] Update colors

### 6.2 Training Page
File: `src/pages/Training.jsx`

- [ ] Apply design system colors
- [ ] Update card components
- [ ] Ensure consistent spacing

---

## ♿ Accessibility Checks

After migration, verify:

### Contrast
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ ] Test on different backgrounds

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible (soft-blue glow)
- [ ] Tab order is logical
- [ ] Skip links work (if implemented)

### Screen Readers
- [ ] All images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] ARIA labels on icon-only buttons
- [ ] Proper heading hierarchy (h1 → h2 → h3)

### Interactive Elements
- [ ] Buttons have focus states
- [ ] Links have focus states
- [ ] Form inputs have focus states
- [ ] Minimum touch target size: 44x44px

---

## 🎨 Visual Consistency Checks

### Colors
- [ ] Brand-blue used as primary (not accent-orange)
- [ ] Accent-orange appears only once per page (single CTA)
- [ ] Gradients minimal (only hero + max one banner)

### Typography
- [ ] Poppins for headlines (600/700 weight)
- [ ] Inter for body text (400/500 weight)
- [ ] Font sizes follow hierarchy (H1=40px, H2=28px, etc.)

### Spacing
- [ ] All spacing uses 8px base unit
- [ ] Section padding: 64px desktop / 40px tablet / 24px mobile
- [ ] Container max-width: 1100px

### Components
- [ ] Cards have uniform heights in grids
- [ ] Thumbnails: 4:3 ratio, 120-140px height
- [ ] Tag chips are small and pill-shaped
- [ ] Buttons follow design system (radius, padding, colors)

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] All pages load without errors
- [ ] Navigation works correctly
- [ ] Forms submit successfully
- [ ] Filters work on listing pages
- [ ] Search functionality works
- [ ] Payment flow works (if applicable)

### Responsive Testing
- [ ] Mobile (< 768px): 1 column grid, mobile menu works
- [ ] Tablet (768px - 1023px): 2 column grid
- [ ] Desktop (≥ 1400px): 3 column grid
- [ ] All breakpoints tested on real devices/browsers

### Performance Testing
- [ ] Images lazy-load in list views
- [ ] Skeleton loaders appear quickly
- [ ] No layout shift (CLS) issues
- [ ] Page load times acceptable

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Common Issues & Solutions

### Issue: Custom colors not working
**Solution:** Ensure Tailwind v4 `@theme` directive is properly configured in `index.css`

### Issue: Fonts not loading
**Solution:** Add Google Fonts links to `index.html` or configure in build system

### Issue: Cards not uniform height
**Solution:** Use `flex flex-col h-full` on card container and `flex-grow` on content area

### Issue: Mobile sticky CTA not appearing
**Solution:** Check scroll event listener and z-index (should be high, e.g., z-50)

### Issue: Focus states not visible
**Solution:** Ensure `focus:ring-2 focus:ring-brand-blue focus:ring-offset-2` classes are applied

---

## 📝 Post-Migration Tasks

After completing migration:

1. **Code Review**
   - [ ] Review all changes
   - [ ] Remove unused components/styles
   - [ ] Clean up console logs

2. **Documentation**
   - [ ] Update component documentation
   - [ ] Document any customizations made
   - [ ] Note any deviations from design system

3. **Performance**
   - [ ] Optimize images (WebP format)
   - [ ] Minify CSS/JS
   - [ ] Check bundle size

4. **Deployment**
   - [ ] Test on staging environment
   - [ ] Verify all features work
   - [ ] Deploy to production
   - [ ] Monitor for errors

---

## 🎯 Acceptance Criteria Summary

### Visual
- ✅ Pages use specified palette and typography
- ✅ Homepage hero uses blue→purple gradient
- ✅ Primary CTAs follow color rules

### Layout
- ✅ Listing grid adjusts at specified breakpoints
- ✅ Cards are uniform height
- ✅ Thumbnail height within 120-140px

### UX
- ✅ Filters collapsible and show counts
- ✅ Skeletons show while loading
- ✅ Detail page sticky CTA appears on mobile after scroll

### Accessibility
- ✅ Contrast and keyboard focus pass basic tests
- ✅ Images have alt text
- ✅ ARIA labels where needed

---

## 📚 Additional Resources

- [Style Guide](./STYLE_GUIDE.md) - Complete design system documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)

---

**Last Updated**: 2024
**Version**: 1.0

