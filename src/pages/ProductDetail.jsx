import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/services/api';
import { apiFetch } from '@/api/httpClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Heart, ShoppingBag, Minus, Plus,
  Share2, Zap, Star, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { toastService } from '@/lib/toast-service';

import ImageGallery from '../components/features/product/ImageGallery';
import ProductTrustBadges from '../components/features/product/ProductTrustBadges';
import DeliveryInfo from '../components/features/product/DeliveryInfo';
import ProductReviews from '../components/features/product/ProductReviews';
import StickyMobileBuy from '../components/features/product/StickyMobileBuy';
import ProductCard from '../components/features/products/ProductCard';
import { useSEO, buildProductSchema } from '@/lib/seo';
import ProductRecommendations from '../components/features/product/ProductRecommendations';

// Recently viewed stored in localStorage
function useRecentlyViewed(currentId) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (!currentId) return;
    const stored = JSON.parse(localStorage.getItem('rv') || '[]');
    const updated = [currentId, ...stored.filter(i => i !== currentId)].slice(0, 6);
    localStorage.setItem('rv', JSON.stringify(updated));
    setRecent(stored.filter(i => i !== currentId).slice(0, 4));
  }, [currentId]);

  return recent;
}

function ProductSEO({ product }) {
  useSEO({
    title: product?.title,
    description: product?.description
      ? `${product.description.slice(0, 140)}…`
      : `Buy ${product?.title} from AnimeNation India. COD available. Free shipping above ₹999.`,
    image: product?.image_url,
    url: `/product/${product?.id}`,
    schema: buildProductSchema(product),
    schemaId: 'product-schema',
  });
  return null;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [showFloatingCart, setShowFloatingCart] = useState(false);

  const recentIds = useRecentlyViewed(id);

  const { data: product, isLoading, error: productError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id }, '', 1);
      return products[0];
    },
  });

  const { data: productImages = [], error: imagesError } = useQuery({
    queryKey: ['product-images', id],
    queryFn: () => apiFetch(`/api/uploads/cloudinary/product/${id}`),
    enabled: !!id && !!product,
    initialData: [],
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related', product?.anime_series],
    queryFn: () => base44.entities.Product.filter(
      { anime_series: product.anime_series, is_active: true }, '-created_date', 6
    ),
    enabled: !!product?.anime_series,
    initialData: [],
  });

  const { data: recentProducts = [] } = useQuery({
    queryKey: ['recent-products', recentIds.join(',')],
    queryFn: async () => {
      if (!recentIds.length) return [];
      const results = await Promise.all(
        recentIds.map(rid => base44.entities.Product.filter({ id: rid }, '', 1).then(r => r[0]))
      );
      return results.filter(Boolean);
    },
    enabled: recentIds.length > 0,
    initialData: [],
  });

  // Floating cart on scroll
  useEffect(() => {
    const handler = () => setShowFloatingCart(window.scrollY > 400);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const addToCart = useCallback(async () => {
    if (product?.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size first');
      return;
    }
    try {
      await base44.entities.CartItem.create({
        product_id: product.id,
        title: product.title,
        price: product.price,
        quantity,
        size: selectedSize,
        image_url: product.image_url,
      });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
    } catch (error) {
      toastService.cartError(error);
    }
  }, [product, selectedSize, quantity, queryClient]);

  const buyNow = async () => {
    await addToCart();
    navigate('/checkout');
  };

  const addToWishlist = async () => {
    if (wishlisted) return;
    setWishlisted(true);
    try {
      await base44.entities.WishlistItem.create({
        product_id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
      });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
      toast.success('Added to wishlist!');
    } catch (error) {
      setWishlisted(false);
      toastService.wishlistError(error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  // ---- Loading skeleton ----
  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-5 w-32 bg-muted rounded-full mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-28 bg-muted rounded-full animate-pulse" />
              <div className="h-8 w-3/4 bg-muted rounded-xl animate-pulse" />
              <div className="h-8 w-1/2 bg-muted rounded-xl animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded-xl animate-pulse" />
              <div className="grid grid-cols-3 gap-2 mt-6">
                {Array(6).fill(0).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-foreground mb-3">Product not found</p>
          {productError && <p className="text-sm text-destructive mb-4">{productError.message}</p>}
          <Link to="/products" className="text-primary text-sm">← Back to Products</Link>
        </div>
      </div>
    );
  }

  const allImages = productImages.length > 0 
    ? productImages.map(img => img.url)
    : [product.image_url, ...(product.images || [])].filter(Boolean);
  
  // Debug logging
  console.log('ProductDetail Debug:', {
    id,
    product: product ? product.id : null,
    productTitle: product?.title,
    productImageUrl: product?.image_url,
    productImages: product.images,
    productImagesCount: productImages.length,
    allImagesCount: allImages.length,
    allImages,
  });
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;
  const related = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen pb-40 sm:pb-0">
      <ProductSEO product={product} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/products?category=${product.category}`} className="hover:text-foreground transition-colors capitalize">
                {product.category.replace(/-/g, ' ')}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground truncate max-w-[120px]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">
          {/* ---- LEFT: Image gallery ---- */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ImageGallery images={allImages} title={product.title} />
          </motion.div>

          {/* ---- RIGHT: Product info ---- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-2">
              {product.anime_series && (
                <Link to={`/products?series=${product.anime_series}`}>
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-syne font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors">
                    {product.anime_series.replace(/-/g, ' ')}
                  </span>
                </Link>
              )}
              {product.category && (
                <Link to={`/products?category=${product.category}`}>
                  <span className="px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-syne font-bold uppercase tracking-wider hover:text-foreground transition-colors">
                    {product.category.replace(/-/g, ' ')}
                  </span>
                </Link>
              )}
              {product.tags?.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-syne font-bold uppercase">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title & rating */}
            <div>
              <h1 className="font-syne font-extrabold text-2xl sm:text-3xl xl:text-4xl text-foreground leading-tight mb-3">
                {product.title}
              </h1>
              {product.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array(5).fill(0).map((_, j) => (
                      <Star key={j} className={`w-4 h-4 ${j < Math.round(product.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-muted fill-muted'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.review_count} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-syne font-extrabold text-4xl text-foreground">₹{product.price}</span>
              {product.compare_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">₹{product.compare_price}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-sm font-syne font-bold">
                    {discount}% OFF
                  </span>
                  <span className="text-xs text-green-400">You save ₹{product.compare_price - product.price}</span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  Out of stock
                </span>
              ) : isLowStock ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  Only {product.stock} left!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In stock
                </span>
              )}
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-syne font-bold text-foreground">Select Size</p>
                  <button className="text-xs text-primary hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-syne font-bold border-2 transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(255,31,68,0.2)]'
                          : 'border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-syne font-bold text-foreground mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-foreground hover:bg-muted hover:border-white/20 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-syne font-bold w-8 text-center text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-foreground hover:bg-muted hover:border-white/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action buttons — desktop */}
            <div className="hidden sm:flex gap-3">
              <Button
                onClick={addToCart}
                disabled={isOutOfStock}
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 h-13 font-syne font-bold text-base rounded-xl glow-red"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={buyNow}
                disabled={isOutOfStock}
                size="lg"
                className="flex-1 bg-accent hover:bg-accent/90 h-13 font-syne font-bold text-base rounded-xl"
              >
                <Zap className="w-5 h-5 mr-2" />
                Buy Now
              </Button>
              <button
                onClick={addToWishlist}
                className={`w-13 h-13 rounded-xl border-2 flex items-center justify-center transition-all ${
                  wishlisted
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 text-muted-foreground hover:border-primary/50 hover:text-primary'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-primary' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="w-13 h-13 rounded-xl border-2 border-white/10 flex items-center justify-center text-muted-foreground hover:border-white/30 hover:text-foreground transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery info */}
            <DeliveryInfo />

            {/* Trust badges */}
            <ProductTrustBadges />

            {/* Description */}
            {product.description && (
              <div className="rounded-2xl bg-card border border-white/5 p-4">
                <h3 className="font-syne font-bold text-sm text-foreground mb-2">About this Product</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Tech specs */}
            {(product.gsm || product.print_type) && (
              <div className="rounded-2xl bg-card border border-white/5 p-4 font-mono text-xs space-y-1.5">
                <p className="text-muted-foreground font-sans text-xs font-syne font-bold uppercase tracking-wider mb-2">Tech Specs</p>
                {product.gsm && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fabric Weight</span>
                    <span className="text-primary font-bold">{product.gsm} GSM</span>
                  </div>
                )}
                {product.print_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Print Method</span>
                    <span className="text-accent font-bold">{product.print_type}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="text-foreground capitalize">{product.category?.replace(/-/g, ' ')}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews */}
        <ProductReviews productId={product.id} rating={product.rating} reviewCount={product.review_count} />

        {/* AI Recommendations */}
        <ProductRecommendations currentProduct={product} excludeIds={[product.id, ...related.map(p => p.id)]} />

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="neon-line mb-8" />
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-syne font-extrabold text-2xl text-foreground">More from {product.anime_series?.replace(/-/g, ' ')}</h2>
                <p className="text-sm text-muted-foreground mt-1">You might also love these</p>
              </div>
              <Link to={`/products?series=${product.anime_series}`} className="text-sm text-primary hover:text-primary/80 font-syne font-bold hidden sm:block">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}

        {/* Recently viewed */}
        {recentProducts.length > 0 && (
          <section className="mt-16">
            <div className="neon-line mb-8" />
            <h2 className="font-syne font-extrabold text-2xl text-foreground mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recentProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile buy bar */}
      <StickyMobileBuy product={product} selectedSize={selectedSize} onAddToCart={addToCart} />

      {/* Floating add to cart (desktop, on scroll) */}
      <AnimatePresence>
        {showFloatingCart && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-20 right-6 z-40 hidden sm:flex flex-col gap-2"
          >
            <button
              onClick={addToCart}
              className="flex items-center gap-2 px-4 py-2.5 glass-strong border border-primary/30 text-white rounded-xl font-syne font-bold text-sm hover:bg-primary/20 transition-colors shadow-xl"
            >
              <ShoppingBag className="w-4 h-4 text-primary" />
              Add to Cart
            </button>
            <button
              onClick={addToWishlist}
              className={`flex items-center gap-2 px-4 py-2.5 glass-strong border rounded-xl font-syne font-bold text-sm transition-colors shadow-xl ${
                wishlisted ? 'border-primary/40 text-primary' : 'border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-primary' : ''}`} />
              Wishlist
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}