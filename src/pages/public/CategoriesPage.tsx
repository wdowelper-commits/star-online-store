import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Search,
  Smartphone,
  Briefcase,
  Shirt,
  Footprints,
  Home,
  Sparkles,
  Watch,
  Trophy,
  Baby,
  Apple,
  BookOpen,
  Car,
  PackageCheck,
  MessageSquare,
} from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import { ROUTES } from '../../constants/routes';
import { ZENVO_WHATSAPP_RAW, getWhatsAppSupportUrl } from '../../lib/whatsapp';

// Map icon string to Lucide icon component
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Smartphone,
  Briefcase,
  Shirt,
  Footprints,
  Home,
  Sparkles,
  Watch,
  Trophy,
  Baby,
  Apple,
  BookOpen,
  Car,
};

export const CategoriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const categories = categoryService.getCategories();
  const { products } = productService.getProducts({ approvedOnly: true, activeOnly: true });

  // Get product count per category
  const getProductCount = (catId: string) => {
    return products.filter((p) => p.category_id === catId).length;
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-purple-200 border border-white/10">
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>Complete Marketplace Catalog · 12 Major Categories</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
            All Categories / تمام کیٹیگریز
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Browse our complete curated directory of independent artisans, handlooms, high-fidelity tech, and household goods. Order with 100% Cash on Delivery across Pakistan.
          </p>

          {/* Real-time Category Search */}
          <div className="pt-2 relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category (e.g. Leather, Audio, Shoes)..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#6C47FF]"
            />
            <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* WhatsApp Assistance Chip */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-slate-300 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            Can't find a specific product? Ask our support team directly.
          </span>
          <a
            href={getWhatsAppSupportUrl('Assalam-o-Alaikum! Mujhe ek specific category ke baare mein poochna hai.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Helpline ({ZENVO_WHATSAPP_RAW})</span>
          </a>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Browse By Department ({filteredCategories.length})
          </h2>
          <Link
            to={ROUTES.PRODUCTS}
            className="text-xs font-bold text-[#6C47FF] hover:underline flex items-center gap-1"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredCategories.map((category) => {
            const IconComponent = (category.icon_url && CATEGORY_ICONS[category.icon_url]) || Layers;
            const count = getProductCount(category.id);

            return (
              <Link
                key={category.id}
                to={`${ROUTES.PRODUCTS}?category=${category.id}`}
                className="group p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#6C47FF] dark:hover:border-[#6C47FF] rounded-3xl transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#6C47FF] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#6C47FF] group-hover:text-white transition-all shadow-xs">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#6C47FF] transition-colors">
                    {category.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    {count} {count === 1 ? 'Product Available' : 'Products Available'} · COD Verified
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#6C47FF]">
                  <span>Explore Items</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
