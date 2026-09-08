/**
 * QA Toggle for Hero Animations
 * Add this to your page for quick animation testing
 * 
 * Usage:
 *   import { toggleMotion } from './HERO_QA_TOGGLE';
 *   toggleMotion(true);  // Disable animations
 *   toggleMotion(false); // Enable animations
 */

export function toggleMotion(off) {
  const root = document.querySelector('.hero');
  if (!root) {
    console.warn('Hero element not found');
    return;
  }
  
  if (off) {
    root.setAttribute('data-motion', 'off');
    console.log('Animations disabled');
  } else {
    root.setAttribute('data-motion', 'on');
    console.log('Animations enabled');
  }
}

// Global function for console access
if (typeof window !== 'undefined') {
  window.toggleHeroMotion = toggleMotion;
}

// Example usage in console:
// toggleHeroMotion(true)  // Disable
// toggleHeroMotion(false) // Enable












