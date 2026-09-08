// Theme tokens for InternKatta UI redesign
// This file contains CSS variables and Tailwind theme configuration

export const themeConfig = {
  // CSS Variables (for plain CSS usage)
  cssVariables: {
    // Brand Colors
    '--color-brand-blue': '#2563EB',
    '--color-brand-blue-700': '#1E4ED8',
    '--color-brand-purple': '#6366F1',
    '--color-accent-orange': '#FF8C42',
    
    // Surface & Text Colors
    '--color-surface': '#F8FAFC',
    '--color-muted': '#6B7280',
    '--color-text': '#0F172A',
    '--color-border': '#E6E9EE',
    
    // Typography
    '--font-headline': 'Poppins, sans-serif',
    '--font-body': 'Inter, sans-serif',
    
    // Font Sizes (Desktop)
    '--font-size-h1': '40px',
    '--font-size-h2': '28px',
    '--font-size-h3': '20px',
    '--font-size-body': '15px',
    '--font-size-small': '13px',
    
    // Spacing (Base unit: 8px)
    '--spacing-base': '8px',
    '--spacing-section-desktop': '64px',
    '--spacing-section-tablet': '40px',
    '--spacing-section-mobile': '24px',
    
    // Container
    '--container-max-width': '1100px',
    
    // Border Radius
    '--radius-card': '8px',
    '--radius-hero-cta': '12px',
    '--radius-button': '10px',
    
    // Shadows
    '--shadow-card': '0 6px 20px rgba(2, 6, 23, 0.06)',
  },

  // Tailwind Theme Extension
  tailwindExtend: {
    colors: {
      'brand-blue': {
        DEFAULT: '#2563EB',
        700: '#1E4ED8',
      },
      'brand-purple': '#6366F1',
      'accent-orange': '#FF8C42',
      surface: '#F8FAFC',
      muted: '#6B7280',
      text: '#0F172A',
      border: '#E6E9EE',
    },
    fontFamily: {
      headline: ['Poppins', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
    },
    fontSize: {
      h1: ['40px', { lineHeight: '1.2', fontWeight: '700' }],
      h2: ['28px', { lineHeight: '1.3', fontWeight: '600' }],
      h3: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
      body: ['15px', { lineHeight: '1.6', fontWeight: '400' }],
      small: ['13px', { lineHeight: '1.5', fontWeight: '400' }],
    },
    spacing: {
      'section-desktop': '64px',
      'section-tablet': '40px',
      'section-mobile': '24px',
    },
    maxWidth: {
      container: '1100px',
    },
    borderRadius: {
      card: '8px',
      'hero-cta': '12px',
      button: '10px',
    },
    boxShadow: {
      card: '0 6px 20px rgba(2, 6, 23, 0.06)',
    },
  },
};

// Export CSS variables as a string for injection
export const cssVariablesString = Object.entries(themeConfig.cssVariables)
  .map(([key, value]) => `${key}: ${value};`)
  .join('\n  ');

