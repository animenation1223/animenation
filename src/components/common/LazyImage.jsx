import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Lazily loaded image using IntersectionObserver.
 * Shows a skeleton until the image enters the viewport, then loads it.
 */
export default function LazyImage({ src, alt, className, wrapperClassName, aspectRatio = 'aspect-[3/4]', ...props }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn('relative overflow-hidden bg-muted', aspectRatio, wrapperClassName)}>
      {/* Skeleton shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/60 to-muted animate-pulse" />
      )}
      {isVisible && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
      {isVisible && !src && (
        <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🎌</div>
      )}
    </div>
  );
}