import React, { useState } from 'react';
import { base44 } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { toastService } from '@/lib/toast-service';
import { motion } from 'framer-motion';
import { addPoints, POINTS_CONFIG } from '@/lib/loyalty';

export default function WriteReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toastService.error('Please select a rating'); return; }
    if (!name.trim()) { toastService.error('Please enter your name'); return; }
    setSubmitting(true);
    await base44.entities.Review.create({
      product_id: productId,
      reviewer_name: name,
      rating,
      comment,
      is_approved: false,
    });
    addPoints(POINTS_CONFIG.review);
    queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    setSubmitted(true);
    toast.success('Review submitted! You earned +50 loyalty points 🎉');
    onSubmitted?.();
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-green-500/5 border border-green-500/20 p-6 text-center"
      >
        <div className="text-3xl mb-2">🎌</div>
        <h3 className="font-syne font-bold text-foreground mb-1">Review Submitted!</h3>
        <p className="text-sm text-muted-foreground">Your review is pending approval. You earned <span className="text-accent font-bold">+50 loyalty points</span>!</p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-2xl bg-card border border-white/5 p-5 space-y-4"
    >
      <h3 className="font-syne font-bold text-foreground">Write a Review</h3>
      <p className="text-xs text-muted-foreground -mt-2">Earn +50 loyalty points for submitting a review</p>

      {/* Star rating */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Your Rating *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-125"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hover || rating) ? 'fill-yellow-500 text-yellow-500' : 'text-muted'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Your Name *</p>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Arjun S."
          className="bg-muted/30 border-border h-9"
          maxLength={40}
        />
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Your Review</p>
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Tell fellow otakus what you think..."
          className="bg-muted/30 border-border resize-none"
          rows={3}
          maxLength={500}
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary hover:bg-primary/90 font-syne font-bold h-10"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </motion.form>
  );
}