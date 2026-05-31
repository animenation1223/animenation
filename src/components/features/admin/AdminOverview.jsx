import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { IndianRupee, ShoppingBag, Package, TrendingUp, Users, MessageSquare, ArrowUpRight } from 'lucide-react';

const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-destructive'}`}>
            <ArrowUpRight className="w-3 h-3" />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="font-syne font-extrabold text-2xl text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[11px] text-accent mt-0.5">{sub}</p>}
    </div>
  );
}

// Build monthly revenue chart data from orders
function buildRevenueData(orders) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const map = {};
  orders.forEach(o => {
    const d = new Date(o.created_date);
    const key = months[d.getMonth()];
    map[key] = (map[key] || 0) + (o.total || 0);
  });
  return months.slice(0, new Date().getMonth() + 1).map(m => ({ month: m, revenue: map[m] || 0 }));
}

function buildStatusData(orders) {
  const map = {};
  orders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function buildCategoryData(products) {
  const map = {};
  products.forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
  return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,6).map(([name, value]) => ({ name: name.replace(/-/g,' '), value }));
}

export default function AdminOverview() {
  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: () => base44.entities.Product.list(), initialData: [] });
  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: () => base44.entities.Order.list(), initialData: [] });
  const { data: messages = [] } = useQuery({ queryKey: ['admin-messages'], queryFn: () => base44.entities.ContactMessage.list(), initialData: [] });
  const { data: reviews = [] } = useQuery({ queryKey: ['admin-reviews'], queryFn: () => base44.entities.Review.list(), initialData: [] });

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const unreadMessages = messages.filter(m => !m.is_read).length;
  const avgOrder = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  const revenueData = buildRevenueData(orders);
  const statusData = buildStatusData(orders);
  const categoryData = buildCategoryData(products);
  const PIE_COLORS = ['#ff1f44','#a855f7','#3b82f6','#22c55e','#f59e0b','#ec4899'];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} color="text-green-400 bg-green-500/10" trend={12} />
        <StatCard label="Total Orders" value={orders.length} sub={`${pendingOrders} pending`} icon={ShoppingBag} color="text-primary bg-primary/10" trend={8} />
        <StatCard label="Products Live" value={products.filter(p => p.is_active).length} sub={`${products.length} total`} icon={Package} color="text-accent bg-accent/10" />
        <StatCard label="Avg Order Value" value={`₹${avgOrder.toLocaleString('en-IN')}`} icon={TrendingUp} color="text-blue-400 bg-blue-500/10" trend={5} />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Delivered" value={deliveredOrders} icon={ShoppingBag} color="text-green-400 bg-green-500/10" />
        <StatCard label="Unread Messages" value={unreadMessages} icon={MessageSquare} color="text-yellow-400 bg-yellow-500/10" />
        <StatCard label="Reviews" value={reviews.length} sub={`${reviews.filter(r=>!r.is_approved).length} pending`} icon={Users} color="text-accent bg-accent/10" />
        <StatCard label="Low Stock" value={products.filter(p => p.stock > 0 && p.stock <= 5).length} icon={Package} color="text-red-400 bg-red-500/10" />
      </div>

      {/* Revenue chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 p-5 rounded-2xl bg-card border border-white/5">
          <h3 className="font-syne font-bold text-sm text-foreground mb-4">Monthly Revenue (₹)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(350 100% 56%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(350 100% 56%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(240 6% 8%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(350 100% 56%)" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/5">
          <h3 className="font-syne font-bold text-sm text-foreground mb-4">Order Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(240 6% 8%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Category chart + recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-card border border-white/5">
          <h3 className="font-syne font-bold text-sm text-foreground mb-4">Products by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: 'hsl(240 6% 8%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" fill="hsl(271 91% 65%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-white/5">
          <h3 className="font-syne font-bold text-sm text-foreground mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-syne font-bold text-foreground">#{order.order_number}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{order.status} · {order.payment_method?.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">₹{order.total?.toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-syne font-bold`}
                    style={{ background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status] }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}