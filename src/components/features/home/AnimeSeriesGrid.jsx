import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ANIME_SERIES = [
  { name: 'Naruto', slug: 'naruto', emoji: '🍥', color: 'hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]' },
  { name: 'One Piece', slug: 'one-piece', emoji: '🏴‍☠️', color: 'hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]' },
  { name: 'Attack on Titan', slug: 'attack-on-titan', emoji: '⚔️', color: 'hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]' },
  { name: 'Demon Slayer', slug: 'demon-slayer', emoji: '🔥', color: 'hover:border-primary/40 hover:shadow-[0_0_20px_rgba(255,31,68,0.1)]' },
  { name: 'Dragon Ball', slug: 'dragon-ball', emoji: '🐉', color: 'hover:border-yellow-500/40 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]' },
  { name: 'Jujutsu Kaisen', slug: 'jujutsu-kaisen', emoji: '👁️', color: 'hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]' },
  { name: 'Chainsaw Man', slug: 'chainsaw-man', emoji: '🪚', color: 'hover:border-red-600/40 hover:shadow-[0_0_20px_rgba(220,38,38,0.1)]' },
  { name: 'Bleach', slug: 'bleach', emoji: '💀', color: 'hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]' },
  { name: 'Tokyo Revengers', slug: 'tokyo-revengers', emoji: '🏍️', color: 'hover:border-blue-400/40 hover:shadow-[0_0_20px_rgba(96,165,250,0.1)]' },
  { name: 'Spy x Family', slug: 'spy-x-family', emoji: '🥜', color: 'hover:border-pink-500/40 hover:shadow-[0_0_20px_rgba(236,72,153,0.1)]' },
];

export default function AnimeSeriesGrid() {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-syne font-bold border border-accent/20 mb-3">
            🎌 Shop by Universe
          </span>
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground">Find Your Anime</h2>
          <p className="text-muted-foreground text-sm mt-2">Gear from every arc, every universe, every fight.</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {ANIME_SERIES.map((series, i) => (
            <motion.div
              key={series.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/products?series=${series.slug}`}
                className={`group block p-5 rounded-xl bg-card border border-border/50 ${series.color} transition-all duration-300 text-center`}
              >
                <span className="text-3xl mb-3 block transition-transform duration-300 group-hover:scale-110">{series.emoji}</span>
                <span className="text-sm font-syne font-semibold text-foreground group-hover:text-primary transition-colors">
                  {series.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}