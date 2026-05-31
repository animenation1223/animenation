import React, { useState, useEffect } from 'react';
import { Truck, IndianRupee, Shield, Zap } from 'lucide-react';

const BANNERS = [
  {
    icon: Truck,
    text: 'FREE Shipping Across India',
    sub: 'On all orders above ₹999',
    color: 'text-green-400',
    bg: 'from-green-500/20 to-transparent',
  },
  {
    icon: IndianRupee,
    text: 'Cash on Delivery Available',
    sub: 'Pay when your order arrives — zero risk',
    color: 'text-yellow-400',
    bg: 'from-yellow-500/20 to-transparent',
  },
  {
    icon: Zap,
    text: 'Fast Delivery Pan-India',
    sub: 'Ships in 24hrs · Delhivery · Shiprocket · BlueDart',
    color: 'text-primary',
    bg: 'from-primary/20 to-transparent',
  },
  {
    icon: Shield,
    text: '100% Secure Payments',
    sub: 'UPI · Cards · Net Banking · Wallets',
    color: 'text-accent',
    bg: 'from-accent/20 to-transparent',
  },
];

export default function IndiaTrustBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % BANNERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const b = BANNERS[current];
  const Icon = b.icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${b.bg} border-b border-white/5 transition-all duration-500`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
        <Icon className={`w-4 h-4 flex-shrink-0 ${b.color}`} />
        <p className="text-xs font-syne font-bold text-foreground">
          {b.text}
          <span className="ml-2 text-muted-foreground font-normal hidden sm:inline">{b.sub}</span>
        </p>
        {/* Dots */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-1 h-1 rounded-full transition-all ${i === current ? 'bg-foreground w-3' : 'bg-muted-foreground/40'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}