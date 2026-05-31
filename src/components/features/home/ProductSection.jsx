import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../products/ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';

export default function ProductSection({ title, subtitle, products, link, linkLabel = 'View All', isLoading = false }) {
  return (
    <section className="py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
          </div>
          {link && (
            <Link
              to={link}
              className="hidden sm:flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-syne font-bold group"
            >
              {linkLabel}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {isLoading
            ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
          }
        </div>

        {link && (
          <div className="mt-8 text-center sm:hidden">
            <Link to={link} className="inline-flex items-center gap-1 text-sm text-primary font-syne font-bold">
              {linkLabel} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}