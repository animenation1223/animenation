import React, { useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import WriteReviewForm from './WriteReviewForm';
import { Button } from '@/components/ui/button';

function StarRow({ rating, size = 4 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array(5).fill(0).map((_, i) => (
        <Star key={i} className={`w-${size} h-${size} ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted fill-muted'}`} />
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, rating, reviewCount }) {
  const [showForm, setShowForm] = useState(false);

  const { data: userReviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ product_id: productId, is_approved: true }),
    enabled: !!productId,
    initialData: [],
  });

  const allReviews = userReviews.map(r => ({
    name: r.reviewer_name || 'Anonymous',
    location: 'India',
    rating: r.rating,
    date: r.created_date
      ? new Date(r.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
    text: r.comment,
    verified: true,
  }));

  return (
    <div className="mt-12">
      <div className="neon-line mb-8" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-syne font-extrabold text-2xl text-foreground">Customer Reviews</h3>
          {reviewCount > 0 && <p className="text-sm text-muted-foreground mt-0.5">{reviewCount} verified reviews</p>}
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm" className="font-syne font-bold border-primary/30 text-primary">
          {showForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {rating > 0 && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-muted/30 border border-white/5">
          <span className="font-syne font-extrabold text-4xl text-foreground">{rating.toFixed(1)}</span>
          <div>
            <StarRow rating={Math.round(rating)} />
            <p className="text-xs text-muted-foreground mt-1">Based on {reviewCount} reviews</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <WriteReviewForm productId={productId} onSuccess={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {allReviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {allReviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-card border border-white/5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-syne font-bold text-foreground">{review.name}</p>
                    {review.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-green-400">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{review.location} · {review.date}</p>
                </div>
                <StarRow rating={review.rating} size={3} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
