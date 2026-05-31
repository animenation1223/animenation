import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wallet, CreditCard, Smartphone, Banknote, Zap } from 'lucide-react';
import ShippingPartners from '../india/ShippingPartners';

const METHODS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    sub: 'Pay when you receive your order',
    icon: Banknote,
    badge: 'Most Popular',
    badgeColor: 'bg-primary/10 text-primary',
  },
  {
    id: 'upi',
    label: 'UPI Payment',
    sub: 'Google Pay, PhonePe, Paytm, BHIM',
    icon: Smartphone,
    badge: 'Instant',
    badgeColor: 'bg-green-500/10 text-green-400',
    logos: ['GPay', 'PhonePe', 'Paytm'],
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    sub: 'Visa, Mastercard, Rupay, Amex',
    icon: CreditCard,
    badge: null,
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    sub: 'All major Indian banks supported',
    icon: Banknote,
    badge: null,
  },
  {
    id: 'wallet',
    label: 'Wallets',
    sub: 'Paytm Wallet, Amazon Pay, Mobikwik',
    icon: Wallet,
    badge: 'Use Razorpay',
    badgeColor: 'bg-muted text-muted-foreground',
    disabled: true,
  },
  {
    id: 'razorpay',
    label: 'Razorpay',
    sub: 'Cards, UPI, EMI — all in one (coming soon)',
    icon: Zap,
    badge: 'Coming Soon',
    badgeColor: 'bg-muted text-muted-foreground',
    disabled: true,
  },
];

export default function PaymentSelector({ value, onChange }) {
  return (
    <div className="space-y-4">
    <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
      {METHODS.map(m => {
        const Icon = m.icon;
        const isSelected = value === m.id;
        return (
          <label
            key={m.id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
              m.disabled
                ? 'border-white/5 bg-card/50 opacity-50 cursor-not-allowed'
                : isSelected
                  ? 'border-primary bg-primary/5 shadow-[0_0_12px_rgba(255,31,68,0.08)] cursor-pointer'
                  : 'border-white/5 bg-card hover:border-white/15 cursor-pointer'
            }`}
          >
            <RadioGroupItem value={m.id} className="flex-shrink-0" disabled={m.disabled} />
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
              <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-syne font-bold text-foreground">{m.label}</p>
                {m.badge && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-syne font-bold ${m.badgeColor}`}>
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
              {m.logos && isSelected && (
                <div className="flex gap-2 mt-2">
                  {m.logos.map(l => (
                    <span key={l} className="px-2 py-0.5 rounded bg-muted text-[10px] font-syne font-bold text-muted-foreground">{l}</span>
                  ))}
                </div>
              )}
            </div>
          </label>
        );
      })}
    </RadioGroup>

    {/* Shipping partners info */}
    <div className="pt-2">
      <ShippingPartners compact />
    </div>
    </div>
  );
}