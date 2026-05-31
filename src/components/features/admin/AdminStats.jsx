import React from 'react';
import { base44 } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingBag, IndianRupee, TrendingUp } from 'lucide-react';

export default function AdminStats() {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
    initialData: [],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list(),
    initialData: [],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.ContactMessage.list(),
    initialData: [],
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const unreadMessages = messages.filter(m => !m.is_read).length;

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-primary bg-primary/10' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-accent bg-accent/10' },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-400 bg-green-500/10' },
    { label: 'Pending Orders', value: pendingOrders, icon: TrendingUp, color: 'text-yellow-400 bg-yellow-500/10' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-xl bg-card border border-border/50">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-syne font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-card border border-border/50">
          <h3 className="font-syne font-bold text-sm text-foreground mb-4">Recent Orders</h3>
          {orders.slice(0, 5).map((order, i) => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div>
                <p className="text-sm text-foreground">#{order.order_number}</p>
                <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
              </div>
              <p className="text-sm font-medium text-foreground">₹{order.total}</p>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-card border border-border/50">
          <h3 className="font-syne font-bold text-sm text-foreground mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Products</span>
              <span className="text-foreground">{products.filter(p => p.is_active).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivered Orders</span>
              <span className="text-foreground">{orders.filter(o => o.status === 'delivered').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unread Messages</span>
              <span className="text-foreground">{unreadMessages}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}