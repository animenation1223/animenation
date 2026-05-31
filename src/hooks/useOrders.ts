import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import { Order } from '@/types';

export function useOrdersQuery() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, Partial<Order>>({
    mutationFn: (data) => base44.entities.Order.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
    },
  });
}

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, { id: string; data: Partial<Order> }>({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
