import React from 'react';

export function CourseCardSkeleton() {
  return (
    <div className="bg-zinc-900/40 rounded-xl overflow-hidden border border-zinc-800/50 animate-pulse">
      <div className="w-full aspect-video bg-zinc-800"></div>
      <div className="p-5">
        <div className="h-6 bg-zinc-800 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-zinc-800 rounded w-1/2 mb-6"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-10 bg-zinc-800 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

export function CoursePlayerSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pt-16">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Video Area Skeleton */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-zinc-950 animate-pulse">
          <div className="w-full aspect-video bg-zinc-900 border-b border-zinc-800"></div>
          <div className="p-6">
            <div className="h-8 bg-zinc-900 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-zinc-900 rounded w-1/4 mb-8"></div>
            
            <div className="space-y-4">
              <div className="h-4 bg-zinc-900 rounded w-full"></div>
              <div className="h-4 bg-zinc-900 rounded w-full"></div>
              <div className="h-4 bg-zinc-900 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar Skeleton */}
        <div className="w-80 lg:w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col animate-pulse">
          <div className="p-4 border-b border-zinc-800">
            <div className="h-6 bg-zinc-900 rounded w-1/3"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="h-12 bg-zinc-900 rounded w-full"></div>
            <div className="h-12 bg-zinc-900 rounded w-full"></div>
            <div className="h-12 bg-zinc-900 rounded w-full"></div>
            <div className="h-12 bg-zinc-900 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
