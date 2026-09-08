import React, { useEffect, useRef, useState } from 'react';
import tileMap from './mosaic-tiles.json';

/**
 * Hero Mosaic Component - Exact match to reference image
 * Uses absolute positioning for irregular layout
 * Fixed container: 520px × 620px
 */
const HeroMosaic = ({ 
  enableParallax = false, // Disabled - only individual tile animations
  showReferenceOverlay = false, // QA mode
  scale = 1, // Scale factor for responsive (1 = desktop, <1 for tablet/mobile)
  className = '' 
}) => {
  const containerRef = useRef(null);
  const parallaxRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionDisabled, setMotionDisabled] = useState(false);

  // Check for reduced motion preference and data-motion attribute
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const checkMotionDisabled = () => {
      if (containerRef.current) {
        const hero = containerRef.current.closest('.hero');
        if (hero && hero.getAttribute('data-motion') === 'off') {
          setMotionDisabled(true);
          return true;
        }
      }
      return false;
    };
    
    const isDisabled = checkMotionDisabled();
    setMotionDisabled(isDisabled || mediaQuery.matches);
    
    const handleChange = (e) => {
      setReducedMotion(e.matches);
      setMotionDisabled(e.matches || checkMotionDisabled());
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    const observer = new MutationObserver(() => {
      setMotionDisabled(checkMotionDisabled() || mediaQuery.matches);
    });
    
    if (containerRef.current) {
      const hero = containerRef.current.closest('.hero');
      if (hero) {
        observer.observe(hero, { attributes: true, attributeFilter: ['data-motion'] });
      }
    }
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  const shouldAnimate = !reducedMotion && !motionDisabled;

  // Enhanced pointer parallax with rotation and randomized tile animations
  useEffect(() => {
    if (!enableParallax || reducedMotion || motionDisabled || !parallaxRef.current || !containerRef.current) return;

    const P_MAX = 18; // Increased for bigger parallax
    let targetX = 0, targetY = 0;
    let rafId = null;

    // Assign randomized animation variants to tiles for organic energy
    const tiles = Array.from(containerRef.current.querySelectorAll('.mosaic-tile'));
    const variants = ['mosaic-tile--energetic-1', 'mosaic-tile--energetic-2', 'mosaic-tile--drift'];

    tiles.forEach((tile, i) => {
      // Random pick but bias so not all same
      const pick = variants[(i + Math.floor(Math.random() * variants.length)) % variants.length];
      
      // Only add if not already has a variant class
      if (!tile.classList.contains('mosaic-tile--energetic-1') && 
          !tile.classList.contains('mosaic-tile--energetic-2') && 
          !tile.classList.contains('mosaic-tile--drift')) {
        tile.classList.add(pick);
      }

      // Randomize duration slightly (slower base speeds)
      const base = tile.classList.contains('mosaic-tile--drift') ? 11 + Math.random() * 3 : 8 + Math.random() * 4;
      tile.style.animationDuration = base.toFixed(2) + 's';

      // Random small delay to stagger starts
      tile.style.animationDelay = (Math.random() * 1.2).toFixed(2) + 's';

      // Small per-tile transform-origin tweak for better rotation feel
      if (Math.random() > 0.6) {
        tile.style.transformOrigin = '60% 40%';
      }
    });

    function onPointerMove(e) {
      const rect = parallaxRef.current.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) - 0.5; // -0.5..0.5
      const cy = ((e.clientY - rect.top) / rect.height) - 0.5;

      targetX = cx * P_MAX;
      targetY = cy * P_MAX;

      if (!rafId) rafId = requestAnimationFrame(animateParallax);
    }

    function animateParallax() {
      rafId = null;
      // Combine slight rotation based on X
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) rotate(${(targetX / 20).toFixed(2)}deg)`;
      }
    }

    const element = parallaxRef.current;
    if (element) {
      element.addEventListener('pointermove', onPointerMove, { passive: true });
      element.addEventListener('pointerleave', () => {
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = '';
        }
      });

      // Expose toggle function
      window.toggleMosaic = (on) => {
        document.documentElement.classList.toggle('no-anim', !on);
      };

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        element.removeEventListener('pointermove', onPointerMove);
        element.removeEventListener('pointerleave', () => {});
      };
    }
  }, [enableParallax, reducedMotion, motionDisabled]);

  // Hover-boost effect: activate tile on hover
  useEffect(() => {
    if (reducedMotion || motionDisabled || !containerRef.current) return;

    const tiles = Array.from(containerRef.current.querySelectorAll('.mosaic-tile'));
    if (!tiles.length) return;

    // Debounce small hover flicker using a short timeout
    let enterTimeout = null;
    let leaveTimeout = null;

    const handlePointerEnter = (e) => {
      const tile = e.currentTarget;
      
      // Clear any leave timeout
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        leaveTimeout = null;
      }

      // Quick micro-delay to avoid accidental flickers
      enterTimeout = setTimeout(() => {
        // Remove active from others
        tiles.forEach(t => t.classList.remove('is-active'));
        // Add active to current tile
        tile.classList.add('is-active');
        // Optional immediate visual "pop" class
        tile.classList.add('immediate');
        window.setTimeout(() => tile.classList.remove('immediate'), 160);
      }, 40); // small delay; reduce to 0 for instant activation
    };

    const handlePointerLeave = (e) => {
      const tile = e.currentTarget;
      
      if (enterTimeout) {
        clearTimeout(enterTimeout);
        enterTimeout = null;
      }

      // Small delay before removing to keep motion feeling smooth
      leaveTimeout = setTimeout(() => {
        tile.classList.remove('is-active');
      }, 80);
    };

    const handleFocus = (e) => {
      const tile = e.currentTarget;
      tiles.forEach(t => t.classList.remove('is-active'));
      tile.classList.add('is-active');
    };

    const handleBlur = (e) => {
      const tile = e.currentTarget;
      tile.classList.remove('is-active');
    };

    tiles.forEach(tile => {
      tile.addEventListener('pointerenter', handlePointerEnter, { passive: true });
      tile.addEventListener('pointerleave', handlePointerLeave, { passive: true });
      tile.addEventListener('focus', handleFocus);
      tile.addEventListener('blur', handleBlur);
    });

    // Expose toggle for QA
    window.toggleHoverOnly = function(enable) {
      if (!enable) {
        tiles.forEach(t => {
          t.classList.remove('is-active');
        });
      }
    };

    return () => {
      tiles.forEach(tile => {
        tile.removeEventListener('pointerenter', handlePointerEnter);
        tile.removeEventListener('pointerleave', handlePointerLeave);
        tile.removeEventListener('focus', handleFocus);
        tile.removeEventListener('blur', handleBlur);
      });
      if (enterTimeout) clearTimeout(enterTimeout);
      if (leaveTimeout) clearTimeout(leaveTimeout);
    };
  }, [reducedMotion, motionDisabled]);

  // Assign animation variant classes to tiles based on mapping
  const getAnimationClass = (tileId, tileShape, isStat) => {
    if (!shouldAnimate) return '';
    
    // Per-tile class mapping for max energy
    // Large purple blob (m): energetic-1
    // Big sky pill (c, l): drift
    // Red circles (a, n): energetic-2
    // Stat cards (d, k, n): energetic-2
    // Small decorative squares: energetic-1
    const variantMap = {
      'a': 'mosaic-tile--energetic-2', // Red circle
      'b': 'mosaic-tile--energetic-1', // Yellow rounded-square
      'c': 'mosaic-tile--drift', // Tall pill (big sky pill)
      'd': 'mosaic-tile--energetic-2', // Stat tile (10000+)
      'e': 'mosaic-tile--energetic-2', // Blue circle
      'f': 'mosaic-tile--energetic-1', // Purple half-round-right
      'g': 'mosaic-tile--energetic-1', // Yellow rounded-square
      'h': 'mosaic-tile--energetic-1', // Beige square
      'j': 'mosaic-tile--energetic-1', // Pink half-round-left
      'k': 'mosaic-tile--energetic-2', // Stat tile (500+)
      'l': 'mosaic-tile--drift', // Half-pill-left (big sky pill)
      'm': 'mosaic-tile--energetic-1', // Big pill (large purple blob)
      'n': 'mosaic-tile--energetic-2', // Stat tile (60+) - red circle
    };
    
    return variantMap[tileId] || 'mosaic-tile--energetic-1';
  };

  const renderTile = (tile) => {
    const isStat = tile.contentType === 'stat';
    const animationClass = getAnimationClass(tile.id, tile.shape, isStat);
    
    const width = (tile.width || tile.size || 140) * scale;
    const height = (tile.height || tile.size || 140) * scale;
    const x = tile.x * scale;
    const y = tile.y * scale;
    
    const tileStyle = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: tile.color,
    };

    // Shape-specific border-radius
    let borderRadius = '';
    switch (tile.shape) {
      case 'circle':
        borderRadius = '999px';
        break;
      case 'rounded-square':
        borderRadius = '12px';
        break;
      case 'square':
        borderRadius = '0';
        break;
      case 'tall-pill':
        borderRadius = '12px 80px 80px 12px';
        break;
      case 'half-round-right':
        borderRadius = '0 70px 70px 0';
        break;
      case 'half-round-left':
        borderRadius = '70px 0 0 70px';
        break;
      case 'half-pill-left':
        borderRadius = '70px 0 0 70px';
        break;
      case 'big-pill':
        borderRadius = '140px';
        break;
      case 'rounded-rect':
        borderRadius = '12px';
        break;
      default:
        borderRadius = '12px';
    }

    tileStyle.borderRadius = borderRadius;

    return (
      <div
        key={tile.id}
        className={`mosaic-tile ${tile.shape} ${isStat ? 'stat mosaic-stat' : ''} ${animationClass}`}
        style={tileStyle}
      >
        {isStat && (
          <>
            <div className="stat-value">{tile.stat}</div>
            <div className="stat-label">{tile.label}</div>
          </>
        )}
      </div>
    );
  };

  const containerWidth = tileMap.containerWidth * scale;
  const containerHeight = tileMap.containerHeight * scale;

  return (
    <div 
      ref={containerRef}
      className={`mosaic-wrapper ${className}`}
      style={{
        position: 'relative',
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        flexShrink: 0,
        overflow: 'visible',
      }}
    >
      <div
        ref={parallaxRef}
        className="mosaic-parallax"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {tileMap.tiles.map(renderTile)}
      </div>
      
      {/* Optional reference overlay for QA */}
      {showReferenceOverlay && (
        <img 
          src="https://files.catbox.moe/6jna9m.png"
          alt="Reference overlay"
          className="reference-overlay"
          style={{
            position: 'absolute',
            opacity: 0.25,
            top: 0,
            left: `${containerWidth}px`,
            width: `${containerWidth}px`,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}
    </div>
  );
};

export default HeroMosaic;
