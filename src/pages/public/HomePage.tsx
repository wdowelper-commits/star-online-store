import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Image as ImageIcon, Check, UploadCloud, X } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { ProductGrid } from '../../components/products/ProductGrid';
import { db, INITIAL_HERO_SETTINGS } from '../../lib/storage';
import { HeroSettings } from '../../types';
import { ROUTES } from '../../constants/routes';

export const HomePage: React.FC = () => {
  const categories = categoryService.getCategories();
  const { products: featuredProducts } = productService.getProducts({
    approvedOnly: true,
    activeOnly: true,
  });

  const featured = featuredProducts.filter((p) => p.is_featured).slice(0, 4);
  const trending = [...featuredProducts]
    .sort((a, b) => b.order_count - a.order_count)
    .slice(0, 4);

  // Hero customizable settings
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(() => db.getHeroSettings());
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [editCard1Url, setEditCard1Url] = useState(heroSettings.card1_image);
  const [editCard1Tag, setEditCard1Tag] = useState(heroSettings.card1_tag);
  const [editCard1Title, setEditCard1Title] = useState(heroSettings.card1_title);
  const [editCard2Url, setEditCard2Url] = useState(heroSettings.card2_image);
  const [editCard2Tag, setEditCard2Tag] = useState(heroSettings.card2_tag);
  const [editCard2Title, setEditCard2Title] = useState(heroSettings.card2_title);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenCustomize = () => {
    setEditCard1Url(heroSettings.card1_image);
    setEditCard1Tag(heroSettings.card1_tag);
    setEditCard1Title(heroSettings.card1_title);
    setEditCard2Url(heroSettings.card2_image);
    setEditCard2Tag(heroSettings.card2_tag);
    setEditCard2Title(heroSettings.card2_title);
    setIsCustomizeOpen(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updateHeroSettings({
      card1_image: editCard1Url.trim() || heroSettings.card1_image,
      card1_tag: editCard1Tag.trim() || heroSettings.card1_tag,
      card1_title: editCard1Title.trim() || heroSettings.card1_title,
      card2_image: editCard2Url.trim() || heroSettings.card2_image,
      card2_tag: editCard2Tag.trim() || heroSettings.card2_tag,
      card2_title: editCard2Title.trim() || heroSettings.card2_title,
    });
    setHeroSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsCustomizeOpen(false);
    }, 900);
  };

  const handleCard1FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditCard1Url(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCard2FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditCard2Url(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    const reset = db.updateHeroSettings(INITIAL_HERO_SETTINGS);
    setHeroSettings(reset);
    setEditCard1Url(reset.card1_image);
    setEditCard1Tag(reset.card1_tag);
    setEditCard1Title(reset.card1_title);
    setEditCard2Url(reset.card2_image);
    setEditCard2Tag(reset.card2_tag);
    setEditCard2Title(reset.card2_title);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section - STRICT DOM HIERARCHY FOR FOCUS SELECTORS */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <img
            src={heroSettings.bg_image || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=80"}
            alt="Artisanal craft showcase"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-purple-200 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Multi-Vendor Marketplace · Pakistan & South Asia</span>
              </div>
              <button
                type="button"
                onClick={handleOpenCustomize}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3 h-3" />
                <span>Customize Showcase Images</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight font-display">
              Curated Artisanal Goods, Direct from Master Vendors.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Discover authentic full-grain leather, handloom textiles, high-fidelity audio, and artisanal creations with reliable Cash on Delivery across the country.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={ROUTES.PRODUCTS}
                className="px-6 py-3.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={ROUTES.SIGNUP}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-semibold transition-all backdrop-blur-xs"
              >
                Become a Vendor
              </Link>
            </div>
          </div>

          {/* Right Column: 2 Showcase Cards matching CSS selector 1 and 2 */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {/* Column 1: Selector 2 Target */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-800 shadow-lg border border-white/10 relative group">
                <img
                  src={heroSettings.card1_image}
                  alt={heroSettings.card1_title || "Leather Bag"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-300">{heroSettings.card1_tag}</p>
                <p className="text-sm font-semibold mt-1">{heroSettings.card1_title}</p>
              </div>
            </div>

            {/* Column 2: Selector 1 Target */}
            <div className="space-y-4 pt-8">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">{heroSettings.card2_tag}</p>
                <p className="text-sm font-semibold mt-1">{heroSettings.card2_title}</p>
              </div>
              <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-800 shadow-lg border border-white/10 relative group">
                <img
                  src={heroSettings.card2_image}
                  alt={heroSettings.card2_title || "Headphones"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Customize Showcase Images (Both URL and File Upload) */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#6C47FF]" />
                  Apni Marzi Ki Showcase Images Lagayein
                </h3>
                <p className="text-xs text-slate-500">
                  Add image URL or upload image file for the two hero cards
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Image 1 Settings */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C47FF]">
                    Showcase Image 1 (Left Card)
                  </h4>
                  <span className="text-[11px] text-slate-400">Target Card 1</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 sm:col-span-1">
                    <img
                      src={editCard1Url}
                      alt="Preview 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Image URL:
                      </label>
                      <input
                        type="url"
                        value={editCard1Url}
                        onChange={(e) => setEditCard1Url(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-[#6C47FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Or Upload File from Device:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCard1FileUpload}
                        className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6C47FF]/10 file:text-[#6C47FF] hover:file:bg-[#6C47FF]/20 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Badge Text:
                    </label>
                    <input
                      type="text"
                      value={editCard1Tag}
                      onChange={(e) => setEditCard1Tag(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Card Title:
                    </label>
                    <input
                      type="text"
                      value={editCard1Title}
                      onChange={(e) => setEditCard1Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Image 2 Settings */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Showcase Image 2 (Right Card)
                  </h4>
                  <span className="text-[11px] text-slate-400">Target Card 2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 sm:col-span-1">
                    <img
                      src={editCard2Url}
                      alt="Preview 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Image URL:
                      </label>
                      <input
                        type="url"
                        value={editCard2Url}
                        onChange={(e) => setEditCard2Url(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-[#6C47FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Or Upload File from Device:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCard2FileUpload}
                        className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600/10 file:text-emerald-600 hover:file:bg-emerald-600/20 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Badge Text:
                    </label>
                    <input
                      type="text"
                      value={editCard2Tag}
                      onChange={(e) => setEditCard2Tag(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Card Title:
                    </label>
                    <input
                      type="text"
                      value={editCard2Title}
                      onChange={(e) => setEditCard2Title(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Reset to Default Images
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomizeOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Saved Successfully!</span>
                      </>
                    ) : (
                      <span>Save Showcase Images</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Shop by Category / تمام کیٹیگریز
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse hand-picked products from registered independent sellers across all {categories.length} departments
            </p>
          </div>
          <Link
            to={ROUTES.CATEGORIES}
            className="text-xs font-bold text-[#6C47FF] hover:underline flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl"
          >
            <span>View All ({categories.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`${ROUTES.PRODUCTS}?category=${cat.id}`}
              className="group p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-[#6C47FF] dark:hover:border-[#6C47FF] transition-all hover:shadow-xs text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#6C47FF] flex items-center justify-center font-bold text-base mb-2.5 group-hover:scale-110 group-hover:shadow-md transition-all overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0">
                {cat.icon_url && (cat.icon_url.startsWith('http://') || cat.icon_url.startsWith('https://') || cat.icon_url.startsWith('data:image')) ? (
                  <img
                    src={cat.icon_url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{cat.name.charAt(0)}</span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#6C47FF] transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Featured Vendor Picks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hand-picked collections verified for exceptional quality
            </p>
          </div>
          <Link
            to={ROUTES.PRODUCTS}
            className="text-xs font-bold text-[#6C47FF] hover:underline flex items-center gap-1"
          >
            <span>Explore All ({featuredProducts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid products={featured} emptyTitle="No featured products found" />
      </section>

      {/* Value Proposition Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-purple-600 text-white rounded-xl shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Nationwide Cash on Delivery
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Zero advance payment required. Inspect parcel upon arrival and pay cash directly to the courier rider.
              </p>
            </div>
          </div>

          <div className="p-6 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Verified Vendor Standards
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Every independent artisan is manually vetted by administrators before listing products in the marketplace.
              </p>
            </div>
          </div>

          <div className="p-6 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Direct WhatsApp Support (03027628552)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Send orders directly to our official WhatsApp helpline or track your delivery in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Trending Top Sellers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Most requested items this week across Pakistani cities
            </p>
          </div>
        </div>

        <ProductGrid products={trending} emptyTitle="No trending items available" />
      </section>
    </div>
  );
};
