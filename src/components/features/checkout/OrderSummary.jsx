import React from 'react';
import { Shield, RotateCcw, Truck, Headphones } from 'lucide-react';

const TRUST = [
  { icon: Shield, label: 'Secure Payment' },
  { icon: Truck, label: 'Fast Delivery' },
  { icon: RotateCcw, label: 'Easy Returns' },
  { icon: Headphones, label: '24/7 Support' },
];

export default function OrderSummary({ items, subtotal, shipping, discount, couponPct }) {
  const gst = Math.round(subtotal * 0.05);
  const discountAmt = Math.round(subtotal * (couponPct / 100));
  const total = subtotal + shipping + gst - discountAmt;

  return (
    <div className="p-5 rounded-2xl bg-card border border-white/5 sticky top-24 space-y-4">
      <h3 className="font-syne font-bold text-base text-foreground">Order Summary</h3>

      {/* Mini item list */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2.5">
            <div className="w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
              <p className="text-[10px] text-muted-foreground">
                Qty {item.quantity || 1}{item.size ? ` · ${item.size}` : ''}
              </p>
            </div>
            <p className="text-xs font-syne font-bold text-foreground flex-shrink-0">₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      <div className="neon-line" />

      {/* Price breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-green-400 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>GST (5%)</span>
          <span>₹{gst.toLocaleString('en-IN')}</span>
        </div>
        {discountAmt > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Coupon Discount</span>
            <span>−₹{discountAmt.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="neon-line" />
        <div className="flex justify-between font-syne font-extrabold text-lg text-foreground">
          <span>Total</span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
        <p className="text-[10px] text-muted-foreground">*Inclusive of all taxes</p>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {TRUST.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Icon className="w-3 h-3 text-primary flex-shrink-0" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}