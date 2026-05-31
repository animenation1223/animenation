import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useSEO } from '@/lib/seo';
import { ExternalLink } from 'lucide-react';

const STATIC_PAGES = [
  { title: 'Home', path: '/', description: 'AnimeNation India landing page' },
  { title: 'All Products', path: '/products', description: 'Browse all anime merchandise' },
  { title: 'Blog', path: '/blog', description: 'Anime news, merch drops & style guides' },
  { title: 'About Us', path: '/about', description: 'Our story' },
  { title: 'Contact', path: '/contact', description: 'Get in touch' },
  { title: 'FAQ', path: '/faq', description: 'Frequently asked questions' },
  { title: 'Cart', path: '/cart', description: 'Your shopping cart' },
  { title: 'Wishlist', path: '/wishlist', description: 'Saved products' },
  { title: 'Orders', path: '/orders', description: 'Order history' },
];

const CATEGORIES = [
  'T-Shirts', 'Oversized T-Shirts', 'Hoodies', 'Posters', 'Stickers',
  'Keychains', 'Manga', 'Action Figures', 'Phone Covers', 'Mouse Pads', 'Accessories',
];
const CAT_VALUES = [
  't-shirts', 'oversized-tshirts', 'hoodies', 'posters', 'stickers',
  'keychains', 'manga', 'action-figures', 'phone-covers', 'mouse-pads', 'accessories',
];

export default function Sitemap() {
  useSEO({
    title: 'Sitemap',
    description: 'Navigate all pages, product categories, and blog posts on AnimeNation India.',
    url: '/sitemap',
  });

  const { data: products = [] } = useQuery({
    queryKey: ['sitemap-products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', 200),
    initialData: [],
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['sitemap-blog'],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, '-published_date', 100),
    initialData: [],
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 pb-20 sm:pb-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-syne font-extrabold text-3xl text-foreground mb-2">Sitemap</h1>
        <p className="text-muted-foreground text-sm mb-10">All pages and content on AnimeNation India</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Static pages */}
          <section>
            <h2 className="font-syne font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded bg-primary" />Pages
            </h2>
            <ul className="space-y-1.5">
              {STATIC_PAGES.map(page => (
                <li key={page.path}>
                  <Link to={page.path} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Categories */}
          <section>
            <h2 className="font-syne font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded bg-accent" />Categories
            </h2>
            <ul className="space-y-1.5">
              {CATEGORIES.map((cat, i) => (
                <li key={cat}>
                  <Link to={`/products?category=${CAT_VALUES[i]}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Blog posts */}
          <section>
            <h2 className="font-syne font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded bg-yellow-400" />Blog Posts
              <span className="text-xs text-muted-foreground font-normal">({posts.length})</span>
            </h2>
            <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {posts.length === 0 && <li className="text-xs text-muted-foreground">No posts yet</li>}
              {posts.map(post => (
                <li key={post.id}>
                  <Link to={`/blog/${post.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">{post.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Products */}
          <section className="sm:col-span-2 lg:col-span-3">
            <h2 className="font-syne font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded bg-green-400" />Products
              <span className="text-xs text-muted-foreground font-normal">({products.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5 max-h-60 overflow-y-auto">
              {products.map(product => (
                <Link key={product.id} to={`/product/${product.id}`} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 truncate">
                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{product.title}</span>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}