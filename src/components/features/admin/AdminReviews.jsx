import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import { Star, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviews() {
  const qc = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date'),
    initialData: [],
  });

  const approveMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.update(id, { is_approved: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Review approved'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Review deleted'); },
  });

  const pending = reviews.filter(r => !r.is_approved);
  const approved = reviews.filter(r => r.is_approved);

  const ReviewCard = ({ review }) => (
    <div className={`p-4 rounded-2xl border transition-colors ${review.is_approved ? 'bg-card border-green-500/10' : 'bg-card border-yellow-500/10'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-syne font-bold text-foreground">{review.reviewer_name || 'Anonymous'}</p>
            {review.is_approved
              ? <span className="px-1.5 py-0.5 rounded text-[9px] bg-green-500/10 text-green-400 font-bold">APPROVED</span>
              : <span className="px-1.5 py-0.5 rounded text-[9px] bg-yellow-500/10 text-yellow-400 font-bold">PENDING</span>
            }
          </div>
          <div className="flex items-center gap-0.5 mb-2">
            {Array(5).fill(0).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} />
            ))}
          </div>
          {review.comment && <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>}
          <p className="text-[10px] text-muted-foreground mt-2">
            {review.created_date ? new Date(review.created_date).toLocaleDateString('en-IN') : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {!review.is_approved && (
            <button onClick={() => approveMutation.mutate(review.id)} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-colors">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => deleteMutation.mutate(review.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-white/5 text-center">
          <p className="font-syne font-extrabold text-2xl text-foreground">{reviews.length}</p>
          <p className="text-xs text-muted-foreground">Total Reviews</p>
        </div>
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-center">
          <p className="font-syne font-extrabold text-2xl text-yellow-400">{pending.length}</p>
          <p className="text-xs text-muted-foreground">Pending Approval</p>
        </div>
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
          <p className="font-syne font-extrabold text-2xl text-green-400">{approved.length}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </div>
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="font-syne font-bold text-sm text-yellow-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Pending Reviews ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-syne font-bold text-sm text-green-400 mb-3">Approved Reviews ({approved.length})</h3>
        <div className="space-y-3">
          {approved.map(r => <ReviewCard key={r.id} review={r} />)}
          {approved.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No approved reviews yet</p>}
        </div>
      </div>
    </div>
  );
}