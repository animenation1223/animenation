import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Zap, Star, Newspaper, Shirt } from 'lucide-react';
import { useSEO } from '@/lib/seo';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'all', label: 'All Posts', icon: BookOpen, color: 'text-foreground' },
  { value: 'anime-news', label: 'Anime News', icon: Newspaper, color: 'text-primary' },
  { value: 'merchandise-drops', label: 'Merch Drops', icon: Zap, color: 'text-accent' },
  { value: 'style-guides', label: 'Style Guides', icon: Shirt, color: 'text-yellow-400' },
  { value: 'collection-announcements', label: 'Collections', icon: Star, color: 'text-green-400' },
];

const CATEGORY_META = {
  'anime-news': { label: 'Anime News', color: 'bg-primary/10 text-primary border-primary/20' },
  'merchandise-drops': { label: 'Merch Drop', color: 'bg-accent/10 text-accent border-accent/20' },
  'style-guides': { label: 'Style Guide', color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
  'collection-announcements': { label: 'Collection', color: 'bg-green-400/10 text-green-400 border-green-400/20' },
};

function BlogCard({ post, index, featured = false }) {
  const cat = CATEGORY_META[post.category] || CATEGORY_META['anime-news'];
  const date = post.published_date || post.created_date;

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
      >
        <Link to={`/blog/${post.slug}`} className="group block">
          <div className="relative rounded-2xl overflow-hidden border border-white/5 hover:border-primary/25 transition-all duration-500 bg-card hover:shadow-[0_0_40px_rgba(255,31,68,0.1)]">
            <div className="aspect-[16/7] overflow-hidden">
              {post.cover_image ? (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-background flex items-center justify-center text-6xl">🎌</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.color} mb-3`}>
                {cat.label}
              </span>
              <h2 className="font-syne font-bold text-xl sm:text-2xl text-white group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
              <p className="text-white/70 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center gap-3 mt-3 text-white/50 text-xs">
                {date && <span>{format(new Date(date), 'MMM d, yyyy')}</span>}
                {post.read_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.read_time} min read</span>}
                {post.author && <span>by {post.author}</span>}
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
    >
      <Link to={`/blog/${post.slug}`} className="group block h-full">
        <div className="h-full rounded-2xl overflow-hidden border border-white/5 hover:border-primary/25 transition-all duration-500 bg-card hover:shadow-[0_0_24px_rgba(255,31,68,0.08)] flex flex-col">
          <div className="aspect-video overflow-hidden flex-shrink-0 relative">
            {post.cover_image ? (
              <img
                src={post.cover_image}
                alt={post.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-background flex items-center justify-center text-4xl">🎌</div>
            )}
          </div>
          <div className="p-4 flex flex-col flex-1">
            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border w-fit ${cat.color} mb-2`}>
              {cat.label}
            </span>
            <h3 className="font-syne font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">{post.title}</h3>
            {post.excerpt && <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">{post.excerpt}</p>}
            <div className="flex items-center gap-2 mt-3 text-muted-foreground text-[10px]">
              {date && <span>{format(new Date(date), 'MMM d, yyyy')}</span>}
              {post.read_time && <><span>·</span><span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{post.read_time}m</span></>}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('all');

  useSEO({
    title: 'Anime Blog — News, Merch Drops & Style Guides',
    description: 'Stay updated with the latest anime news, exclusive merchandise drops, style guides, and collection announcements from AnimeNation India.',
    url: '/blog',
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, '-published_date', 50),
    initialData: [],
  });

  const filtered = activeCategory === 'all' ? posts : posts.filter(p => p.category === activeCategory);
  const featured = filtered.find(p => p.featured) || filtered[0];
  const rest = featured ? filtered.filter(p => p.id !== featured.id) : filtered;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 pb-20 sm:pb-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-syne font-bold border border-primary/20 mb-3">
            📰 AnimeNation Blog
          </span>
          <h1 className="font-syne font-extrabold text-3xl sm:text-5xl text-foreground">
            Anime <span className="text-primary">News</span> & Drops
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl mx-auto">
            Your go-to source for anime merch drops, style inspiration, and community news.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-syne font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  active
                    ? 'bg-primary text-white shadow-[0_0_14px_rgba(255,31,68,0.35)]'
                    : 'bg-card border border-white/5 text-muted-foreground hover:border-white/15 hover:text-foreground'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : cat.color}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card animate-pulse aspect-[4/3]" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-muted-foreground">No posts yet in this category.</p>
            <p className="text-muted-foreground text-sm mt-1">Check back soon — drops incoming!</p>
          </div>
        )}

        {/* Featured post */}
        {!isLoading && featured && (
          <div className="mb-8">
            <BlogCard post={featured} index={0} featured />
          </div>
        )}

        {/* Post grid */}
        {!isLoading && rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}