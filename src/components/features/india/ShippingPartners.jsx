import React from 'react';
import { Truck, Clock, MapPin, IndianRupee } from 'lucide-react';

const PARTNERS = [
  {
    name: 'Delhivery',
    tagline: 'Pan-India Coverage',
    days: '3-5 days',
    zones: 'All 29 States',
    cod: true,
    color: 'from-red-500/10 to-transparent border-red-500/15',
    badge: 'Most Used',
    badgeColor: 'bg-red-500/10 text-red-400',
  },
  {
    name: 'Shiprocket',
    tagline: 'Smart D2C Shipping',
    days: '2-6 days',
    zones: 'All India + Tier 3',
    cod: true,
    color: 'from-orange-500/10 to-transparent border-orange-500/15',
    badge: 'D2C Friendly',
    badgeColor: 'bg-orange-500/10 text-orange-400',
  },
  {
    name: 'BlueDart',
    tagline: 'Premium Express',
    days: '1-3 days',
    zones: 'Metro + Tier 1',
    cod: false,
    color: 'from-blue-500/10 to-transparent border-blue-500/15',
    badge: 'Fastest',
    badgeColor: 'bg-blue-500/10 text-blue-400',
  },
  {
    name: 'DTDC',
    tagline: 'Trusted Since 1990',
    days: '3-7 days',
    zones: '10,000+ Pin Codes',
    cod: true,
    color: 'from-yellow-500/10 to-transparent border-yellow-500/15',
    badge: 'Widest Reach',
    badgeColor: 'bg-yellow-500/10 text-yellow-400',
  },
];

export default function ShippingPartners({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Truck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-xs text-muted-foreground">Ships via:</span>
        {PARTNERS.map(p => (
          <span key={p.name} className="px-2 py-0.5 rounded bg-muted text-[10px] font-syne font-bold text-muted-foreground">{p.name}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-syne font-bold text-sm text-foreground flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary" /> Shipping Partners
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PARTNERS.map(p => (
          <div key={p.name} className={`p-4 rounded-2xl bg-gradient-to-br border ${p.color} bg-card`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-syne font-bold text-foreground text-sm">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">{p.tagline}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-syne font-bold ${p.badgeColor}`}>{p.badge}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {p.days}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" /> {p.zones}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <IndianRupee className="w-3 h-3 text-yellow-400" />
                <span className={p.cod ? 'text-yellow-400 font-medium' : 'text-muted-foreground'}>
                  {p.cod ? 'COD Available' : 'Prepaid Only'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}