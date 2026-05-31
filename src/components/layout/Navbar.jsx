import React, { useState, useEffect } from 'react';
import IndiaTrustBanner from '../features/india/IndiaTrustBanner';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/common/ThemeToggle';

const CATEGORIES = [
  { label: 'T-Shirts', value: 't-shirts' },
  { label: 'Oversized T-Shirts', value: 'oversized-tshirts' },
  { label: 'Hoodies', value: 'hoodies' },
  { label: 'Posters', value: 'posters' },
  { label: 'Stickers', value: 'stickers' },
  { label: 'Keychains', value: 'keychains' },
  { label: 'Manga', value: 'manga' },
  { label: 'Action Figures', value: 'action-figures' },
  { label: 'Phone Covers', value: 'phone-covers' },
  { label: 'Mouse Pads', value: 'mouse-pads' },
  { label: 'Accessories', value: 'accessories' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart-count'],
    queryFn: () => base44.entities.CartItem.list(),
    enabled: isAuthenticated,
    initialData: [],
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['wishlist-count'],
    queryFn: () => base44.entities.WishlistItem.list(),
    enabled: isAuthenticated,
    initialData: [],
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <IndiaTrustBanner />

      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong shadow-lg shadow-primary/5' : 'glass'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-syne font-extrabold text-sm">AN</span>
              </div>
              <span className="font-syne font-bold text-lg text-foreground group-hover:text-primary transition-colors hidden sm:block">
                AnimeNation
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Home</Link>
              
              <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Categories <ChevronDown className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {catOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 mt-2 w-56 glass-strong rounded-xl p-2 shadow-xl"
                    >
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat.value}
                          to={`/products?category=${cat.value}`}
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">All Products</Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Blog</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">About</Link>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                <Search className="w-5 h-5" />
              </button>

              <Link to="/wishlist" className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                <ShoppingBag className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link to="/orders" className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground hidden sm:block">
                    <User className="w-5 h-5" />
                  </Link>
                  <Button size="sm" variant="outline" className="hidden sm:inline-flex text-xs" onClick={() => logout(true)}>
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login" className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground hidden sm:block">
                  <User className="w-5 h-5" />
                </Link>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-muted/50 md:hidden text-muted-foreground">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-4"
              >
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search anime merch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-muted/50 border-muted text-foreground"
                    autoFocus
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Search</Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden glass-strong border-t border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <Link to="/" className="block px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg">Home</Link>
                <Link to="/products" className="block px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg">All Products</Link>
                {CATEGORIES.map(cat => (
                  <Link key={cat.value} to={`/products?category=${cat.value}`} className="block px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 rounded-lg pl-6">
                    {cat.label}
                  </Link>
                ))}
                <Link to="/orders" className="block px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg">My Orders</Link>
                <Link to="/loyalty" className="block px-3 py-2 text-sm text-primary hover:bg-muted/50 rounded-lg font-semibold">🏆 Rewards</Link>
                <Link to="/blog" className="block px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg">Blog</Link>
                <Link to="/about" className="block px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg">About</Link>
                <Link to="/contact" className="block px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg">Contact</Link>
                <Link to="/faq" className="block px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg">FAQ</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}