import React, { useState } from 'react';
import { MapPin, CheckCircle, Truck, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/api/httpClient';

export default function PincodeChecker({ className = '' }) {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const check = async () => {
    if (pincode.length !== 6) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const info = await apiFetch(`/api/pincode/${pincode}`);
      setResult(info);
    } catch (e) {
      setError(e.status === 404 ? 'Delivery not available for this PIN' : (e.message || 'Check failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl bg-card border border-white/5 p-4 space-y-3 ${className}`}>
      <h4 className="font-syne font-bold text-sm text-foreground flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary" />
        Delivery & Availability
      </h4>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Enter 6-digit PIN code"
            value={pincode}
            maxLength={6}
            onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setResult(null); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && check()}
            className="pl-9 h-9 bg-muted/50 border-border text-sm"
          />
        </div>
        <Button onClick={check} disabled={pincode.length !== 6 || loading} size="sm" className="h-9 font-syne font-bold">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {result && (
        <div className="space-y-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2 text-green-400 text-xs font-syne font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            Delivery available
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="w-3 h-3" />
              <span>{result.name}</span>
            </div>
            <div className="text-muted-foreground text-right">
              ETA: <span className="text-foreground font-medium">{result.eta}</span>
            </div>
          </div>
          {result.cod && (
            <p className="text-[10px] text-muted-foreground">Cash on Delivery available</p>
          )}
        </div>
      )}
    </div>
  );
}
