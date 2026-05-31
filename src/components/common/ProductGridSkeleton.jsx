import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-muted" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2.5 w-16 bg-muted rounded-full" />
        <div className="h-3.5 w-full bg-muted rounded-full" />
        <div className="h-3 w-3/4 bg-muted rounded-full" />
        <div className="flex justify-between mt-3">
          <div className="h-4 w-14 bg-muted rounded-full" />
          <div className="h-3.5 w-10 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGridSkeleton({ count = 8, cols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' }) {
  return (
    <div className={`grid ${cols} gap-4 sm:gap-6`}>
      {Array(count).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}