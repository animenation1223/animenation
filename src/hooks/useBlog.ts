import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import { BlogPost } from '@/types';

export function useBlogPostsQuery(limit: number = 50) {
  return useQuery<BlogPost[]>({
    queryKey: ['blog-posts', { limit }],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, '-published_date', limit),
    initialData: [],
    staleTime: 1000 * 60 * 10, // 10 mins cache
  });
}

export function useBlogPostQuery(slug?: string) {
  return useQuery<BlogPost | null>({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) return null;
      const posts = await base44.entities.BlogPost.filter({ slug, is_published: true }, '-published_date', 1);
      return posts[0] || null;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}

export function useRelatedBlogPostsQuery(category?: string, currentSlug?: string, limit: number = 4) {
  return useQuery<BlogPost[]>({
    queryKey: ['related-blog-posts', category, currentSlug, limit],
    queryFn: async () => {
      if (!category) return [];
      const posts = await base44.entities.BlogPost.filter({ is_published: true, category }, '-published_date', limit + 1);
      return posts.filter((p) => p.slug !== currentSlug).slice(0, limit);
    },
    enabled: !!category,
    initialData: [],
    staleTime: 1000 * 60 * 10,
  });
}
