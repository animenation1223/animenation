import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import { CartItem } from '@/types';
import { toastService } from '@/lib/toast-service';

export function useCartQuery() {
  return useQuery<CartItem[]>({
    queryKey: ['cart-items'],
    queryFn: () => base44.entities.CartItem.list(),
    initialData: [],
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  return useMutation<CartItem, Error, Partial<CartItem>>({
    mutationFn: (data) => base44.entities.CartItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
    onError: (error) => {
      toastService.cartError(error);
    },
  });
}

export function useUpdateCartMutation() {
  const queryClient = useQueryClient();
  return useMutation<CartItem, Error, { id: string; quantity: number }>({
    mutationFn: ({ id, quantity }) => base44.entities.CartItem.update(id, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
    onError: (error) => {
      toastService.cartError(error);
    },
  });
}

export function useDeleteCartMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
    onError: (error) => {
      toastService.cartError(error);
    },
  });
}
