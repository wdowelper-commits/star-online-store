import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { ProductGrid } from '../../components/products/ProductGrid';
import { ProductFilters } from '../../components/products/ProductFilters';
import { SlidersHorizontal } from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || undefined;
  const sortParam = (searchParams.get('sort') as any) || 'newest';

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryParam);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>(sortParam);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const categories = categoryService.getCategories();
  const { products } = productService.getProducts({
    category: selectedCategory,
    inStockOnly,
    sortBy,
    minPrice,
    maxPrice,
    approvedOnly: true,
    activeOnly: true,
  });

  const handleSelectCategory = (catId?: string) => {
    setSelectedCategory(catId);
    if (catId) {
      searchParams.set('category', catId);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleReset = () => {
    setSelectedCategory(undefined);
    setInStockOnly(false);
    setSortBy('newest');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSearchParams({});
  };

  const activeCategoryObject = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Mobile Filter trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {activeCategoryObject ? activeCategoryObject.name : 'All Products'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Showing {products.length} products with Cash on Delivery
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#6C47FF]" />
          <span>Filter Products ({products.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24">
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            inStockOnly={inStockOnly}
            onToggleInStock={setInStockOnly}
            sortBy={sortBy}
            onChangeSortBy={setSortBy}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onChangePriceRange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            onReset={handleReset}
          />
        </aside>

        {/* Mobile Filters Dropdown / Sheet */}
        {isMobileFiltersOpen && (
          <div className="lg:hidden col-span-1">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => {
                handleSelectCategory(id);
                setIsMobileFiltersOpen(false);
              }}
              inStockOnly={inStockOnly}
              onToggleInStock={setInStockOnly}
              sortBy={sortBy}
              onChangeSortBy={setSortBy}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onChangePriceRange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid
            products={products}
            emptyTitle="No Products Matched Your Filter"
            emptyDescription="Try broadening your category filter or adjusting price criteria."
            onClearFilters={handleReset}
          />
        </div>
      </div>
    </div>
  );
};
