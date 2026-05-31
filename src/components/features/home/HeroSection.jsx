import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  {
    badge: "⚡ Summer Drop '26",
    title: 'Dress Like the',
    highlight: 'Main Character',
    sub: "Premium anime streetwear built for the otaku who never settled for basic. 240 GSM. DTG printed. 100% vibe-certified.",
    cta: 'Shop the Drop',
    ctaLink: '/products',
    accent: 'from-primary to-accent',
    bg: 'from-primary/20 via-background to-background',
  },
  {
    badge: '🔥 150 Units Only',
    title: 'Hashira Collection',
    highlight: 'Drops June 1st',
    sub: '9 Hashira. 9 exclusive designs. Each limited to 150 pieces. Once they\'re gone, they\'re canon history.',
    cta: 'See the Collection',
    ctaLink: '/products?tag=limited',
    accent: 'from-accent to-blue-500',
    bg: 'from-accent/20 via-background to-background',
  },
  {
    badge: '🌟 Fan Picks',
    title: 'Most Copped',
    highlight: 'Anime Fits in India',
    sub: "From Naruto to JJK — the pieces the community keeps restocking. Don't miss your second chance.",
    cta: 'Shop Best Sellers',
    ctaLink: '/products?tag=bestseller',
    accent: 'from-blue-500 to-primary',
    bg: 'from-blue-600/15 via-background to-background',
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(hsl(350 100% 56% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(350 100% 56% / 1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
          />
        </AnimatePresence>
        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-accent/10 blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-blue-500/8 blur-[60px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-xs text-primary font-syne font-bold mb-6 uppercase tracking-wider">
                <Zap className="w-3 h-3" />
                {slide.badge}
              </div>

              <h1 className="font-syne font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-4">
                <span className="text-foreground block">{slide.title}</span>
                <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                  {slide.highlight}
                </span>
              </h1>

              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                {slide.sub}
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link to={slide.ctaLink}>
                  <Button size="lg" className="bg-primary hover:bg-primary/80 text-white font-syne font-bold px-8 h-13 rounded-xl glow-red text-base">
                    {slide.cta} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-syne font-bold px-8 h-13 rounded-xl text-base backdrop-blur-sm">
                    Browse All
                  </Button>
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-syne font-bold text-lg text-foreground leading-none">50K+</p>
                    <p className="text-[10px] text-muted-foreground">Happy Otakus</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                    <Star className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-syne font-bold text-lg text-foreground leading-none">4.9★</p>
                    <p className="text-[10px] text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-syne font-bold text-lg text-foreground leading-none">2000+</p>
                    <p className="text-[10px] text-muted-foreground">Products</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right: decorative anime-style visual */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-80 h-80">
              {/* Glowing rings */}
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-glow" />
              <div className="absolute inset-4 rounded-full border border-accent/15 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-8 rounded-full border border-blue-500/10 animate-pulse-glow" style={{ animationDelay: '1s' }} />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center glow-red">
                  <span className="font-syne font-extrabold text-5xl text-white">AN</span>
                </div>
              </div>
              {/* Floating tags */}
              <div className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-syne font-bold animate-slide-up">
                🔥 Trending
              </div>
              <div className="absolute -bottom-4 -left-4 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-syne font-bold animate-slide-up" style={{ animationDelay: '0.3s' }}>
                ⚡ New Drop
              </div>
              <div className="absolute top-1/2 -right-8 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-syne font-bold animate-slide-up" style={{ animationDelay: '0.6s' }}>
                ✨ Limited
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="flex gap-2 mt-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-primary' : 'w-4 bg-muted'}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}