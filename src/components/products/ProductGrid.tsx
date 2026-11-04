import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';
import { PackageSearch } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyTitle = 'Koi Product Nahi Mila',
  emptyDescription = 'Try adjusting your search criteria, category selection, or price filters.',
  onClearFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3 animate-pulse"
          >
            <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-9 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={emptyTitle}
        description={emptyDescription}
        actionText={onClearFilters ? 'Clear All Filters' : undefined}
        onActionClick={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
