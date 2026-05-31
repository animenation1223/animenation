import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowLeft, Tag, Share2 } from 'lucide-react';
import { useSEO, buildBlogSchema } from '@/lib/seo';
import Breadcrumb from '@/components/common/Breadcrumb';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CATEGORY_LABELS = {
  'anime-news': 'Anime News',
  'merchandise-drops': 'Merch Drop',
  'style-guides': 'Style Guide',
  'collection-announcements': 'Collection',
};

export default function BlogPostPage() {
  const { slug } = useParams();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => base44.entities.BlogPost.filter({ slug, is_published: true }, '-published_date', 1),
  });

  const post = posts[0] || null;

  useSEO({
    title: post?.meta_title || post?.title,
    description: post?.meta_description || post?.excerpt,
    image: post?.cover_image,
    url: `/blog/${slug}`,
    schema: post ? buildBlogSchema(post) : null,
    schemaId: 'blog-post-schema',
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['blog-related', post?.category],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true, category: post.category }, '-published_date', 4),
    enabled: !!post,
  });
  const related = relatedPosts.filter(p => p.id !== post?.id).slice(0, 3);

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-card animate-pulse aspect-video mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-4 bg-muted rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">📭</div>
        <p className="text-muted-foreground">Post not found.</p>
        <Link to="/blog" className="text-primary hover:underline text-sm">← Back to Blog</Link>
      </div>
    );
  }

  const date = post.published_date || post.created_date;

  return (
    <div className="min-h-screen pb-20 sm:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <Breadcrumb items={[
          { name: 'Blog', path: '/blog' },
          { name: CATEGORY_LABELS[post.category] || 'Post', path: `/blog?category=${post.category}` },
          { name: post.title },
        ]} />

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Cover image */}
          {post.cover_image && (
            <div className="rounded-2xl overflow-hidden aspect-video mb-8">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
            {post.tags?.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl text-foreground leading-tight mb-4">
            {post.title}
          </h1>

          {/* Author + date + share */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-6 border-b border-border mb-8">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {post.author && <span className="font-medium text-foreground">By {post.author}</span>}
              {date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(date), 'MMMM d, yyyy')}
                </span>
              )}
              {post.read_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{post.read_time} min read
                </span>
              )}
            </div>
            <button
              onClick={share}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-inter italic border-l-2 border-primary pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          {post.content && (
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none
              prose-headings:font-syne prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-img:rounded-xl prose-img:w-full
              prose-blockquote:border-primary prose-blockquote:text-muted-foreground
              prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:rounded">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          )}
        </motion.article>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-syne font-bold text-xl mb-5">More from the Blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group block rounded-xl overflow-hidden border border-white/5 hover:border-primary/20 transition-all bg-card">
                  {p.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-syne font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}