import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/services/api';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSEO } from '@/lib/seo';
import { useAuth } from '@/context/AuthContext';
import { toastService } from '@/lib/toast-service';
import EmptyState from '../components/common/EmptyState';
import PageLoader from '../components/common/PageLoader';

export default function Wishlist() {
  useSEO({ title: 'My Wishlist — AnimeNation India', url: '/wishlist' });
  const queryClient = useQueryClient();
  const { isAuthenticated, authChecked } = useAuth();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => base44.entities.WishlistItem.list(),
    enabled: isAuthenticated,
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WishlistItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toastService.wishlistError(error);
    },
  });

  const moveToCart = async (item) => {
    try {
      await base44.entities.CartItem.create({
        product_id: item.product_id,
        title: item.title,
        price: item.price,
        quantity: 1,
        image_url: item.image_url,
      });
      await base44.entities.WishlistItem.delete(item.id);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      toast.success('Moved to cart! 🛒');
    } catch (err) {
      toast.error(err?.message || 'Failed to move item to cart');
    }
  };

  if (authChecked && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-foreground font-syne font-bold text-xl mb-3">Sign in to view wishlist</p>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 font-syne font-bold">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <PageLoader text="Loading wishlist..." />;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-syne font-bold text-3xl text-foreground">
            My Wishlist <span className="text-muted-foreground text-xl font-normal">({items.length})</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Items you love — save them, then grab them before they sell out.</p>
        </motion.div>

        {items.length === 0 ? (
          <EmptyState
            icon="💔"
            title="Your wishlist is empty"
            description="No saved items yet — but your future fits are out there. Explore the collection and save what speaks to you."
            cta="Browse Products"
            ctaLink="/products"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 group"
                >
                  <Link to={`/product/${item.product_id}`} className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎌</div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`} className="text-sm font-syne font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors block leading-snug">
                      {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{item.category?.replace(/-/g, ' ')}</p>
                    <p className="text-base font-syne font-extrabold text-foreground mt-1.5">₹{item.price}</p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => moveToCart(item)}
                        className="text-xs h-8 bg-primary hover:bg-primary/90 font-syne font-bold"
                      >
                        <ShoppingBag className="w-3 h-3 mr-1.5" /> Move to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {items.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-10 text-center">
            <Link to="/products">
              <Button variant="outline" className="border-border font-syne font-bold h-11">
                Keep Shopping <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}