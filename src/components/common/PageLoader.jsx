import React from 'react';
import { motion } from 'framer-motion';

export default function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="relative w-14 h-14">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-red">
            <span className="text-white font-syne font-extrabold text-lg">AN</span>
          </div>
          <div className="absolute -inset-1 rounded-xl border-2 border-primary/30 animate-ping" />
        </div>
        <p className="text-xs text-muted-foreground font-medium">{text}</p>
      </motion.div>
    </div>
  );
}