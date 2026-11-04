import React from 'react';
import { Category } from '../../types';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string | undefined) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  onChangeSortBy: (sort: 'newest' | 'price-asc' | 'price-desc' | 'popular') => void;
  minPrice?: number;
  maxPrice?: number;
  onChangePriceRange: (min?: number, max?: number) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onChangeSortBy,
  minPrice,
  maxPrice,
  onChangePriceRange,
  onReset,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
          <SlidersHorizontal className="w-4 h-4 text-[#6C47FF]" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#6C47FF] hover:underline flex items-center gap-1 font-medium cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onChangeSortBy(e.target.value as any)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6C47FF]"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="popular">Most Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Categories
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onSelectCategory(undefined)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-[#EDE9FF] text-[#6C47FF] dark:bg-[#6C47FF]/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#EDE9FF] text-[#6C47FF] dark:bg-[#6C47FF]/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice !== undefined ? minPrice : ''}
            onChange={(e) =>
              onChangePriceRange(
                e.target.value ? Number(e.target.value) : undefined,
                maxPrice
              )
            }
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice !== undefined ? maxPrice : ''}
            onChange={(e) =>
              onChangePriceRange(
                minPrice,
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            In Stock Only
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 text-[#6C47FF] rounded focus:ring-0 cursor-pointer accent-[#6C47FF]"
          />
        </label>
      </div>
    </div>
  );
};
