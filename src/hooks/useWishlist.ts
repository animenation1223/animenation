import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import { WishlistItem } from '@/types';

export function useWishlistQuery(enabled: boolean = true) {
  return useQuery<WishlistItem[]>({
    queryKey: ['wishlist-items'],
    queryFn: () => base44.entities.WishlistItem.list(),
    enabled,
    initialData: [],
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}

export function useAddToWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation<WishlistItem, Error, Partial<WishlistItem>>({
    mutationFn: (data) => base44.entities.WishlistItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-items'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
    },
  });
}

export function useDeleteWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id) => base44.entities.WishlistItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-items'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
    },
  });
}
