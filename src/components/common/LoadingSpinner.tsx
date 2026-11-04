import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 'md',
  fullPage = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[#6C47FF]`} />
      {label && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[50vh] flex items-center justify-center">{content}</div>;
  }

  return content;
};
