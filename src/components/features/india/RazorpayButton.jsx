import React, { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Razorpay Integration Ready
 * 
 * To activate:
 * 1. Add your Razorpay Key ID to environment / secrets as RAZORPAY_KEY_ID
 * 2. Load Razorpay checkout.js (add to index.html):
 *    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
 * 3. Create an order on backend using Razorpay Orders API and pass `orderId` prop
 * 4. Set enabled=true
 */
export default function RazorpayButton({
  amount,         // in paise (₹1 = 100 paise)
  orderId,        // Razorpay order_id from backend
  customerName,
  customerPhone,
  customerEmail,
  description = 'AnimeNation India Order',
  onSuccess,
  onFailure,
  enabled = false, // set true once Razorpay is configured
}) {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    if (!enabled) {
      toast.info('Online payment via Razorpay coming soon! Use COD or UPI for now.');
      return;
    }

    if (!window.Razorpay) {
      toastService.error('Razorpay failed to load. Please refresh and try again.');
      return;
    }

    setLoading(true);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
      amount,
      currency: 'INR',
      name: 'AnimeNation India',
      description,
      order_id: orderId,
      prefill: {
        name: customerName || '',
        contact: customerPhone ? `+91${customerPhone}` : '',
        email: customerEmail || '',
      },
      theme: { color: '#ff1f44' },
      modal: {
        ondismiss: () => { setLoading(false); toast.info('Payment cancelled'); },
      },
      handler: (response) => {
        setLoading(false);
        toast.success('Payment successful! 🎉');
        onSuccess?.(response);
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      setLoading(false);
      toastService.error('Payment failed. Please try again.');
      onFailure?.(response.error);
    });
    rzp.open();
  };

  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-primary hover:bg-primary/90 h-12 font-syne font-bold rounded-xl glow-red"
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
        : <><CreditCard className="w-4 h-4 mr-2" /> Pay ₹{(amount / 100).toLocaleString('en-IN')} via Razorpay</>
      }
    </Button>
  );
}