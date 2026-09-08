import React, { useState, useMemo } from "react";
import { Filter, SlidersHorizontal, X, Search, Sparkles } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { ProductCard } from "./ProductCard.tsx";

export const ShopView: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be active
      if (!p.is_active) return false;

      // Category filter
      if (selectedCategory !== "all") {
        const isMatch =
          p.category_id === selectedCategory ||
          p.slug.includes(selectedCategory) ||
          p.category_name?.toLowerCase() === selectedCategory.toLowerCase();
        if (!isMatch) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Price filter
      if (priceFilter === "under-50" && p.price >= 50) return false;
      if (priceFilter === "50-100" && (p.price < 50 || p.price > 100)) return false;
      if (priceFilter === "100-200" && (p.price < 100 || p.price > 200)) return false;
      if (priceFilter === "200-plus" && p.price < 200) return false;

      // Availability filter
      if (inStockOnly && p.stock <= 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // Featured default
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, priceFilter, inStockOnly, sortBy]);

  const activeCategoryObj = categories.find(
    (c) => c.slug === selectedCategory || c.id === selectedCategory
  );

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setPriceFilter("all");
    setInStockOnly(false);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    priceFilter !== "all" ||
    inStockOnly ||
    searchQuery.trim() !== "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Category Header Banner */}
      <div className="bg-[#f9f9f7] rounded-3xl p-6 sm:p-10 mb-8 sm:mb-12 border border-black/5 card-shadow">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5a5a40] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#1a3c34]" />
            <span>
              {activeCategoryObj ? activeCategoryObj.name : "Curated Catalog"}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium mb-3">
            {activeCategoryObj
              ? `${activeCategoryObj.name} Collection`
              : "Shop Beauty & Lifestyle"}
          </h1>
          <p className="text-sm sm:text-base text-[#5a5a40] leading-relaxed">
            {activeCategoryObj
              ? activeCategoryObj.description
              : "Explore our collection of authentic herbal hair remedies, natural barrier skincare, and comfortable footwear and bags."}
          </p>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <button
          id="shop-tab-all"
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            selectedCategory === "all"
              ? "bg-[#1a3c34] text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-[#f9f9f7] border border-black/5"
          }`}
        >
          All Products ({products.filter((p) => p.is_active).length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`shop-tab-${cat.slug}`}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.slug || selectedCategory === cat.id
                ? "bg-[#1a3c34] text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-[#f9f9f7] border border-black/5"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-black/5">
        {/* Search Bar in shop view */}
        <div className="relative flex-1 max-w-md">
          <input
            id="shop-search-input"
            type="text"
            placeholder="Search within this collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a3c34] focus:border-transparent placeholder:text-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          {/* Mobile filter button */}
          <button
            id="mobile-filter-open-btn"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden inline-flex items-center space-x-2 px-3.5 py-2 bg-white border border-stone-300 rounded-full text-xs font-semibold text-stone-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#1a3c34]" />
            )}
          </button>

          {/* Desktop inline filters */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            {/* Price dropdown */}
            <select
              id="price-filter-select"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="bg-white border border-stone-300 rounded-full px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
            >
              <option value="all">All Prices</option>
              <option value="under-50">Under GH₵50</option>
              <option value="50-100">GH₵50 — GH₵100</option>
              <option value="100-200">GH₵100 — GH₵200</option>
              <option value="200-plus">GH₵200+</option>
            </select>

            {/* In stock checkbox button */}
            <button
              id="in-stock-filter-toggle"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3.5 py-1.5 rounded-full border transition-colors ${
                inStockOnly
                  ? "bg-[#1a3c34] text-white border-[#1a3c34]"
                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
              }`}
            >
              In Stock Only
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-stone-500 hidden sm:inline">Sort:</span>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-stone-300 rounded-full px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 mb-6 text-xs">
          <span className="text-stone-500">Active filters:</span>
          {selectedCategory !== "all" && (
            <span className="inline-flex items-center bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              Category: {selectedCategory}
              <button
                onClick={() => setSelectedCategory("all")}
                className="ml-1.5 hover:text-emerald-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {priceFilter !== "all" && (
            <span className="inline-flex items-center bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-1 rounded-full font-medium">
              Price: {priceFilter}
              <button
                onClick={() => setPriceFilter("all")}
                className="ml-1.5 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-1 rounded-full font-medium">
              In Stock Only
              <button
                onClick={() => setInStockOnly(false)}
                className="ml-1.5 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-1 rounded-full font-medium">
              Keyword: "{searchQuery}"
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1.5 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-rose-600 hover:text-rose-800 underline font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 max-w-md mx-auto p-8">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">
            No products found
          </h3>
          <p className="text-stone-500 text-xs leading-relaxed mb-6">
            We couldn't find any products matching your current filters or search criteria.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-3 bg-[#1a3c34] text-white rounded-full text-xs font-semibold hover:bg-[#2a4d45] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Mobile Filter Modal Sheet */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <span className="font-serif text-lg font-semibold text-stone-900">
                  Filter Products
                </span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-3">
                  Price Range
                </span>
                <div className="space-y-2 text-sm">
                  {[
                    { id: "all", label: "All Prices" },
                    { id: "under-50", label: "Under GH₵50" },
                    { id: "50-100", label: "GH₵50 — GH₵100" },
                    { id: "100-200", label: "GH₵100 — GH₵200" },
                    { id: "200-plus", label: "GH₵200+" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center space-x-2.5 text-stone-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mobile-price"
                        checked={priceFilter === opt.id}
                        onChange={() => setPriceFilter(opt.id)}
                        className="text-[#1a3c34] focus:ring-[#1a3c34]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="pt-4 border-t border-stone-200">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-3">
                  Availability
                </span>
                <label className="flex items-center space-x-2.5 text-sm text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-[#1a3c34] focus:ring-[#1a3c34]"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 text-xs font-semibold text-stone-600 bg-stone-100 rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-[#1a3c34] hover:bg-[#2a4d45] rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
