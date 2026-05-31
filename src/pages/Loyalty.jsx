import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSEO } from '@/lib/seo';
import {
  getPoints, getTier, getNextTier, getProgressToNext,
  getReferralCode, getReferralsMade, TIERS, addPoints, fetchLoyaltyAccount
} from '@/lib/loyalty';
import { Gift, Copy, Share2, Zap, Star, ShoppingBag, Trophy, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Loyalty() {
  useSEO({ title: 'Loyalty & Rewards — AnimeNation India', url: '/loyalty' });
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyAccount().then(() => {
      setPoints(getPoints());
      setLoading(false);
    });
  }, []);
  const tier = getTier(points);
  const next = getNextTier(points);
  const progress = getProgressToNext(points);
  const code = getReferralCode();
  const referralsMade = getReferralsMade();

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Referral code copied! Share with friends to earn 200 pts.');
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join AnimeNation India',
        text: `Use my referral code ${code} on AnimeNation India and get ₹100 off your first order! India's #1 anime merchandise store.`,
        url: window.location.origin,
      });
    } else {
      copyCode();
    }
  };

  // Demo: add points
  const demoAdd = (pts, label) => {
    addPoints(pts);
    setPoints(getPoints());
    toast.success(`+${pts} pts earned for ${label}! 🎉`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-syne font-bold mb-4">
            <Trophy className="w-3.5 h-3.5" /> Loyalty Programme
          </div>
          <h1 className="font-syne font-extrabold text-3xl sm:text-4xl text-foreground mb-2">
            Your Otaku <span className="text-primary">Rewards</span>
          </h1>
          <p className="text-muted-foreground text-sm">Earn points on every order. Unlock exclusive tiers. Redeem for discounts.</p>
        </motion.div>

        {/* Points card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/20 p-6 sm:p-8"
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/5 blur-[60px]" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Your Balance</p>
                <p className="font-syne font-extrabold text-5xl text-foreground">{points.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Loyalty Points</p>
              </div>
              <div className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl ${tier.bg} border border-white/5`}>
                <span className="text-2xl">{tier.emoji}</span>
                <span className={`text-xs font-syne font-extrabold ${tier.color}`}>{tier.name}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{tier.emoji} {tier.name}</span>
                {next ? <span>{next.emoji} {next.name} — {(next.min - points).toLocaleString()} pts away</span> : <span>🏆 Max Tier!</span>}
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* All tiers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="font-syne font-bold text-lg text-foreground mb-4">Rank Up — Unlock More</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {TIERS.map((t, i) => {
              const isActive = tier.name === t.name;
              const isUnlocked = points >= t.min;
              return (
                <div
                  key={t.name}
                  className={`rounded-xl p-3 text-center border transition-all ${
                    isActive
                      ? 'border-primary/40 bg-primary/10 shadow-[0_0_16px_rgba(255,31,68,0.1)]'
                      : isUnlocked
                        ? 'border-border/50 bg-card/80'
                        : 'border-border/20 bg-card/40 opacity-50'
                  }`}
                >
                  <div className="text-xl mb-1">{t.emoji}</div>
                  <p className={`text-xs font-syne font-extrabold ${isActive ? t.color : 'text-foreground'}`}>{t.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.min.toLocaleString()}+ pts</p>
                  {isActive && <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary mx-auto animate-pulse" />}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* How to earn */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-syne font-bold text-lg text-foreground mb-4">Ways to Earn Points</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: ShoppingBag, label: 'Place an Order', pts: '10 pts per ₹100', color: 'text-primary', bg: 'bg-primary/10', action: () => demoAdd(50, 'demo purchase') },
              { icon: Star, label: 'Write a Review', pts: '+50 pts', color: 'text-yellow-400', bg: 'bg-yellow-400/10', action: () => demoAdd(50, 'review') },
              { icon: Gift, label: 'Refer a Friend', pts: '+200 pts', color: 'text-accent', bg: 'bg-accent/10', action: null },
              { icon: Zap, label: 'First Order Bonus', pts: '+250 pts', color: 'text-green-400', bg: 'bg-green-400/10', action: null },
            ].map(({ icon: Icon, label, pts, color, bg, action }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-all">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-syne font-semibold text-foreground">{label}</p>
                  <p className={`text-xs font-bold ${color}`}>{pts}</p>
                </div>
                {action && (
                  <button onClick={action} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1 transition-colors">
                    Demo
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Referral section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-gradient-to-br from-accent/10 via-card to-primary/5 border border-accent/20 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-syne font-bold text-foreground">Refer & Earn</h2>
              <p className="text-xs text-muted-foreground">You earn 200 pts · Friend gets 100 pts on their first order</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-white/5 mb-4">
            <span className="flex-1 font-syne font-extrabold text-primary text-lg tracking-[0.2em]">{code}</span>
            <button onClick={copyCode} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3">
            <Button onClick={copyCode} variant="outline" className="flex-1 border-border h-10 text-sm font-syne font-bold">
              <Copy className="w-4 h-4 mr-2" /> Copy Code
            </Button>
            <Button onClick={shareCode} className="flex-1 bg-accent hover:bg-accent/90 h-10 text-sm font-syne font-bold">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>

          {referralsMade > 0 && (
            <p className="text-xs text-center text-muted-foreground mt-3">
              You've successfully referred <span className="text-accent font-bold">{referralsMade} friend{referralsMade > 1 ? 's' : ''}</span> so far 🎉
            </p>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center pb-8">
          <Link to="/products">
            <Button size="lg" className="bg-primary hover:bg-primary/90 font-syne font-bold px-10 h-12 glow-red">
              Earn Points — Shop Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}