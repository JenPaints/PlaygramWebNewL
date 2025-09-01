import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = true,
  animate = true
}) => {
  return (
    <div
      className={`bg-gray-200 ${width} ${height} ${
        rounded ? 'rounded' : ''
      } ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="h-48 bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <Skeleton height="h-4" width="w-3/4" />
        <Skeleton height="h-3" width="w-full" />
        <Skeleton height="h-3" width="w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton height="h-6" width="w-16" />
          <div className="flex space-x-2">
            <Skeleton height="h-8" width="w-8" rounded={true} />
            <Skeleton height="h-8" width="w-8" rounded={true} />
            <Skeleton height="h-8" width="w-8" rounded={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} height="h-4" width="w-20" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton key={colIndex} height="h-4" width={colIndex === 0 ? 'w-32' : 'w-24'} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard Stats Skeleton
export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton height="h-4" width="w-20" />
              <Skeleton height="h-8" width="w-16" />
            </div>
            <Skeleton height="h-12" width="w-12" rounded={true} />
          </div>
          <div className="mt-4">
            <Skeleton height="h-3" width="w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="space-y-4">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
          <Skeleton height="h-12" width="w-12" rounded={true} />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-4" width="w-1/3" />
            <Skeleton height="h-3" width="w-1/2" />
          </div>
          <Skeleton height="h-8" width="w-20" />
        </div>
      ))}
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <div className="space-y-6">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height="h-4" width="w-24" />
          <Skeleton height="h-10" width="w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton height="h-10" width="w-24" />
        <Skeleton height="h-10" width="w-24" />
      </div>
    </div>
  );
};

// Navigation Skeleton
export const NavigationSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
          <Skeleton height="h-5" width="w-5" />
          <Skeleton height="h-4" width="w-24" />
        </div>
      ))}
    </div>
  );
};

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="space-y-2">
        <Skeleton height="h-8" width="w-48" />
        <Skeleton height="h-4" width="w-64" />
      </div>
      <Skeleton height="h-10" width="w-32" />
    </div>
  );
};

// Grid Skeleton
export const GridSkeleton: React.FC<{ 
  items?: number; 
  columns?: number;
  itemHeight?: string;
}> = ({ 
  items = 6, 
  columns = 3,
  itemHeight = 'h-64'
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} gap-6`}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className={`bg-gray-200 ${itemHeight} rounded-lg animate-pulse`} />
      ))}
    </div>
  );
};

// Text Block Skeleton
export const TextBlockSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i} 
          height="h-4" 
          width={i === lines - 1 ? 'w-3/4' : 'w-full'} 
        />
      ))}
    </div>
  );
};

// Avatar Skeleton
export const AvatarSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`} />
  );
};

// Button Skeleton
export const ButtonSkeleton: React.FC<{ 
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}> = ({ variant = 'primary', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-6'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded-lg animate-pulse w-24`} />
  );
};

export default Skeleton;