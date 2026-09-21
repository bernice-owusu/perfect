import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  CheckCircle2,
  Star,
  ShoppingBag,
  Leaf,
} from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { ProductCard } from "./ProductCard.tsx";

export const HomeView: React.FC = () => {
  const { products, categories, reviews, navigate, setSelectedCategory } =
    useStore();

  const hairProducts = products
    .filter((p) => p.category_id === "cat-hair" && p.is_active && !p.is_set)
    .slice(0, 4);
  const skincareProducts = products
    .filter((p) => p.category_id === "cat-skincare" && p.is_active && !p.is_set)
    .slice(0, 4);
  const slippersProducts = products
    .filter((p) => p.category_id === "cat-slippers" && p.is_active && !p.is_set)
    .slice(0, 4);
  const bagsProducts = products
    .filter((p) => p.category_id === "cat-bags" && p.is_active && !p.is_set)
    .slice(0, 4);
  const accessoriesProducts = products
    .filter((p) => p.category_id === "cat-accessories" && p.is_active && !p.is_set)
    .slice(0, 4);
  const setProducts = products
    .filter((p) => p.is_set && p.is_active)
    .slice(0, 4);

  const handleSetsSelect = () => {
    setSelectedCategory("sets");
    navigate("shop", { categorySlug: "sets" });
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    navigate("shop", { categorySlug: slug });
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -85;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#f5f2ed] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 sm:pt-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block">
                Healthy Hair, Happy Skin
              </span>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.08] text-[#1a3c34] tracking-tight font-medium">
                Beauty, Care <br />
                & Style— <br />
                <span className="italic font-normal">Perfect For You</span>
              </h1>

              <p className="text-[#5a5a40] text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed italic">
                Discover carefully selected products for your hair, skin and
                everyday style, crafted for confidence.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  id="hero-shop-now-btn"
                  onClick={() => {
                    setSelectedCategory("all");
                    navigate("shop");
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-sm font-semibold tracking-wide transition-all flex items-center justify-center space-x-2 shadow-sm"
                >
                  <span>Shop Collections</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Micro-Badges */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-6 border-t border-black/5 text-left">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1a3c34] shrink-0" />
                  <span className="text-xs text-[#5a5a40] font-bold">
                    100% Organic Roots
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-[#1a3c34] shrink-0" />
                  <span className="text-xs text-[#5a5a40] font-bold">
                    Fast Ghana Delivery
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#1a3c34] shrink-0" />
                  <span className="text-xs text-[#5a5a40] font-bold">
                    Paystack Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[420px] mx-auto">
                <div className="w-full aspect-[4/5] bg-[#1a3c34] rounded-[50px] sm:rounded-[100px] overflow-hidden relative shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a3c34]/40 to-transparent z-10" />
                  <img
                    src="/images/pyf_model_collection.jpeg"
                    alt="PERFECT FOR YOU Natural Care Collection"
                    className="w-full h-full object-cover opacity-95"
                  />
                </div>

                <div className="absolute -bottom-3 left-2 sm:-left-6 sm:-bottom-4 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl card-shadow flex items-center gap-3 sm:gap-4 max-w-[220px] sm:max-w-[260px] z-20 border border-black/5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f5f5f0] rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a3c34]" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-tighter text-[#5a5a40] font-bold">
                      Verified Product
                    </p>
                    <p className="font-serif text-xs sm:text-sm font-bold text-[#1a3c34]">
                      100% Organic Extracts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SECTION */}
      <section
        id="categories-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
              Curated Collections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory("all");
              navigate("shop");
            }}
            className="mt-3 sm:mt-0 text-[#5a5a40] text-xs font-bold uppercase tracking-widest border-b border-[#5a5a40]/30 pb-1 hover:text-[#1a3c34] transition-colors inline-flex items-center space-x-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none snap-x">
          {categories.map((cat) => (
            <div
              key={cat.id}
              id={`cat-card-${cat.slug}`}
              onClick={() => handleCategorySelect(cat.slug)}
              className="group relative rounded-2xl overflow-hidden bg-[#f9f9f7] aspect-3/4 flex flex-col justify-end p-5 cursor-pointer card-shadow hover:shadow-xl transition-all duration-300 shrink-0 snap-start w-[220px] sm:w-[240px]"
            >
              <img
                src={cat.image}
                alt={cat.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("/images/pfy_model_duo.jpeg")) {
                    target.src = "/images/pfy_model_duo.jpeg";
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#112923]/90 via-[#112923]/40 to-transparent" />

              <div className="relative z-10 text-white">
                <span className="text-[10px] tracking-widest uppercase text-emerald-200 font-bold block mb-0.5">
                  {cat.item_count ? `${cat.item_count} Items` : "Collection"}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-200 line-clamp-1 mb-2.5 opacity-90 hidden sm:block">
                  {cat.description}
                </p>
                <div className="inline-flex items-center text-xs font-semibold text-white group-hover:text-emerald-200 transition-colors">
                  <span>Shop {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SIGNATURE SETS */}
      {setProducts.length > 0 && (
        <section
          id="sets-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 space-y-8"
        >
          <div className="bg-[#1a3c34] text-white rounded-3xl overflow-hidden card-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-medium">
                  <span>Everything Put Together For You 🎁</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                  Shop Our Sets. <br />
                  <span className="italic font-medium text-emerald-200">
                    One Bundle, One Price.
                  </span>
                </h2>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
                  We mostly sell in sets — different items carefully put
                  together so you get a complete routine in a single order. Just
                  pick the set, and it arrives ready for you.
                </p>

                <div className="pt-2">
                  <button
                    id="promo-shop-sets-btn"
                    onClick={handleSetsSelect}
                    className="px-8 py-4 bg-white text-[#1a3c34] hover:bg-[#f9f9f7] rounded-full font-semibold text-sm tracking-wide transition-all inline-flex items-center space-x-2 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Shop All Sets</span>
                  </button>
                </div>
              </div>

              <div className="hidden lg:block lg:col-span-5 relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] bg-[#112923]">
                <img
                  src="/images/pfy_hair_set.jpg"
                  alt="Perfect For You complete sets"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a3c34] via-transparent to-transparent lg:hidden" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
                  Curated Bundles
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#1a3c34] font-medium">
                  Complete Sets &amp; Gift Packages
                </h3>
              </div>
              <button
                onClick={handleSetsSelect}
                className="text-[#5a5a40] text-xs font-bold uppercase tracking-widest border-b border-[#5a5a40]/30 pb-1 hover:text-[#1a3c34] transition-colors inline-flex items-center space-x-1"
              >
                <span>View All Sets</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {setProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. HAIR CARE SECTION */}
      <section
        id="hair-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 space-y-8"
      >
        <div className="bg-[#1a3c34] text-white rounded-3xl overflow-hidden card-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-medium">
                <span>Healthy Hair Starts Here 🌿</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Nourish. Strengthen. <br />
                <span className="italic font-medium text-emerald-200">
                  Watch Your Crown Grow.
                </span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
                Our authentic formulas blend raw unrefined shea butter, amla,
                chebe, cold-pressed castor, and rosemary oil. Designed
                specifically for low & high porosity natural hair to combat
                shedding and dryness.
              </p>

              <div className="pt-2">
                <button
                  id="promo-shop-hair-btn"
                  onClick={() => handleCategorySelect("hair")}
                  className="px-8 py-4 bg-white text-[#1a3c34] hover:bg-[#f9f9f7] rounded-full font-semibold text-sm tracking-wide transition-all inline-flex items-center space-x-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Hair Care Collection</span>
                </button>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5 relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] bg-[#112923]">
              <img
                src="/images/pfy_model_duo.jpeg"
                alt="PERFECT FOR YOU Nourishing Hair Care"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3c34] via-transparent to-transparent lg:hidden" />
            </div>
          </div>
        </div>

        {/* Hair Care Products Grid */}
        <div>
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
                Pure Herbal Infusions
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#1a3c34] font-medium">
                Hair Oils, Masks & Complete Sets
              </h3>
            </div>
            <button
              onClick={() => handleCategorySelect("hair")}
              className="text-[#5a5a40] text-xs font-bold uppercase tracking-widest border-b border-[#5a5a40]/30 pb-1 hover:text-[#1a3c34] transition-colors inline-flex items-center space-x-1"
            >
              <span>View All Hair</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {hairProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. SKINCARE SECTION */}
      <section
        id="skincare-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 space-y-8"
      >
        <div className="bg-[#2a4d45] text-white rounded-3xl overflow-hidden card-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="hidden lg:block lg:col-span-5 relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] bg-[#1a3c34] order-2 lg:order-1">
              <img
                src="/images/pfy_black_soap.jpg"
                alt="PERFECT FOR YOU African Black Soap"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-4 left-4 bg-[#112923]/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15 text-[11px] text-emerald-200 font-medium">
                Healthy Hair, Happy Skin 🌿
              </div>
            </div>

            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-medium">
                <span>Nourish & Glow 🌸</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Authentic Black Soap & Botanicals. <br />
                <span className="italic font-medium text-emerald-200">
                  Healthy Hair, Happy Skin.
                </span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
                Crafted with plantain skin ash, cocoa pod ash, raw forest honey,
                and pure unrefined Northern Ghanaian shea butter. Gently
                purifies pores, clears blemishes, and balances moisture without
                stripping your skin or scalp.
              </p>

              <div className="pt-2">
                <button
                  id="promo-shop-skincare-btn"
                  onClick={() => handleCategorySelect("skincare")}
                  className="px-8 py-4 bg-white text-[#1a3c34] hover:bg-[#f9f9f7] rounded-full font-semibold text-sm tracking-wide transition-all inline-flex items-center space-x-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Skincare & Black Soap</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* {skincareProducts.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
                  Gentle Barrier Care
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#1a3c34] font-medium">
                  Soaps, Butters & Facial Balms
                </h3>
              </div>
              <button
                onClick={() => handleCategorySelect("skincare")}
                className="text-[#5a5a40] text-xs font-bold uppercase tracking-widest border-b border-[#5a5a40]/30 pb-1 hover:text-[#1a3c34] transition-colors inline-flex items-center space-x-1"
              >
                <span>View All Skincare</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {skincareProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )} */}
      </section>

      {/* 5. SLIPPERS & BAGS COMBINED */}
      <section
        id="lifestyle-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 space-y-8"
      >
        {/* Slippers */}
        <div className="bg-[#f5f2ed] border border-black/5 rounded-3xl p-8 sm:p-12 lg:p-14 card-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block">
                Everyday Comfort & Elegance
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium">
                Slippers & Slide Sandals
              </h2>
              <p className="text-xs sm:text-sm text-[#5a5a40] max-w-lg">
                Effortless comfort designed for everyday Ghanaian lifestyles.
              </p>
            </div>
            <button
              id="view-all-slippers-btn"
              onClick={() => handleCategorySelect("slippers")}
              className="px-6 py-3 bg-[#1a3c34] text-white hover:bg-[#2a4d45] rounded-full text-xs font-semibold tracking-wide transition-all inline-flex items-center space-x-2 self-start md:self-auto shrink-0 shadow-xs"
            >
              <span>Explore All Slippers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {slippersProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>

        {/* Bags */}
        <div className="bg-[#faf9f6] border border-black/5 rounded-3xl p-8 sm:p-12 lg:p-14 card-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block">
                Functional Craftsmanship
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium">
                Handcrafted Everyday Bags & Totes
              </h2>
              <p className="text-xs sm:text-sm text-[#5a5a40] max-w-lg">
                Thoughtfully built to hold all your work, market, and travel
                essentials with effortless grace and durable materials.
              </p>
            </div>
            <button
              id="view-all-bags-btn"
              onClick={() => handleCategorySelect("bags")}
              className="px-6 py-3 bg-[#1a3c34] text-white hover:bg-[#2a4d45] rounded-full text-xs font-semibold tracking-wide transition-all inline-flex items-center space-x-2 self-start md:self-auto shrink-0 shadow-xs"
            >
              <span>Explore All Bags</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bagsProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 5b. ACCESSORIES */}
      <section
        id="accessories-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 space-y-8"
      >
        <div className="bg-[#1a3c34] text-white rounded-3xl overflow-hidden card-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-medium">
                <span>Level Up Your Routine 🛠️</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Beauty Tools That <br />
                <span className="italic font-medium text-emerald-200">
                  Work As Hard As You Do.
                </span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
                From derma rollers that help your growth oils penetrate deeper,
                to scalp massagers that boost circulation on wash day — complete
                your hair and skin routine with the right tool for the job.
              </p>

              <div className="pt-2">
                <button
                  id="promo-shop-accessories-btn"
                  onClick={() => handleCategorySelect("accessories")}
                  className="px-8 py-4 bg-white text-[#1a3c34] hover:bg-[#f9f9f7] rounded-full font-semibold text-sm tracking-wide transition-all inline-flex items-center space-x-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Beauty Tools</span>
                </button>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5 relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] bg-[#112923]">
              <img
                src="https://images.unsplash.com/flagged/photo-1570698500117-0c1785821fe1?auto=format&fit=crop&w=800&q=80"
                alt="PERFECT FOR YOU Derma Roller & Scalp Massager"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3c34] via-transparent to-transparent lg:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY SHOP WITH US */}
      <section className="bg-white/60 py-16 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
              Our Promise
            </span>
            <h2 className="font-serif text-3xl text-[#1a3c34] font-medium">
              Why Perfect For You?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-black/5 card-shadow text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#f5f5f0] text-[#1a3c34] flex items-center justify-center text-xl">
                🌿
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                Quality Products
              </h3>
              <p className="text-xs text-[#5a5a40] leading-relaxed">
                Carefully selected natural ingredients crafted with your
                everyday hair, beauty, and lifestyle in mind.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-black/5 card-shadow text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#f5f5f0] text-[#1a3c34] flex items-center justify-center text-xl">
                💚
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                Customer First
              </h3>
              <p className="text-xs text-[#5a5a40] leading-relaxed">
                Direct WhatsApp consultation and support to answer any questions
                and guide your routine before ordering.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-black/5 card-shadow text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#f5f5f0] text-[#1a3c34] flex items-center justify-center text-xl">
                🚚
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                Convenient Delivery
              </h3>
              <p className="text-xs text-[#5a5a40] leading-relaxed">
                Reliable doorstep delivery in Accra, Tema, Kumasi, Takoradi, and
                dispatch across all regions in Ghana.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-black/5 card-shadow text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#f5f5f0] text-[#1a3c34] flex items-center justify-center text-xl">
                🔒
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                Secure Paystack Payments
              </h3>
              <p className="text-xs text-[#5a5a40] leading-relaxed">
                Seamless and safe checkout using MTN Mobile Money, Telecel Cash,
                AT Money, or Visa/Mastercard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
            Real Stories
          </span>
          <h2 className="font-serif text-3xl text-[#1a3c34] font-medium">
            Loved by Ghanaian Women
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-black/5 flex flex-col justify-between card-shadow"
            >
              <div>
                <div className="flex items-center space-x-1 text-amber-500 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[#1a1a1a] text-sm leading-relaxed italic mb-4">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-black/5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-serif font-bold text-[#1a3c34] block">
                    {rev.author}
                  </span>
                  <span className="text-[#5a5a40] text-[11px]">
                    {rev.location}
                  </span>
                </div>
                <span className="text-[#1a3c34] font-semibold text-[11px] bg-[#f5f5f0] px-3 py-1 rounded-full">
                  Verified Order
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
