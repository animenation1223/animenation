import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { toastService } from '@/lib/toast-service';

export default function ProductCard({ product, index = 0 }) {
  const queryClient = useQueryClient();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingCart(true);
    try {
      await base44.entities.CartItem.create({
        product_id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        size: product.sizes?.[0] || '',
        image_url: product.image_url,
      });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toastService.success('Added to cart!');
    } catch (err) {
      toastService.cartError(err);
    } finally {
      setAddingCart(false);
    }
  };

  const addToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await base44.entities.WishlistItem.create({
        product_id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
      });
      setWishlisted(true);
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toastService.success('Added to wishlist!');
    } catch (err) {
      toastService.wishlistError(err);
    }
  };

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const isLimited = product.tags?.includes('limited');
  const isNew = product.tags?.includes('new-arrival');
  const isBestseller = product.tags?.includes('bestseller');

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-white/5 hover:border-primary/25 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,31,68,0.12)]">

          {/* Image container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                {product.category === 'hoodies' ? '🧥' : product.category === 'manga' ? '📚' : product.category === 'action-figures' ? '🏮' : '👕'}
              </div>
            )}

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            {/* Top left badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
              {isLimited && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-primary to-accent text-white text-[9px] font-syne font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Limited
                </span>
              )}
              {isNew && !isLimited && (
                <span className="px-2 py-0.5 bg-accent text-white text-[9px] font-syne font-bold rounded-md uppercase tracking-wider">New</span>
              )}
              {isBestseller && (
                <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-syne font-bold rounded-md uppercase tracking-wider">🔥 Hot</span>
              )}
              {discount > 0 && (
                <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-syne font-bold rounded-md">-{discount}%</span>
              )}
            </div>

            {/* Wishlist heart — always visible top-right */}
            <button
              onClick={addToWishlist}
              className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-xl glass flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                wishlisted ? 'text-primary' : 'text-white/70 hover:text-primary'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-primary' : ''}`} />
            </button>

            {/* Quick add to cart — slides up on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={addToCart}
                disabled={addingCart}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-syne font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {addingCart ? 'Adding...' : 'Quick Add'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3.5">
            {/* Anime category tag */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="px-1.5 py-0.5 rounded-md bg-muted text-[9px] font-syne font-bold text-muted-foreground uppercase tracking-wider">
                {product.anime_series?.replace(/-/g, ' ') || product.category?.replace(/-/g, ' ')}
              </span>
            </div>

            <h3 className="text-sm font-syne font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {product.title}
            </h3>

            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-syne font-bold text-foreground">₹{product.price}</span>
                {product.compare_price && (
                  <span className="text-xs text-muted-foreground line-through">₹{product.compare_price}</span>
                )}
              </div>
              {product.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs text-muted-foreground font-medium">{product.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}