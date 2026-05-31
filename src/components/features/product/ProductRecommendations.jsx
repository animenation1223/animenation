import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import ProductCard from '../products/ProductCard';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductRecommendations({ currentProduct, excludeIds = [] }) {
  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', currentProduct?.anime_series, currentProduct?.category],
    queryFn: async () => {
      if (!currentProduct) return [];
      // First try same anime series
      const bySeries = currentProduct.anime_series
        ? await base44.entities.Product.filter({ anime_series: currentProduct.anime_series, is_active: true }, '-rating', 8)
        : [];
      // Then same category if not enough
      const byCategory = bySeries.length < 4
        ? await base44.entities.Product.filter({ category: currentProduct.category, is_active: true }, '-rating', 8)
        : [];
      const combined = [...bySeries, ...byCategory];
      const seen = new Set(excludeIds);
      return combined.filter(p => !seen.has(p.id)).slice(0, 4);
    },
    enabled: !!currentProduct,
    initialData: [],
  });

  if (recommendations.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="neon-line mb-8" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-syne font-bold text-accent uppercase tracking-wider">Recommended For You</span>
          </div>
          <h2 className="font-syne font-extrabold text-2xl text-foreground">You Might Also Love</h2>
        </div>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recommendations.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}