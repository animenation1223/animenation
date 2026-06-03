import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/services/api';
import { apiFetch } from '@/api/httpClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronLeft, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toastService } from '@/lib/toast-service';

import CheckoutSteps from '../components/features/checkout/CheckoutSteps';
import PaymentSelector from '../components/features/checkout/PaymentSelector';
import OrderSummary from '../components/features/checkout/OrderSummary';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const EMPTY_ADDRESS = { name: '', phone: '', address: '', landmark: '', city: '', state: '', pincode: '' };

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, authChecked, user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [retryPayload, setRetryPayload] = useState(null);
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS });
  const [payment, setPayment] = useState('cod');

  const { data: items = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: () => base44.entities.CartItem.list(),
    enabled: isAuthenticated,
    initialData: [],
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + gst;

  const isAddressValid = address.name && address.phone && address.address && address.city && address.state && address.pincode;

  const handleSubmitOrder = async () => {
    if (!isAddressValid) {
      toastService.error('Please fill all required address fields');
      setStep(1);
      return;
    }
    setSubmitting(true);
    const orderNumber = 'AN' + Date.now().toString(36).toUpperCase();
    try {
      setPaymentError('');
      const payload = {
        order_number: orderNumber,
        items: items.map(item => ({
          product_id: item.product_id,
          title: item.title,
          price: item.price,
          quantity: item.quantity || 1,
          size: item.size || '',
          image_url: item.image_url,
        })),
        total,
        status: 'pending',
        payment_method: payment,
        shipping_address: address,
      };

      if (payment === 'cod') {
        await base44.entities.Order.create(payload);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['cart-count'] });
        toast.success(`Order ${orderNumber} placed successfully! 🎉`);
        navigate('/orders');
        return;
      }

      const scriptLoaded = await new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
      if (!scriptLoaded) throw new Error('Unable to load Razorpay checkout');

      const gatewayOrder = await apiFetch('/api/payments/razorpay/order', {
        method: 'POST',
        body: {
          payment_method: payment,
          shipping_address: address,
        },
      });

      const options = {
        key: gatewayOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: gatewayOrder.amount_paise,
        currency: gatewayOrder.currency,
        name: 'AnimeNation',
        description: `Order ${orderNumber}`,
        order_id: gatewayOrder.gateway_order_id,
        prefill: {
          name: address.name,
          email: user?.email || '',
          contact: address.phone,
        },
        notes: {
          order_number: orderNumber,
        },
        handler: async (response) => {
          try {
            await apiFetch('/api/payments/razorpay/verify', {
              method: 'POST',
              body: {
                payment_method: payment,
                shipping_address: address,
                gateway_order_id: response.razorpay_order_id,
                gateway_payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['cart-count'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toastService.success(`Payment successful. Order ${orderNumber} placed! 🎉`);
            navigate('/orders');
          } catch (verifyErr) {
            setPaymentError(verifyErr?.message || 'Payment verification failed');
            setRetryPayload({
              payment_method: payment,
              shipping_address: address,
            });
            toastService.error(verifyErr?.message || 'Payment verification failed');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await apiFetch('/api/payments/razorpay/failure', {
              method: 'POST',
              body: {
                gateway_order_id: gatewayOrder.gateway_order_id,
                reason: 'Checkout closed by user',
              },
            }).catch((error) => {
              toastService.paymentError(error);
            });
            setPaymentError('Payment was not completed. You can retry.');
            setRetryPayload({
              payment_method: payment,
              shipping_address: address,
            });
            setSubmitting(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async (resp) => {
        await apiFetch('/api/payments/razorpay/failure', {
          method: 'POST',
          body: {
            gateway_order_id: gatewayOrder.gateway_order_id,
            gateway_payment_id: resp?.error?.metadata?.payment_id,
            reason: resp?.error?.description || 'Gateway failure',
          },
        }).catch((error) => {
          toastService.paymentError(error);
        });
        setPaymentError(resp?.error?.description || 'Payment failed');
        setRetryPayload({
          payment_method: payment,
          shipping_address: address,
        });
        setSubmitting(false);
      });
      razorpay.open();
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        toastService.error('Please sign in to place your order');
      } else {
        toastService.error(err?.message || 'Failed to place order');
      }
      setPaymentError(err?.message || 'Failed to place order');
    } finally {
      if (payment === 'cod') setSubmitting(false);
    }
  };

  const paymentMethodLabel = {
    cod: 'Cash on Delivery',
    upi: 'UPI Payment',
    card: 'Credit / Debit Card',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
  }[payment];

  if (authChecked && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground font-syne font-bold text-xl mb-3">Sign in to continue checkout</p>
          <Link to="/login"><Button className="bg-primary hover:bg-primary/90 font-syne font-bold">Go to Login</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground font-syne font-bold text-xl mb-3">No items in cart</p>
          <Link to="/products"><Button className="bg-primary hover:bg-primary/90 font-syne font-bold">Shop Now</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-8 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="font-syne font-extrabold text-3xl text-foreground mb-8">Checkout</h1>

        <CheckoutSteps step={step} onStepClick={setStep} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* STEP 1: Address */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5 p-6 rounded-2xl bg-card border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h2 className="font-syne font-bold text-lg text-foreground">Shipping Address</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground font-medium">Full Name *</Label>
                      <Input
                        value={address.name}
                        onChange={e => setAddress({ ...address, name: e.target.value })}
                        placeholder="Arjun Sharma"
                        className="bg-muted/50 border-white/10 mt-1 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-medium">Phone Number *</Label>
                      <div className="flex gap-2 mt-1">
                        <span className="flex items-center px-3 rounded-md border border-white/10 bg-muted/50 text-sm text-muted-foreground flex-shrink-0">+91</span>
                        <Input
                          value={address.phone}
                          onChange={e => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          placeholder="9876543210"
                          className="bg-muted/50 border-white/10 focus:border-primary/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground font-medium">House / Flat / Street Address *</Label>
                    <Input
                      value={address.address}
                      onChange={e => setAddress({ ...address, address: e.target.value })}
                      placeholder="123, MG Road, Near City Mall"
                      className="bg-muted/50 border-white/10 mt-1 focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground font-medium">Landmark (Optional)</Label>
                    <Input
                      value={address.landmark}
                      onChange={e => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="Near Metro Station, Next to Park"
                      className="bg-muted/50 border-white/10 mt-1 focus:border-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground font-medium">City *</Label>
                      <Input
                        value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                        placeholder="Mumbai"
                        className="bg-muted/50 border-white/10 mt-1 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-medium">State *</Label>
                      <select
                        value={address.state}
                        onChange={e => setAddress({ ...address, state: e.target.value })}
                        className="w-full mt-1 h-9 rounded-md border border-white/10 bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      >
                        <option value="">Select</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs text-muted-foreground font-medium">PIN Code *</Label>
                      <Input
                        value={address.pincode}
                        onChange={e => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        placeholder="400001"
                        className="bg-muted/50 border-white/10 mt-1 focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => { if (isAddressValid) { setStep(2); } else { toastService.error('Please fill all required fields'); } }}
                    className="w-full bg-primary hover:bg-primary/90 h-12 font-syne font-bold rounded-xl mt-2 glow-red"
                  >
                    Continue to Payment
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: Payment */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5 p-6 rounded-2xl bg-card border border-white/5"
                >
                  <h2 className="font-syne font-bold text-lg text-foreground">Payment Method</h2>
                  <PaymentSelector value={payment} onChange={setPayment} />
                  <Button
                    onClick={() => setStep(3)}
                    className="w-full bg-primary hover:bg-primary/90 h-12 font-syne font-bold rounded-xl glow-red"
                  >
                    Review Order
                  </Button>
                </motion.div>
              )}

              {/* STEP 3: Review */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5 p-6 rounded-2xl bg-card border border-white/5"
                >
                  <h2 className="font-syne font-bold text-lg text-foreground">Review Your Order</h2>

                  {/* Address summary */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-white/5">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-sm">
                      <p className="font-syne font-bold text-foreground">{address.name}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{address.address}{address.landmark ? `, ${address.landmark}` : ''}</p>
                      <p className="text-muted-foreground text-xs">{address.city}, {address.state} — {address.pincode}</p>
                      <p className="text-muted-foreground text-xs">+91 {address.phone}</p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline flex-shrink-0">Edit</button>
                  </div>

                  {/* Payment summary */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-white/5">
                    <div>
                      <p className="text-xs text-muted-foreground">Payment via</p>
                      <p className="text-sm font-syne font-bold text-foreground">{paymentMethodLabel}</p>
                    </div>
                    <button onClick={() => setStep(2)} className="text-xs text-primary hover:underline">Edit</button>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1}{item.size ? ` · Size: ${item.size}` : ''}</p>
                        </div>
                        <p className="text-sm font-syne font-bold text-foreground">₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>

                  {/* COD note */}
                  {payment === 'cod' && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      Please keep exact cash ready at the time of delivery.
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary/90 h-13 font-syne font-bold text-base rounded-xl glow-red"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Placing Order...</>
                      : `Place Order • ₹${total.toLocaleString('en-IN')}`
                    }
                  </Button>
                  {paymentError && (
                    <div className="text-xs text-destructive text-center space-y-2">
                      <p>{paymentError}</p>
                      {retryPayload && (
                        <Button
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={handleSubmitOrder}
                          disabled={submitting}
                        >
                          Retry Payment
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground text-center">🔒 By placing this order, you agree to our Terms & Privacy Policy</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-2">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shipping={shipping}
              discount={0}
              couponPct={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}