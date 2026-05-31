import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Gift, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { apiFetch, getAccessToken } from '@/api/httpClient';
import { addPoints, POINTS_CONFIG } from '@/lib/loyalty';
import { toastService } from '@/lib/toast-service';

const PERKS = [
  { icon: Zap, text: 'Early drop access' },
  { icon: Gift, text: 'Exclusive discount codes' },
  { icon: Star, text: '+100 loyalty points on signup' },
];

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { toast.error('Enter a valid email'); return; }
    setLoading(true);
    try {
      await apiFetch('/api/newsletter', { method: 'POST', body: { email } });
      if (getAccessToken()) {
        await addPoints(POINTS_CONFIG.newsletter, 'newsletter');
      }
      setSubscribed(true);
      toast.success("You're in! +100 loyalty points when signed in 🎉", { duration: 4000 });
      setEmail('');
    } catch (err) {
      toastService.handleApiError(err, 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
      <div className="absolute top-0 left-0 right-0 neon-line" />
      <div className="absolute bottom-0 left-0 right-0 neon-line" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-2xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-syne font-bold mb-4">
          <Gift className="w-3 h-3" /> +100 pts on signup
        </div>
        <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground mb-3">
          Join the <span className="text-primary">Otaku</span> Squad
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Early access to drops, exclusive codes, and 100 bonus loyalty points. No spam. Only epic stuff.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="w-3.5 h-3.5 text-primary" />
              {text}
            </div>
          ))}
        </div>

        {subscribed ? (
          <p className="text-green-400 font-syne font-bold">You're on the list! 🔥</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-muted/50 border-white/10 h-11"
            />
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 h-11 px-5 font-syne font-bold gap-2 flex-shrink-0">
              <Send className="w-4 h-4" /> {loading ? '...' : 'Join'}
            </Button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
