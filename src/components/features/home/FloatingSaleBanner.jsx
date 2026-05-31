import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingSaleBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="relative glass-strong rounded-2xl border border-primary/30 px-4 py-3 flex items-center gap-3 glow-red shadow-2xl">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-syne font-bold text-foreground">🔥 FLASH SALE — 40% OFF</p>
              <p className="text-[11px] text-muted-foreground truncate">All Hoodies & Oversized Tees today only!</p>
            </div>
            <Link
              to="/products?category=hoodies"
              className="flex-shrink-0 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-syne font-bold rounded-lg transition-colors"
            >
              Shop
            </Link>
            <button
              onClick={() => setVisible(false)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}