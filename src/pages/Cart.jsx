import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/services/api';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toastService } from '@/lib/toast-service';

import CartItem from '../components/features/cart/CartItem';
import CouponSection from '../components/features/cart/CouponSection';
import ShippingProgress from '../components/features/cart/ShippingProgress';
import ProductCard from '../components/features/products/ProductCard';

export default function Cart() {
  const queryClient = useQueryClient();
  const { isAuthenticated, authChecked } = useAuth();
  const [couponPct, setCouponPct] = useState(0);
  const [couponFlat, setCouponFlat] = useState(0);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => base44.entities.CartItem.list(),
    enabled: isAuthenticated,
    initialData: [],
  });

  const { data: recommended = [] } = useQuery({
    queryKey: ['recommended-cart'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', 4),
    initialData: [],
  });

  if (authChecked && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-foreground font-syne font-bold text-xl mb-3">Sign in to view your cart</p>
          <p className="text-muted-foreground text-sm mb-6">Your saved cart items are available after login.</p>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 font-syne font-bold">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }) => base44.entities.CartItem.update(id, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
    },
    onError: (error) => {
      toastService.cartError(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      toastService.success('Removed from cart');
    },
    onError: (error) => {
      toastService.cartError(error);
    },
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const discountAmt = couponFlat || Math.round(subtotal * (couponPct / 100));
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + gst - discountAmt;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryStr = deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', weekday: 'short' });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-xs">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5 text-4xl">🛒</div>
          <h2 className="font-syne font-extrabold text-2xl text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-6">Looks like you haven't added any anime merch yet!</p>
          <Link to="/products">
            <Button className="bg-primary hover:bg-primary/90 font-syne font-bold glow-red">
              Shop Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-8 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-syne font-extrabold text-3xl text-foreground">
            Your Cart <span className="text-primary">({items.length})</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Shipping progress */}
            <ShippingProgress subtotal={subtotal} />

            {/* Delivery estimate */}
            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Estimated delivery by <span className="text-foreground font-medium ml-1">{deliveryStr}</span>
            </div>

            <AnimatePresence>
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdate={(id, quantity) => updateMutation.mutate({ id, quantity })}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </AnimatePresence>

            {/* Coupon */}
            <div className="p-4 rounded-2xl bg-card border border-white/5">
              <p className="text-sm font-syne font-bold text-foreground mb-3 flex items-center gap-2">
                <span>🏷️</span> Have a coupon?
              </p>
              <CouponSection
                subtotal={subtotal}
                onApply={(pct, flat) => { setCouponPct(pct || 0); setCouponFlat(flat || 0); }}
              />
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-card border border-white/5 sticky top-24 space-y-4">
              <h3 className="font-syne font-bold text-lg text-foreground">Order Summary</h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (5%)</span>
                  <span>₹{gst.toLocaleString('en-IN')}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount</span>
                    <span>−₹{discountAmt.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="neon-line" />
                <div className="flex justify-between font-syne font-extrabold text-lg text-foreground">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">*Inclusive of all taxes & GST</p>
              </div>

              <Link to="/checkout">
                <Button className="w-full bg-primary hover:bg-primary/90 h-12 font-syne font-bold glow-red text-base rounded-xl">
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <p className="text-[11px] text-muted-foreground text-center">
                🔒 Secure checkout · COD & UPI available
              </p>

              {/* Trust row */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                {[
                  { emoji: '🛡️', text: 'Secure Payment' },
                  { emoji: '🔄', text: '7-Day Returns' },
                  { emoji: '🚚', text: 'Fast Shipping' },
                  { emoji: '💬', text: '24/7 Support' },
                ].map(({ emoji, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>{emoji}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended products */}
        {recommended.length > 0 && (
          <section className="mt-16">
            <div className="neon-line mb-8" />
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="font-syne font-extrabold text-2xl text-foreground">You Might Also Like</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommended.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}