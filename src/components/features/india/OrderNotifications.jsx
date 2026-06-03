import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function OrderNotifications({ orderNumber, onSave }) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!phone && !email) { toastService.error('Enter at least one contact'); return; }
    if (phone && phone.length !== 10) { toastService.error('Enter a valid 10-digit phone number'); return; }
    toast.success('You\'ll get order updates via SMS & email! 📬');
    setSaved(true);
    onSave?.({ phone: phone ? `+91${phone}` : '', email });
  };

  if (saved) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
        <div>
          <p className="text-xs font-syne font-bold text-green-400">Order updates activated!</p>
          <p className="text-[11px] text-muted-foreground">You'll receive SMS & email alerts for order #{orderNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-card border border-white/5 space-y-3">
      <h4 className="font-syne font-bold text-sm text-foreground flex items-center gap-2">
        <Bell className="w-4 h-4 text-accent" /> Order Update Notifications
      </h4>
      <p className="text-xs text-muted-foreground">Get SMS & email alerts for order confirmation, shipping, and delivery.</p>

      <div className="space-y-2">
        <div className="relative">
          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex gap-2">
            <span className="flex items-center px-3 rounded-md border border-white/10 bg-muted/50 text-sm text-muted-foreground flex-shrink-0">+91</span>
            <Input
              placeholder="Mobile for SMS"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
              className="bg-muted/50 border-white/10 text-sm"
            />
          </div>
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Email for order updates"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="pl-9 bg-muted/50 border-white/10 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap text-[10px] text-muted-foreground">
        {['Order Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'].map((s, i) => (
          <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {s}
          </span>
        ))}
      </div>

      <Button onClick={handleSave} size="sm" className="w-full bg-accent hover:bg-accent/90 font-syne font-bold">
        Enable Notifications
      </Button>
    </div>
  );
}