import React from 'react';
import { LucideIcon, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionText,
  actionLink,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 my-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
      <div className="w-16 h-16 rounded-2xl bg-[#EDE9FF] dark:bg-[#6C47FF]/20 text-[#6C47FF] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          {actionText}
        </Link>
      )}

      {actionText && !actionLink && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
