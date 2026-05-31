import React from 'react';
import { Truck, CreditCard, RotateCcw, Shield, Headphones, Zap } from 'lucide-react';

const BADGES = [
  { icon: Truck, label: 'Free Shipping', sub: 'On orders above ₹999', color: 'text-primary' },
  { icon: CreditCard, label: 'COD Available', sub: 'Pay on delivery', color: 'text-accent' },
  { icon: RotateCcw, label: '7-Day Returns', sub: 'Hassle-free returns', color: 'text-blue-400' },
  { icon: Shield, label: 'Secure Payment', sub: '100% encrypted', color: 'text-green-400' },
  { icon: Headphones, label: '24/7 Support', sub: 'Always here for you', color: 'text-accent' },
  { icon: Zap, label: 'Fast Dispatch', sub: 'Ships in 24 hours', color: 'text-primary' },
];

export default function ProductTrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {BADGES.map(({ icon: Icon, label, sub, color }) => (
        <div key={label} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-colors">
          <Icon className={`w-4 h-4 ${color}`} />
          <p className="text-[10px] font-syne font-bold text-foreground leading-tight">{label}</p>
          <p className="text-[9px] text-muted-foreground leading-tight">{sub}</p>
        </div>
      ))}
    </div>
  );
}