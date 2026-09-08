import React, { useState } from 'react';

/**
 * OptimizedImage Component
 * 
 * Automatically tries WebP format first, then falls back to JPEG/PNG
 * This ensures maximum compatibility while using optimized images
 */
const OptimizedImage = ({ 
    src, 
    alt, 
    className = '', 
    onError,
    loading = 'lazy',
    decoding = 'async',
    ...props 
}) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    // Convert JPEG/PNG to WebP path if not already WebP
    const getWebPVersion = (originalSrc) => {
        if (!originalSrc) return null;
        if (originalSrc.toLowerCase().endsWith('.webp')) return originalSrc;
        return originalSrc.replace(/\.(jpeg|jpg|png)$/i, '.webp');
    };

    const handleError = (e) => {
        // If WebP failed, try original format
        const webpSrc = getWebPVersion(src);
        if (imageSrc === webpSrc && webpSrc !== src) {
            // WebP failed, try original
            setImageSrc(src);
            return;
        }
        
        // Both formats failed
        setHasError(true);
        if (onError) {
            onError(e);
        } else {
            e.target.style.display = 'none';
        }
    };

    // Initialize with WebP if available
    React.useEffect(() => {
        if (src) {
            const webpSrc = getWebPVersion(src);
            setImageSrc(webpSrc || src);
            setHasError(false);
        }
    }, [src]);

    if (hasError) {
        return null;
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            loading={loading}
            decoding={decoding}
            onError={handleError}
            {...props}
        />
    );
};

export default OptimizedImage;

