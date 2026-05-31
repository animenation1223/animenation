import React, { useState } from 'react';
import { base44 } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Package, Truck, CheckCircle, Clock, XCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import GSTInvoice from '../components/features/india/GSTInvoice';
import OrderNotifications from '../components/features/india/OrderNotifications';

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  confirmed: { label: 'Confirmed', icon: Package, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-accent/10 text-accent border-accent/20' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function Orders() {
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const { isAuthenticated, authChecked } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: isAuthenticated,
    initialData: [],
  });

  if (authChecked && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-syne font-bold text-xl text-foreground mb-2">Sign in to view your orders</h2>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 font-syne font-bold">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-syne font-bold text-3xl text-foreground mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-syne font-bold text-xl text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground text-sm">Start shopping and your orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const Icon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-xl bg-card border border-border/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Order #{order.order_number}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.created_date && format(new Date(order.created_date), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                    <Badge className={`${status.color} border flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} {item.size && `• ${item.size}`}</p>
                        </div>
                        <p className="text-sm text-foreground">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="neon-line my-3" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground capitalize">Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : (order.payment_method || '').toUpperCase()}</p>
                    <p className="font-syne font-bold text-foreground">₹{order.total}</p>
                  </div>

                  {order.tracking_id && (
                    <p className="text-xs text-accent mt-2">🚚 Tracking ID: <span className="font-mono font-bold">{order.tracking_id}</span></p>
                  )}

                  {/* GST Invoice toggle */}
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedInvoice(expandedInvoice === order.id ? null : order.id)}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {expandedInvoice === order.id ? 'Hide' : 'View'} GST Invoice
                      {expandedInvoice === order.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {expandedInvoice === order.id && (
                      <div className="mt-4">
                        <GSTInvoice order={order} />
                      </div>
                    )}
                  </div>

                  {/* Order notifications for pending orders */}
                  {order.status === 'pending' && (
                    <div className="mt-4">
                      <OrderNotifications orderNumber={order.order_number} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}