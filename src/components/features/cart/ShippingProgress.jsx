import React from 'react';
import { Truck } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 999;

export default function ShippingProgress({ subtotal }) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="p-3 rounded-xl bg-muted/30 border border-white/5 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Truck className="w-3.5 h-3.5 text-primary" />
          {isFree
            ? <span className="text-green-400 font-syne font-bold">You've unlocked FREE shipping! 🎉</span>
            : <span>Add <span className="text-foreground font-bold">₹{remaining}</span> more for free shipping</span>
          }
        </div>
        <span className={`font-syne font-bold text-xs ${isFree ? 'text-green-400' : 'text-muted-foreground'}`}>
          {isFree ? 'FREE' : `₹79`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}