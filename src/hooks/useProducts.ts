import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import { Product } from '@/types';

export function useProductsQuery(limit: number = 200) {
  return useQuery<Product[]>({
    queryKey: ['products', { limit }],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', limit),
    initialData: [],
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}

export function useAdminProductsQuery() {
  return useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
    initialData: [],
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
}

export function useProductQuery(id: string) {
  return useQuery<Product | null>({
    queryKey: ['product', id],
    queryFn: async () => {
      const results = await base44.entities.Product.filter({ id });
      return results[0] || null;
    },
    staleTime: 1000 * 60 * 10, // 10 mins cache
  });
}

export function useProductRecommendationsQuery(currentProduct?: Product | null, limit: number = 8) {
  return useQuery<Product[]>({
    queryKey: ['product-recommendations', currentProduct?.id, limit],
    queryFn: async () => {
      if (!currentProduct) return [];
      // 1. Try series
      if (currentProduct.anime_series) {
        const seriesItems = await base44.entities.Product.filter(
          { anime_series: currentProduct.anime_series, is_active: true },
          '-rating',
          limit
        );
        const filtered = seriesItems.filter((p) => p.id !== currentProduct.id);
        if (filtered.length > 0) return filtered;
      }
      // 2. Try category
      const catItems = await base44.entities.Product.filter(
        { category: currentProduct.category, is_active: true },
        '-rating',
        limit
      );
      return catItems.filter((p) => p.id !== currentProduct.id);
    },
    enabled: !!currentProduct,
    initialData: [],
    staleTime: 1000 * 60 * 10,
  });
}

export function useRecentProductsQuery(limit: number = 4) {
  return useQuery<Product[]>({
    queryKey: ['recent-products', limit],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', limit),
    initialData: [],
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, Partial<Product>>({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { id: string; data: Partial<Product> }>({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

export function useUpdateProductStockMutation() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { id: string; stock: number }>({
    mutationFn: ({ id, stock }) => base44.entities.Product.update(id, { stock }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}
