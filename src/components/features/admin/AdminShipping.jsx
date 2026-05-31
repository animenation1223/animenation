import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Search, Edit2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-blue-500/10 text-blue-400',
  shipped: 'bg-purple-500/10 text-purple-400',
  delivered: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function AdminShipping() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated'); setEditingId(null); },
  });

  const shippingOrders = orders.filter(o => o.status !== 'cancelled');
  const filtered = shippingOrders.filter(o =>
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.shipping_address?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {STATUS_FLOW.map(s => (
          <div key={s} className={`p-4 rounded-2xl text-center border ${STATUS_COLORS[s].replace('text-', 'border-').split(' ')[0].replace('bg-', 'border-')}`}
            style={{ background: 'hsl(240 6% 8%)' }}>
            <p className={`font-syne font-extrabold text-2xl ${STATUS_COLORS[s].split(' ')[1]}`}>
              {orders.filter(o => o.status === s).length}
            </p>
            <p className="text-xs text-muted-foreground capitalize mt-1">{s}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order # or customer..." className="pl-9 bg-muted/50 border-white/10" />
      </div>

      <div className="rounded-2xl bg-card border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-muted-foreground">
                <th className="text-left px-4 py-3 font-syne font-bold">Order</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Customer</th>
                <th className="text-left px-4 py-3 font-syne font-bold">City</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Amount</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Status</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Tracking</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-syne font-bold text-foreground text-xs">#{order.order_number}</p>
                    <p className="text-[10px] text-muted-foreground">{order.payment_method?.toUpperCase()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{order.shipping_address?.name || '—'}</p>
                    <p className="text-[10px] text-muted-foreground">{order.shipping_address?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{order.shipping_address?.city}, {order.shipping_address?.state}</td>
                  <td className="px-4 py-3 font-syne font-bold text-foreground">₹{order.total?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateMutation.mutate({ id: order.id, data: { status: e.target.value } })}
                      className={`rounded-lg px-2 py-1 text-[11px] font-syne font-bold border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[order.status] || ''}`}
                      style={{ background: 'transparent' }}
                    >
                      {['pending','confirmed','shipped','delivered','cancelled'].map(s => (
                        <option key={s} value={s} style={{ background: 'hsl(240 6% 8%)', color: 'white' }}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === order.id ? (
                      <div className="flex items-center gap-2">
                        <Input value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="AWB123456" className="w-28 h-7 text-xs bg-muted/50 border-white/10" autoFocus />
                        <button onClick={() => updateMutation.mutate({ id: order.id, data: { tracking_id: trackingInput } })} className="text-green-400 hover:text-green-300">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs ${order.tracking_id ? 'text-accent font-medium' : 'text-muted-foreground'}`}>
                        {order.tracking_id || 'Not set'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setEditingId(order.id); setTrackingInput(order.tracking_id || ''); }}
                      className="text-muted-foreground hover:text-primary transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}