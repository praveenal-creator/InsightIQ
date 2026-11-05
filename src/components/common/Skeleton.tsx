import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular'
}) => {
  const baseClasses = 'animate-pulse bg-slate-800/60 border border-slate-700/20';
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="border-b border-slate-800/40 animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-slate-800/70 rounded w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export const CardSkeleton: React.FC = () => (
  <div className="p-5 bg-[#0D1424] border border-slate-800/80 rounded-xl animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-800 rounded w-28" />
      <div className="w-8 h-8 rounded-lg bg-slate-800" />
    </div>
    <div className="h-7 bg-slate-800 rounded w-20" />
    <div className="h-3 bg-slate-800/60 rounded w-36" />
  </div>
);
