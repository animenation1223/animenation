import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-muted" />
      <div className="p-3.5 space-y-2">
        <div className="h-2.5 w-16 bg-muted rounded-full" />
        <div className="h-3.5 w-full bg-muted rounded-full" />
        <div className="h-3.5 w-3/4 bg-muted rounded-full" />
        <div className="h-4 w-20 bg-muted rounded-full mt-3" />
      </div>
    </div>
  );
}