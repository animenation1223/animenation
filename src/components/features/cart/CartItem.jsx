import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartItem({ item, onUpdate, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      className="flex gap-4 p-4 rounded-2xl bg-card border border-white/5 hover:border-white/10 transition-colors"
    >
      <Link to={`/product/${item.product_id}`} className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
        {item.image_url
          ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
        }
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/product/${item.product_id}`}>
          <h3 className="text-sm font-syne font-bold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>
        </Link>
        {item.size && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-syne font-bold text-muted-foreground uppercase">
            Size: {item.size}
          </span>
        )}
        <p className="text-base font-syne font-bold text-foreground mt-2">₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</p>
        {item.quantity > 1 && <p className="text-[11px] text-muted-foreground">₹{item.price} × {item.quantity}</p>}

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onUpdate(item.id, Math.max(1, (item.quantity || 1) - 1))}
            className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/30 transition-all"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-syne font-bold w-6 text-center text-foreground">{item.quantity || 1}</span>
          <button
            onClick={() => onUpdate(item.id, (item.quantity || 1) + 1)}
            className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/30 transition-all"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="text-muted-foreground hover:text-destructive transition-colors self-start p-1 rounded-lg hover:bg-destructive/10"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}