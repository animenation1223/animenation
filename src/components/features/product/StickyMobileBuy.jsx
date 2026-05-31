import React from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function StickyMobileBuy({ product, selectedSize, onAddToCart }) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-16 left-0 right-0 z-40 sm:hidden px-4 pb-2"
    >
      <div className="glass-strong rounded-2xl border border-white/10 p-3 flex items-center gap-3 shadow-2xl">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{product.title}</p>
          <p className="font-syne font-bold text-base text-foreground">₹{product.price}</p>
        </div>
        <button
          onClick={onAddToCart}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-syne font-bold text-sm transition-colors glow-red"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </button>
        <Link
          to="/checkout"
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl font-syne font-bold text-sm transition-colors"
        >
          <Zap className="w-4 h-4" />
          Buy Now
        </Link>
      </div>
    </motion.div>
  );
}