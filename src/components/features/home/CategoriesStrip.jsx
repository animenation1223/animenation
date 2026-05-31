import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shirt, Image, Sticker, KeyRound, BookOpen, Gamepad2, Smartphone, Mouse, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { label: 'T-Shirts', value: 't-shirts', icon: Shirt },
  { label: 'Hoodies', value: 'hoodies', icon: Shirt },
  { label: 'Posters', value: 'posters', icon: Image },
  { label: 'Stickers', value: 'stickers', icon: Sticker },
  { label: 'Keychains', value: 'keychains', icon: KeyRound },
  { label: 'Manga', value: 'manga', icon: BookOpen },
  { label: 'Figures', value: 'action-figures', icon: Gamepad2 },
  { label: 'Phone Covers', value: 'phone-covers', icon: Smartphone },
  { label: 'Mouse Pads', value: 'mouse-pads', icon: Mouse },
  { label: 'Accessories', value: 'accessories', icon: Sparkles },
];

export default function CategoriesStrip() {
  return (
    <section className="py-8 px-4 sm:px-6 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-3 sm:gap-4 min-w-max sm:min-w-0 sm:grid sm:grid-cols-5 lg:grid-cols-10">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/products?category=${cat.value}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">{cat.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}