import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPoints, getTier, getNextTier, getProgressToNext, getReferralCode } from '@/lib/loyalty';
import { Gift, Copy, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { toastService } from '@/lib/toast-service';

export default function LoyaltyWidget({ userId }) {
  const [points, setPoints] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPoints(getPoints());
    const interval = setInterval(() => setPoints(getPoints()), 2000);
    return () => clearInterval(interval);
  }, []);

  const tier = getTier(points);
  const next = getNextTier(points);
  const progress = getProgressToNext(points);
  const code = getReferralCode(userId);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toastService.success('Referral code copied!');
  };

  return (
    <div className="rounded-2xl bg-card border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${tier.bg} flex items-center justify-center text-lg`}>
            {tier.emoji}
          </div>
          <div className="text-left">
            <p className={`text-sm font-syne font-bold ${tier.color}`}>{tier.name}</p>
            <p className="text-xs text-muted-foreground">{points.toLocaleString()} pts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">Loyalty Points</span>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/30">
              {/* Progress bar */}
              <div className="pt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className={`font-bold ${tier.color}`}>{tier.emoji} {tier.name}</span>
                  {next && <span className="text-muted-foreground">{next.emoji} {next.name} in {next.min - points} pts</span>}
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>

              {/* How to earn */}
              <div className="rounded-xl bg-muted/30 p-3 space-y-1.5">
                <p className="text-xs font-syne font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" /> How to earn points
                </p>
                {[
                  { action: 'Place an order', pts: '10 pts / ₹100' },
                  { action: 'Write a review', pts: '+50 pts' },
                  { action: 'Refer a friend', pts: '+200 pts' },
                  { action: 'First order', pts: '+250 pts' },
                ].map(({ action, pts }) => (
                  <div key={action} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{action}</span>
                    <span className="text-accent font-bold">{pts}</span>
                  </div>
                ))}
              </div>

              {/* Referral code */}
              <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-primary" /> Your referral code
                </p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 font-syne font-extrabold text-primary text-sm tracking-widest">{code}</span>
                  <button
                    onClick={copyCode}
                    className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Share this code — you get 200 pts, they get 100 pts on first order.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}