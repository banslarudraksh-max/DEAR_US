import React from 'react';
import { Sparkles } from 'lucide-react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-12 space-y-4">
        <div className="h-6 w-36 rounded-full skeleton-shimmer border border-[#DFBF99]/20" />
        <div className="h-12 w-64 rounded-xl skeleton-shimmer border border-[#DFBF99]/20" />
        <div className="h-4 w-80 rounded-md skeleton-shimmer border border-[#DFBF99]/15" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#DFBF99]/18 bg-[#1B0B1E]/60 p-4 shadow-xl backdrop-blur-md space-y-4"
          >
            <div className="aspect-[4/3] w-full rounded-xl skeleton-shimmer border border-white/5" />
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 rounded skeleton-shimmer" />
                <div className="h-3 w-20 rounded skeleton-shimmer" />
              </div>
              <div className="h-5 w-3/4 rounded-md skeleton-shimmer" />
              <div className="h-3 w-full rounded skeleton-shimmer" />
              <div className="h-3 w-2/3 rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
