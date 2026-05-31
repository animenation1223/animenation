import React from 'react';
import { base44 } from '@/services/api';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { toastService } from '@/lib/toast-service';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-blue-500/10 text-blue-400',
  shipped: 'bg-accent/10 text-accent',
  delivered: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated');
    },
    onError: (error) => {
      toastService.orderError(error);
    },
  });

  return (
    <div className="space-y-3">
      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No orders yet</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="p-4 rounded-xl bg-card border border-border/50">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">#{order.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {order.created_date && format(new Date(order.created_date), 'dd MMM yyyy')}
                  {' • '}{order.payment_method === 'cod' ? 'COD' : (order.payment_method || '').toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={order.status}
                  onValueChange={(v) => updateMutation.mutate({ id: order.id, data: { status: v } })}
                >
                  <SelectTrigger className="h-8 text-xs w-32 bg-muted/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {order.items?.map((item, j) => (
                <div key={j} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.title} x{item.quantity}</span>
                  <span className="text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {order.shipping_address && (
              <div className="text-xs text-muted-foreground mb-2">
                📍 {order.shipping_address.name}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Input
                placeholder="Add tracking ID..."
                defaultValue={order.tracking_id || ''}
                onBlur={(e) => {
                  if (e.target.value !== (order.tracking_id || '')) {
                    updateMutation.mutate({ id: order.id, data: { tracking_id: e.target.value } });
                  }
                }}
                className="h-7 text-xs bg-muted/50 border-border w-48"
              />
              <p className="font-syne font-bold text-foreground">₹{order.total}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}