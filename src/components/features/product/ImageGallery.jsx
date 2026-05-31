import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images, title }) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  
  const x = useMotionValue(0);
  const containerRef = useRef(null);

  // Debug logging
  console.log('ImageGallery Debug:', { images, title });

  // Fallback: ensure we have at least one image
  const galleryImages = images && images.length > 0 ? images : ['https://via.placeholder.com/400x500?text=No+Image'];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const prev = () => setSelected(s => (s - 1 + galleryImages.length) % galleryImages.length);
  const next = () => setSelected(s => (s + 1) % galleryImages.length);

  // Handle swipe gestures
  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -10000) {
      next();
    } else if (swipe > 10000) {
      prev();
    }
  };

  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const handleThumbnailClick = (index) => {
    setSelected(index);
  };

  const handleThumbnailHover = (index) => {
    if (!isMobile) setSelected(index);
  };

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        ref={containerRef}
        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-border cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: isMobile ? 0 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobile ? 0 : 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            <img
              src={galleryImages[selected]}
              alt={title}
              className="w-full h-full object-cover"
              style={zoomed && !isMobile ? {
                transform: 'scale(1.7)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transition: 'transform 0.1s ease'
              } : { transition: 'transform 0.3s ease' }}
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom hint */}
        {!isMobile && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl glass flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="w-4 h-4" />
          </div>
        )}

        {/* Nav arrows for multiple images */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl glass flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl glass flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {galleryImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`h-1.5 rounded-full transition-all ${i === selected ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/40'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails - Desktop */}
      {!isMobile && galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((img, i) => (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              onMouseEnter={() => handleThumbnailHover(i)}
              className={`w-16 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
                i === selected ? 'border-primary shadow-[0_0_12px_rgba(255,31,68,0.3)]' : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Thumbnails - Mobile */}
      {isMobile && galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
          {galleryImages.map((img, i) => (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              className={`w-14 h-18 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 snap-center ${
                i === selected ? 'border-primary shadow-[0_0_12px_rgba(255,31,68,0.3)]' : 'border-border'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}