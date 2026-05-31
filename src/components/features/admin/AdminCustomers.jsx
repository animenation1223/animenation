import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import { Search, Mail, IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list(),
    initialData: [],
  });

  // Build customer map from orders
  const customerMap = {};
  orders.forEach(o => {
    const email = o.customer_email || o.shipping_address?.name || `Customer-${o.id.slice(0,5)}`;
    const name = o.shipping_address?.name || 'Unknown';
    const phone = o.shipping_address?.phone || '—';
    if (!customerMap[email]) {
      customerMap[email] = { email, name, phone, orders: 0, spent: 0, lastOrder: o.created_date };
    }
    customerMap[email].orders += 1;
    customerMap[email].spent += o.total || 0;
    if (new Date(o.created_date) > new Date(customerMap[email].lastOrder)) {
      customerMap[email].lastOrder = o.created_date;
    }
  });

  const customers = Object.values(customerMap)
    .sort((a, b) => b.spent - a.spent)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const totalCustomers = Object.keys(customerMap).length;
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const avgLTV = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-white/5 text-center">
          <p className="font-syne font-extrabold text-2xl text-foreground">{totalCustomers}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Customers</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-white/5 text-center">
          <p className="font-syne font-extrabold text-2xl text-primary">₹{avgLTV.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground mt-1">Avg Lifetime Value</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-white/5 text-center">
          <p className="font-syne font-extrabold text-2xl text-accent">{orders.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="pl-9 bg-muted/50 border-white/10" />
      </div>

      <div className="rounded-2xl bg-card border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-muted-foreground">
                <th className="text-left px-4 py-3 font-syne font-bold">Customer</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Phone</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Orders</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Total Spent</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-syne font-bold">{c.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-syne font-bold">{c.orders}</span>
                  </td>
                  <td className="px-4 py-3 font-syne font-bold text-foreground flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />{c.spent.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}