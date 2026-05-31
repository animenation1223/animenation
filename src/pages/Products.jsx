import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { base44 } from '@/services/api';
import { useSEO } from '@/lib/seo';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/features/products/ProductCard';
import ProductGridSkeleton from '../components/common/ProductGridSkeleton';
import EmptyState from '../components/common/EmptyState';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { label: 'All Categories', value: 'all' },
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

const ANIME = [
  { label: 'All Anime', value: 'all' },
  { label: 'Naruto', value: 'naruto' },
  { label: 'One Piece', value: 'one-piece' },
  { label: 'Attack on Titan', value: 'attack-on-titan' },
  { label: 'Demon Slayer', value: 'demon-slayer' },
  { label: 'Dragon Ball', value: 'dragon-ball' },
  { label: 'Jujutsu Kaisen', value: 'jujutsu-kaisen' },
  { label: 'Chainsaw Man', value: 'chainsaw-man' },
  { label: 'Bleach', value: 'bleach' },
  { label: 'Tokyo Revengers', value: 'tokyo-revengers' },
  { label: 'Spy x Family', value: 'spy-x-family' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-created_date' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Best Rating', value: '-rating' },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [series, setSeries] = useState(searchParams.get('series') || 'all');
  const [sort, setSort] = useState('-created_date');
  const [showFilters, setShowFilters] = useState(false);

  // Sync state with URL params on navigation
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'all';
    const urlSeries = searchParams.get('series') || 'all';
    const urlSearch = searchParams.get('search') || '';

    setCategory(urlCategory);
    setSeries(urlSeries);
    setSearch(urlSearch);
  }, [searchParams, location.pathname]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', category, series, search],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', 200),
    initialData: [],
  });

  const filtered = useMemo(() => {
    let result = [...products];
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.anime_series?.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') result = result.filter(p => p.category === category);
    if (series !== 'all') result = result.filter(p => p.anime_series === series);

    if (sort === 'price') result.sort((a, b) => a.price - b.price);
    else if (sort === '-price') result.sort((a, b) => b.price - a.price);
    else if (sort === '-rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    return result;
  }, [products, search, category, series, sort]);

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setSeries('all');
    setSort('-created_date');
    // Update URL to clear params
    window.history.replaceState({}, '', '/products');
  };

  const hasFilters = search || category !== 'all' || series !== 'all';

  const catLabel = category !== 'all' ? CATEGORIES.find(c => c.value === category)?.label : null;
  useSEO({
    title: catLabel ? `${catLabel} — Anime Merchandise` : 'Shop All Anime Merchandise',
    description: catLabel
      ? `Buy ${catLabel} anime merchandise in India. Best quality, COD available, free shipping above ₹999.`
      : 'Browse all anime merchandise — T-shirts, hoodies, figures, manga, posters & more. Shop the latest drops from AnimeNation India.',
    url: '/products',
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-syne font-bold text-3xl sm:text-4xl text-foreground">
            {category !== 'all' ? CATEGORIES.find(c => c.value === category)?.label : 'All Products'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} products found</p>
        </div>

        {/* Search & filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border h-11"
            />
          </div>
          <Button
            variant="outline"
            className="border-border sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </Button>
          <div className="hidden sm:flex gap-3">
            <Select value={category} onValueChange={(value) => {
              setCategory(value);
              const params = new URLSearchParams(searchParams.toString());
              if (value === 'all') params.delete('category');
              else params.set('category', value);
              window.history.replaceState({}, '', `/products?${params.toString()}`);
            }}>
              <SelectTrigger className="w-44 bg-card border-border h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={series} onValueChange={(value) => {
              setSeries(value);
              const params = new URLSearchParams(searchParams.toString());
              if (value === 'all') params.delete('series');
              else params.set('series', value);
              window.history.replaceState({}, '', `/products?${params.toString()}`);
            }}>
              <SelectTrigger className="w-44 bg-card border-border h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIME.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 bg-card border-border h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden mb-6"
            >
              <div className="space-y-3 p-4 rounded-xl bg-card border border-border">
                <Select value={category} onValueChange={(value) => {
                  setCategory(value);
                  const params = new URLSearchParams(searchParams.toString());
                  if (value === 'all') params.delete('category');
                  else params.set('category', value);
                  window.history.replaceState({}, '', `/products?${params.toString()}`);
                }}>
                  <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={series} onValueChange={(value) => {
                  setSeries(value);
                  const params = new URLSearchParams(searchParams.toString());
                  if (value === 'all') params.delete('series');
                  else params.set('series', value);
                  window.history.replaceState({}, '', `/products?${params.toString()}`);
                }}>
                  <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANIME.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mb-4">
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}

        {/* Product grid */}
        {isLoading ? (
          <ProductGridSkeleton count={12} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No Products Found"
            description="Try adjusting your filters or search term — there's a whole world of merch waiting."
            cta="Clear Filters"
            ctaAction={clearFilters}
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}