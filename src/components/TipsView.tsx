import React, { useState, useMemo } from "react";
import { Filter, SlidersHorizontal, X, Search, Lightbulb, Sparkles, ChevronRight } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";

export const TipsView: React.FC = () => {
  const {
    tips,
    categories,
    products,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filtered Tips
  const filteredTips = useMemo(() => {
    return tips.filter((t) => {
      // Must be active
      if (!t.is_active) return false;

      // Category filter
      if (selectedCategory !== "all") {
        const isMatch =
          t.category_id === selectedCategory ||
          t.category_name?.toLowerCase() === selectedCategory.toLowerCase();
        if (!isMatch) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.product_name?.toLowerCase().includes(q) ||
          t.category_name?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => a.display_order - b.display_order);
  }, [tips, selectedCategory, searchQuery]);

  const activeCategoryObj =
    selectedCategory === "all"
      ? {
          name: "All Tips",
          description: "Browse all usage guides and tips for our products.",
        }
      : categories.find((c) => c.id === selectedCategory) || {
          name: "All Tips",
          description: "Browse all usage guides and tips for our products.",
        };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      {/* Page Header */}
      <section className="relative bg-[#1a3c34] text-white py-8 sm:py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pfy_model_duo.jpeg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3c34] via-[#1a3c34]/90 to-[#2a4d45]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <span className="text-xs sm:text-sm uppercase tracking-[0.3em] font-bold text-cream/80 block mb-2">
                Tips & Guides
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight">
                Usage Guides
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium flex items-center gap-2 border border-white/20 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tips, products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm bg-white/10 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 placeholder:text-stone-400 text-white transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Sidebar (Mobile Modal) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-stone-900">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-colors">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === "all"}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-[#1a3c34] focus:ring-[#1a3c34]"
                    />
                    <span className="text-sm text-stone-700">All Tips</span>
                  </label>
                  {categories
                    .filter((c) => c.is_active && !["bags", "slippers"].includes(c.slug))
                    .map((cat) => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-colors">
                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={selectedCategory === cat.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-[#1a3c34] focus:ring-[#1a3c34]"
                        />
                        <span className="text-sm text-stone-700">{cat.name}</span>
                      </label>
                    ))}
                </div>
              </div>
              <button onClick={clearFilters} className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-stone-700 transition-colors">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:px-0">
          {/* Desktop Filter Sidebar - part of grid so it sits alongside tips */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:h-fit">
            <div className="w-full max-w-xs bg-white rounded-3xl border border-stone-200 p-5 card-shadow space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-stone-900">Filters</h3>
                <button onClick={clearFilters} className="text-xs text-[#5a5a40] hover:text-[#1a3c34] font-medium">
                  Clear all
                </button>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-stone-500 mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-colors">
                    <input
                      type="radio"
                      name="category-desktop"
                      value="all"
                      checked={selectedCategory === "all"}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-[#1a3c34] focus:ring-[#1a3c34]"
                    />
                    <span className="text-sm text-stone-700">All Tips</span>
                  </label>
                  {categories
                    .filter((c) => c.is_active && !["bags", "slippers"].includes(c.slug))
                    .map((cat) => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-colors">
                        <input
                          type="radio"
                          name="category-desktop"
                          value={cat.id}
                          checked={selectedCategory === cat.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-[#1a3c34] focus:ring-[#1a3c34]"
                        />
                        <span className="text-sm text-stone-700">{cat.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Tips Grid */}
          <div className="lg:col-span-9">
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-stone-900 mb-1">
                {activeCategoryObj.name}
              </h2>
              <p className="text-sm text-stone-500">
                {activeCategoryObj.description}
              </p>
            </div>

            {filteredTips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredTips.map((tip) => (
                  <article
                    key={tip.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs card-hover flex flex-col h-full"
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={tip.image}
                        alt={tip.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-stone-900">
                          #{tip.display_order}
                        </span>
                        {tip.product_name && (
                          <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-stone-700">
                            {tip.product_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        <h3 className="font-serif text-base sm:text-lg font-semibold text-stone-900 truncate">
                          {tip.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 flex-1 mb-4">
                        {tip.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-stone-400 pt-3 border-t border-stone-100">
                        {tip.category_name && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {tip.category_name}
                          </span>
                        )}
                        {!tip.category_name && !tip.product_name && (
                          <span className="flex items-center gap-1 text-stone-400">
                            <Sparkles className="w-3 h-3" />
                            General Tip
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-stone-200">
                <Lightbulb className="w-12 sm:w-16 h-12 sm:h-16 mx-auto text-stone-300 mb-4" />
                <h3 className="font-serif text-lg sm:text-xl text-stone-900 mb-2">No Tips Found</h3>
                <p className="text-sm text-stone-500 mb-6 max-w-md mx-auto">
                  {selectedCategory !== "all"
                    ? "No tips available for this category yet."
                    : "No tips match your search criteria. Try adjusting your filters."}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-sm font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};