import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const CAT_COLORS = {
  'anime-news': 'bg-primary/10 text-primary border-primary/20',
  'merchandise-drops': 'bg-accent/10 text-accent border-accent/20',
  'style-guides': 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  'collection-announcements': 'bg-green-400/10 text-green-400 border-green-400/20',
};
const CAT_LABELS = {
  'anime-news': 'Anime News',
  'merchandise-drops': 'Merch Drop',
  'style-guides': 'Style Guide',
  'collection-announcements': 'Collection',
};

export default function BlogPreviewSection() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-preview'],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, '-published_date', 3),
    initialData: [],
  });

  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-7">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-syne font-bold border border-accent/20 mb-2">
              📰 From the Blog
            </span>
            <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground">
              Anime <span className="text-accent">News</span> & Drops
            </h2>
          </div>
          <Link to="/blog" className="hidden sm:flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-syne font-bold transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card animate-pulse aspect-[4/3]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {posts.map((post, i) => {
              const catStyle = CAT_COLORS[post.category] || CAT_COLORS['anime-news'];
              const date = post.published_date || post.created_date;
              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link to={`/blog/${post.slug}`} className="group block h-full">
                    <div className="h-full rounded-2xl overflow-hidden border border-white/5 hover:border-accent/25 transition-all duration-500 bg-card flex flex-col">
                      <div className="aspect-video overflow-hidden flex-shrink-0">
                        {post.cover_image ? (
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent/20 via-primary/10 to-background flex items-center justify-center text-4xl">🎌</div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border w-fit ${catStyle} mb-2`}>
                          {CAT_LABELS[post.category] || post.category}
                        </span>
                        <h3 className="font-syne font-semibold text-sm text-foreground group-hover:text-accent transition-colors line-clamp-2 flex-1">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-muted-foreground text-[10px]">
                          {date && <span>{format(new Date(date), 'MMM d, yyyy')}</span>}
                          {post.read_time && (
                            <><span>·</span><span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{post.read_time}m</span></>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}

        <div className="mt-5 text-center sm:hidden">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-primary font-syne font-bold">
            View All Posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}