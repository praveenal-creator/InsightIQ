import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-[#0D1424]/40 border border-dashed border-slate-800 rounded-xl ${className}`}>
      <div className="w-12 h-12 mb-4 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-cyan-400 shadow-inner">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-5 leading-relaxed">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 text-xs font-semibold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
