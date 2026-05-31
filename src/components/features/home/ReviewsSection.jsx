import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REVIEWS = [
  { name: 'Arjun S.', city: 'Mumbai', rating: 5, avatar: '🧑', text: 'The Jujutsu Kaisen hoodie is insane quality. 320 GSM and the print is still perfect after 20 washes. AnimeNation is the only store I trust for premium merch.' },
  { name: 'Priya M.', city: 'Delhi', rating: 5, avatar: '👩', text: 'Got my Naruto Shadow Clone poster in 2 days — the packaging was immaculate, rolled in a protective tube. Looks museum-worthy on my wall. Ordering again!' },
  { name: 'Rahul K.', city: 'Bangalore', rating: 5, avatar: '🧑‍💻', text: 'Bought 5 oversized tees so far. The Gojo Infinity tee gets me compliments every time I wear it. COD option made it so easy for my first order.' },
  { name: 'Sneha P.', city: 'Pune', rating: 4, avatar: '👩‍🎨', text: 'Finally got the complete Attack on Titan manga set! Perfect condition, fast delivery, and the packaging protected every volume. Already eyeing more.' },
  { name: 'Dev R.', city: 'Chennai', rating: 5, avatar: '🧑‍🎤', text: 'The Demon Slayer Rengoku Hoodie is everything the product page promised. Limited edition quality, worth every rupee. Already told 10 friends about this store.' },
  { name: 'Ananya T.', city: 'Hyderabad', rating: 5, avatar: '👩‍🏫', text: 'Spy x Family Anya phone case — literally the cutest thing on my desk. Great print, snaps on perfectly. Customer support was also super helpful!' },
];

export default function ReviewsSection() {
  const [page, setPage] = useState(0);
  const perPage = typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 4;
  const totalPages = Math.ceil(REVIEWS.length / perPage);
  const visible = REVIEWS.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground">What Our Otakus Say</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />)}
              </div>
              <span className="text-xs text-muted-foreground">4.9 avg · 50,000+ happy customers</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/20 transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/20 transition-all disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {visible.map((review, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-card border border-border/50 hover:border-accent/25 transition-all duration-300 flex flex-col"
              >
                <Quote className="w-5 h-5 text-accent/40 mb-3 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">"{review.text}"</p>
                <div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1,2,3,4,5].map(j => (
                      <Star key={j} className={`w-3 h-3 ${j <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{review.avatar}</span>
                    <div>
                      <p className="text-sm font-syne font-bold text-foreground leading-tight">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.city} · Verified Buyer</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {Array(totalPages).fill(0).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-1.5 rounded-full transition-all ${i === page ? 'w-6 bg-primary' : 'w-2 bg-muted'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}