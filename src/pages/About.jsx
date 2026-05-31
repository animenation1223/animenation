import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Truck, Shield, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const VALUES = [
  { icon: Heart, title: 'For Otakus, By Otakus', desc: 'Every product is curated by anime fans who understand the culture.' },
  { icon: Star, title: 'Premium Quality', desc: 'We source only the best materials — 180+ GSM tees, premium prints, authentic figures.' },
  { icon: Truck, title: 'Pan-India Delivery', desc: 'From Kashmir to Kanyakumari, we deliver to every corner of India.' },
  { icon: Shield, title: 'Trust & Authenticity', desc: '100% genuine merchandise with secure payments and easy returns.' },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl text-foreground mb-4">
            About <span className="text-primary">AnimeNation</span> India
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            India's premier destination for authentic anime merchandise. Born from passion, built for the Otaku community.
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-syne font-bold text-2xl text-foreground mb-4">Our Story</h2>
            <div className="text-muted-foreground space-y-4 leading-relaxed">
              <p>
                AnimeNation India was born from a simple frustration — why should Indian anime fans settle for low-quality merch or pay insane shipping fees from overseas?
              </p>
              <p>
                Founded in 2024, we set out to create the ultimate anime merchandise destination for India. Every product in our store is carefully curated, quality-tested, and priced fairly for the Indian market.
              </p>
              <p>
                From the bustling streets of Mumbai to every corner of the country, we deliver premium anime gear — T-shirts, hoodies, figures, manga, and more — right to your doorstep with COD support and free shipping on orders above ₹999.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-syne font-bold text-2xl text-foreground mb-8 text-center">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-xl bg-card border border-border/50 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-syne font-bold text-sm text-foreground mb-2">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-syne font-bold text-2xl text-foreground mb-4">Ready to Level Up Your Merch Game?</h2>
          <Link to="/products">
            <Button size="lg" className="bg-primary hover:bg-primary/90 font-syne font-bold h-12 px-8 glow-red">
              Explore Collection <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}