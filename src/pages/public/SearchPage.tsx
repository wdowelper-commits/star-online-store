import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { ProductGrid } from '../../components/products/ProductGrid';
import { Search, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { products } = productService.getProducts({
    search: query,
    approvedOnly: true,
    activeOnly: true,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.PRODUCTS}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Back to Products"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-[#6C47FF]" />
            <span>Search Results for:</span>
            <span className="text-[#6C47FF]">"{query}"</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Found {products.length} matching products
          </p>
        </div>
      </div>

      <ProductGrid
        products={products}
        emptyTitle={`No products found for "${query}"`}
        emptyDescription="Please check the spelling or browse our category collections."
      />
    </div>
  );
};
