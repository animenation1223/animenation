import React, { useState } from 'react';
import { Tag, Copy, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/api/httpClient';
import { toastService } from '@/lib/toast-service';

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percent', minOrder: '', expires: '' });

  const { data: coupons = [] } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => apiFetch('/api/coupons'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (body) => apiFetch('/api/coupons', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setForm({ code: '', discount: '', type: 'percent', minOrder: '', expires: '' });
      setShowForm(false);
      toast.success('Coupon created!');
    },
    onError: (error) => {
      toastService.handleApiError(error, 'Failed to create coupon.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiFetch(`/api/coupons/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
    onError: (error) => {
      toastService.handleApiError(error, 'Failed to update coupon.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/api/coupons/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon deleted');
    },
    onError: (error) => {
      toastService.handleApiError(error, 'Failed to delete coupon.');
    },
  });

  const addCoupon = () => {
    if (!form.code || !form.discount) { toast.error('Fill required fields'); return; }
    createMutation.mutate({
      code: form.code,
      discount: Number(form.discount),
      type: form.type,
      minOrder: Number(form.minOrder) || 0,
      expires: form.expires || null,
      active: true,
    });
  };

  const toggleActive = (id, active) => updateMutation.mutate({ id, data: { active: !active } });
  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success('Copied!'); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-syne font-bold text-base text-foreground">Coupon Management</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{coupons.filter(c => c.active).length} active coupons</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-primary hover:bg-primary/90 font-syne font-bold gap-2">
          <Plus className="w-4 h-4" /> New Coupon
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-2xl bg-card border border-primary/20 space-y-4">
          <h4 className="font-syne font-bold text-sm text-foreground">Create Coupon</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Code *</label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" className="mt-1 bg-muted/50 border-white/10 uppercase" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Discount *</label>
              <Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="20" className="mt-1 bg-muted/50 border-white/10" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full mt-1 h-9 rounded-md border border-white/10 bg-muted/50 px-3 text-sm text-foreground">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Min Order (₹)</label>
              <Input type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: e.target.value })} placeholder="500" className="mt-1 bg-muted/50 border-white/10" />
            </div>
          </div>
          <Button onClick={addCoupon} size="sm" className="bg-primary font-syne font-bold">Create</Button>
        </div>
      )}

      <div className="space-y-2">
        {coupons.map(c => (
          <div key={c.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-white/5">
            <Tag className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-syne font-bold text-sm text-foreground">{c.code}</p>
              <p className="text-[11px] text-muted-foreground">
                {c.type === 'percent' ? `${c.discount}%` : `₹${c.discount}`} off · Min ₹{c.minOrder} · {c.uses} uses
              </p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-syne font-bold ${c.active ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
              {c.active ? 'Active' : 'Inactive'}
            </span>
            <button onClick={() => copyCode(c.code)} className="text-muted-foreground hover:text-foreground"><Copy className="w-4 h-4" /></button>
            <button onClick={() => toggleActive(c.id, c.active)} className="text-xs text-primary hover:underline">{c.active ? 'Disable' : 'Enable'}</button>
            <button onClick={() => deleteMutation.mutate(c.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
