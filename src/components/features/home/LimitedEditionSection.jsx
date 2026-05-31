import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../products/ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';

export default function LimitedEditionSection({ products, isLoading }) {
  return (
    <section className="py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header — styled differently */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-accent/10 to-blue-600/10" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(45deg, hsl(350 100% 56% / 1) 1px, transparent 1px), linear-gradient(-45deg, hsl(271 91% 65% / 1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-syne font-bold text-primary uppercase tracking-widest">Exclusive</span>
              </div>
              <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground">
                Limited Edition Collection
              </h2>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Get them before they're gone — extremely limited stock
              </p>
            </div>
            <Link
              to="/products?tag=limited"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-syne font-bold hover:bg-primary/20 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {isLoading
            ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
          }
        </div>
      </div>
    </section>
  );
}