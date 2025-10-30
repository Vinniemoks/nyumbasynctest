import React from 'react';

// Base skeleton component
export const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`}></div>
);

// Card skeleton
export const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    <Skeleton height="h-6" width="w-3/4" />
    <Skeleton height="h-4" width="w-full" />
    <Skeleton height="h-4" width="w-5/6" />
    <div className="flex space-x-2 mt-4">
      <Skeleton height="h-10" width="w-24" />
      <Skeleton height="h-10" width="w-24" />
    </div>
  </div>
);

// Table skeleton
export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <Skeleton height="h-6" width="w-48" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="h-4" width="w-full" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// List skeleton
export const SkeletonList = ({ items = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <Skeleton height="h-12" width="w-12" className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-4" width="w-1/3" />
            <Skeleton height="h-3" width="w-1/2" />
          </div>
        </div>
        <Skeleton height="h-3" width="w-full" />
        <Skeleton height="h-3" width="w-4/5" />
      </div>
    ))}
  </div>
);

// Dashboard skeleton
export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton height="h-8" width="w-64" />
      <Skeleton height="h-4" width="w-96" />
    </div>
    
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 space-y-3">
          <Skeleton height="h-4" width="w-24" />
          <Skeleton height="h-8" width="w-32" />
          <Skeleton height="h-3" width="w-20" />
        </div>
      ))}
    </div>
    
    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonCard />
      </div>
      <div>
        <SkeletonList items={3} />
      </div>
    </div>
  </div>
);

// Form skeleton
export const SkeletonForm = ({ fields = 4 }) => (
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    <Skeleton height="h-6" width="w-48" />
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton height="h-4" width="w-32" />
        <Skeleton height="h-10" width="w-full" />
      </div>
    ))}
    <div className="flex space-x-3 pt-4">
      <Skeleton height="h-10" width="w-32" />
      <Skeleton height="h-10" width="w-32" />
    </div>
  </div>
);

export default Skeleton;
