import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BANNERS = [
  {
    label: '🔥 Flash Sale — 48 Hrs Only',
    title: 'UP TO 40% OFF',
    sub: 'Hoodies, Oversized Tees & more. The arc is short. Don\'t sleep on it.',
    cta: 'Grab Deals',
    link: '/products?category=hoodies',
    gradient: 'from-primary/90 via-primary/70 to-accent/80',
    border: 'border-primary/30',
  },
  {
    label: '⚡ Just Dropped',
    title: 'NEW ARRIVALS',
    sub: 'JJK, Demon Slayer & Chainsaw Man fresh prints — straight from our design lab.',
    cta: 'Shop New',
    link: '/products?tag=new-arrival',
    gradient: 'from-accent/90 via-accent/60 to-blue-600/80',
    border: 'border-accent/30',
  },
  {
    label: '🎁 Free Delivery',
    title: 'ON ORDERS ₹999+',
    sub: 'COD pan-India. UPI, Cards, Net Banking — zero surprises at the door.',
    cta: 'Start Shopping',
    link: '/products',
    gradient: 'from-blue-700/80 via-blue-600/60 to-primary/70',
    border: 'border-blue-500/30',
  },
];

export default function OfferBanners() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Desktop: show all 3 */}
        <div className="hidden sm:grid grid-cols-3 gap-4">
          {BANNERS.map((b, i) => (
            <Link key={i} to={b.link}>
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.gradient} border ${b.border} p-5 group cursor-pointer hover:scale-[1.02] transition-transform duration-300`}>
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative">
                  <span className="text-xs font-syne font-bold text-white/80 uppercase tracking-widest">{b.label}</span>
                  <h3 className="font-syne font-extrabold text-2xl text-white mt-1 mb-1">{b.title}</h3>
                  <p className="text-white/70 text-xs mb-3">{b.sub}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-syne font-bold text-white group-hover:gap-2 transition-all">
                    {b.cta} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile: carousel */}
        <div className="sm:hidden relative overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
            >
              <Link to={BANNERS[current].link}>
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${BANNERS[current].gradient} border ${BANNERS[current].border} p-6`}>
                  <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="relative">
                    <span className="text-xs font-syne font-bold text-white/80 uppercase tracking-widest">{BANNERS[current].label}</span>
                    <h3 className="font-syne font-extrabold text-3xl text-white mt-1 mb-1">{BANNERS[current].title}</h3>
                    <p className="text-white/70 text-sm mb-4">{BANNERS[current].sub}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-syne font-bold text-white">
                      {BANNERS[current].cta} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-1.5 mt-3">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-primary' : 'w-2 bg-muted'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}