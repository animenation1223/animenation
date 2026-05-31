import React, { useState } from 'react';
import { Tag, CheckCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/api/httpClient';
import { toastService } from '@/lib/toast-service';

export default function CouponSection({ onApply, subtotal = 0 }) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    setLoading(true);
    setError('');
    try {
      const coupon = await apiFetch('/api/coupons/validate', {
        method: 'POST',
        body: { code: code.trim().toUpperCase(), subtotal },
      });
      const pct = coupon.type === 'percent' ? coupon.discount : 0;
      setApplied({ code: coupon.code, label: coupon.label, discount: pct, discount_amount: coupon.discount_amount });
      onApply(coupon.type === 'percent' ? coupon.discount : 0, coupon.discount_amount, coupon.code);
    } catch (e) {
      setError(e.message || 'Invalid coupon code');
      toastService.handleApiError(e, 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setApplied(null);
    setCode('');
    onApply(0, 0, null);
  };

  if (applied) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-syne font-bold text-green-400">{applied.code} applied!</p>
          <p className="text-[11px] text-muted-foreground">{applied.label}</p>
        </div>
        <button onClick={remove} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Coupon code"
            value={code}
            onChange={e => { setCode(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && apply()}
            className="pl-9 h-10 bg-muted/50 border-white/10 text-sm"
          />
        </div>
        <Button
          onClick={apply}
          disabled={loading}
          size="sm"
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/10 h-10 px-4 font-syne font-bold"
        >
          {loading ? '...' : 'Apply'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-[10px] text-muted-foreground">Try OTAKU10, ANIME20, or NEWAV15</p>
    </div>
  );
}
