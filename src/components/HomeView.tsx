import React from "react";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  HeartHandshake,
  CheckCircle2,
  Star,
  Instagram,
  ShoppingBag,
  Leaf,
  Heart,
  Compass,
  Flame,
} from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { ProductCard } from "./ProductCard.tsx";
import { HairRoutineQuiz } from "./HairRoutineQuiz.tsx";
import { ShoppableReels } from "./ShoppableReels.tsx";
import { BeforeAfterSlider } from "./BeforeAfterSlider.tsx";

export const HomeView: React.FC = () => {
  const { products, categories, reviews, navigate, setSelectedCategory } = useStore();

  const featuredProducts = products.filter((p) => p.is_featured && p.is_active).slice(0, 8);
  const hairProducts = products.filter((p) => p.category_id === "cat-hair" && p.is_active).slice(0, 4);
  const skincareProducts = products.filter((p) => p.category_id === "cat-skincare" && p.is_active).slice(0, 4);
  const slippersProducts = products.filter((p) => p.category_id === "cat-slippers" && p.is_active).slice(0, 4);
  const bagsProducts = products.filter((p) => p.category_id === "cat-bags" && p.is_active).slice(0, 4);

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

  const navFlowItems = [
    { id: "categories-section", label: "All Collections", icon: Sparkles },
    { id: "routine-quiz-section", label: "Routine Matcher", icon: Flame },
    { id: "snapchat-stories-section", label: "Snapchat Stories", icon: Star },
    { id: "hair-section", label: "Hair Care", icon: Leaf },
    { id: "results-comparison-section", label: "Results", icon: CheckCircle2 },
    { id: "skincare-section", label: "Skincare", icon: Sparkles },
    { id: "slippers-section", label: "Slippers", icon: ShoppingBag },
    { id: "bags-section", label: "Bags", icon: Compass },
    { id: "story-section", label: "Our Story", icon: HeartHandshake },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION (Warm Organic / Cultural Hero) */}
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
                &amp; Style— <br />
                <span className="italic font-normal">Perfect For You</span>
              </h1>

              <p className="text-[#5a5a40] text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed italic">
                Discover carefully selected products for your hair, skin and everyday style, crafted for confidence.
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

                <button
                  id="hero-routine-quiz-btn"
                  onClick={() => scrollToSection("routine-quiz-section")}
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-stone-50 border border-stone-300 text-[#1a3c34] rounded-full text-sm font-semibold tracking-wide transition-all flex items-center justify-center space-x-2 shadow-xs group"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 group-hover:rotate-12 transition-transform" />
                  <span>Match My Hair Routine</span>
                </button>
              </div>

              {/* Trust Micro-Badges */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-6 border-t border-black/5 text-left">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1a3c34] shrink-0" />
                  <span className="text-xs text-[#5a5a40] font-bold">100% Organic Roots</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-[#1a3c34] shrink-0" />
                  <span className="text-xs text-[#5a5a40] font-bold">Fast Ghana Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#1a3c34] shrink-0" />
                  <span className="text-xs text-[#5a5a40] font-bold">Paystack Verified</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual with Arch/Pill Silhouette */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[420px] mx-auto">
                {/* Main Hero Pill Container */}
                <div className="w-full aspect-[4/5] bg-[#1a3c34] rounded-[50px] sm:rounded-[100px] overflow-hidden relative shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a3c34]/40 to-transparent z-10" />
                  <img
                    src="/images/pfy_model_collection.jpg"
                    alt="PERFECT FOR YOU Natural Care Collection"
                    className="w-full h-full object-cover opacity-95"
                  />
                </div>

                {/* Floating Verified Badge matching Design HTML */}
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

      {/* FLOWING CATEGORY & SECTION NAVIGATION BAR */}
      {/* Allows users to fluidly glide across all sections directly from the page without having to only rely on the top nav bar */}
      <nav
        id="flowing-section-bar"
        aria-label="Section Quick Flow Navigation"
        className="sticky top-16 sm:top-18 z-20 bg-white/95 backdrop-blur-md border-y border-black/5 shadow-xs transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#5a5a40] shrink-0 pr-1 hidden sm:inline">
              Explore:
            </span>
            {navFlowItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`flow-nav-${item.id}`}
                  onClick={() => scrollToSection(item.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1a1a1a]/80 hover:text-[#1a3c34] hover:bg-black/5 border border-black/5 bg-[#faf9f6] shrink-0 transition-all flex items-center space-x-1.5 active:scale-95"
                >
                  <Icon className="w-3.5 h-3.5 text-[#1a3c34]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 2. CATEGORY SECTION ("Shop by Category") */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              id={`cat-card-${cat.slug}`}
              onClick={() => handleCategorySelect(cat.slug)}
              className="group relative rounded-2xl overflow-hidden bg-[#f9f9f7] aspect-3/4 flex flex-col justify-end p-5 cursor-pointer card-shadow hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("/images/pfy_model_duo.jpg")) {
                    target.src = "/images/pfy_model_duo.jpg";
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

      {/* 2.5 INTERACTIVE ROUTINE QUIZ ("Match My Hair Routine") */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HairRoutineQuiz />
      </div>

      {/* 2.8 SHOPPABLE REELS & UGC SHOWCASE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ShoppableReels />
      </div>

      {/* 3. SECTION: HAIR CARE ("Healthy Hair Starts Here 🌿") */}
      <section id="hair-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 space-y-8">
        <div className="bg-[#1a3c34] text-white rounded-3xl overflow-hidden card-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Promo Text */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-medium">
                <span>Healthy Hair Starts Here 🌿</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Nourish. Strengthen. <br />
                <span className="italic font-medium text-emerald-200">Watch Your Crown Grow.</span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
                Our authentic formulas blend raw unrefined shea butter, amla, chebe, cold-pressed castor, and rosemary oil. Designed specifically for low &amp; high porosity natural hair to combat shedding and dryness.
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

            {/* Right Promo Image */}
            <div className="lg:col-span-5 relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] bg-[#112923]">
              <img
                src="/images/pfy_model_duo.jpg"
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
                Hair Oils, Masks &amp; Complete Sets
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

          {/* Twin Brand Educational Cards: Hydration/Moisturization & Where Does Oil Fall */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Hydration vs Moisturization */}
            <div className="bg-gradient-to-br from-[#1a3c34] to-[#122822] text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 card-shadow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/20 text-emerald-200 text-xs font-semibold">
                  <span>🔒 Hydration vs. Moisturization 🧈</span>
                </div>
                <h3 className="font-serif text-2xl text-white font-normal">
                  Moisturization = <span className="text-emerald-200 italic font-medium">Seals The Water</span>
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Moisturizing means locking the water inside the hair. Butter and creams do <strong className="text-white">NOT</strong> add water—they trap and seal hydration already inside your hair.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                    <span className="text-emerald-300 font-bold block">Soft Hair</span>
                    <span className="text-stone-300 text-[10px]">Stops dryness for days</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                    <span className="text-emerald-300 font-bold block">Barrier Lock</span>
                    <span className="text-stone-300 text-[10px]">Blocks humidity loss</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                    <span className="text-emerald-300 font-bold block">Protects Ends</span>
                    <span className="text-stone-300 text-[10px]">Seals fragile tips</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src="/images/pfy_hair_butter.jpg"
                    alt="PERFECT FOR YOU Hair Butter"
                    className="w-14 h-14 object-cover rounded-xl border border-white/15 shadow-sm"
                  />
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold block">In Your Brand:</span>
                    <span className="font-serif text-sm font-semibold text-white">Hair Butter = MOISTURIZER</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCategorySelect("hair")}
                  className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-[#112923] text-xs font-bold rounded-full transition-colors"
                >
                  Shop Butter →
                </button>
              </div>
            </div>

            {/* Card 2: Where Does Oil Fall? */}
            <div className="bg-gradient-to-br from-[#20362f] to-[#12241f] text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 card-shadow flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/20 text-emerald-200 text-xs font-semibold">
                  <span>🌿 Where Does Oil Fall? 💧</span>
                </div>
                <h3 className="font-serif text-2xl text-white font-normal">
                  Oil is a <span className="text-emerald-200 italic font-medium">Sealant + Scalp Food</span>
                </h3>
                <div className="space-y-1.5 text-xs text-stone-300">
                  <div className="flex items-center space-x-2 text-rose-300/90 font-medium">
                    <span>❌</span>
                    <span>Oil is <strong>NOT</strong> hydration</span>
                  </div>
                  <div className="flex items-center space-x-2 text-rose-300/90 font-medium">
                    <span>❌</span>
                    <span>Oil is <strong>NOT</strong> a moisturizer</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-300 font-medium pt-0.5">
                    <span>💧</span>
                    <span><strong>Oil = Sealant + Scalp Food:</strong> Feeds scalp &amp; seals hair ends</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                    <span className="text-emerald-300 font-bold block mb-0.5">✓ Feeds the Scalp</span>
                    <span className="text-stone-300 text-[10px]">Stimulates follicles & improves root circulation</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                    <span className="text-emerald-300 font-bold block mb-0.5">✓ Seals Hair Ends</span>
                    <span className="text-stone-300 text-[10px]">Critical shield for high & low porosity hair</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src="/images/pfy_hair_oil.jpg"
                    alt="PERFECT FOR YOU Nourishing Hair Growth Oil"
                    className="w-14 h-14 object-cover rounded-xl border border-white/15 shadow-sm"
                  />
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold block">In Your Brand:</span>
                    <span className="font-serif text-sm font-semibold text-white">Hair Oil = NOURISH / SEAL <span className="text-emerald-300 text-[11px] block">(NOT DAILY)</span></span>
                  </div>
                </div>
                <button
                  onClick={() => handleCategorySelect("hair")}
                  className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-[#112923] text-xs font-bold rounded-full transition-colors"
                >
                  Shop Hair Oil →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 BEFORE & AFTER RESULTS COMPARISON */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BeforeAfterSlider />
      </div>

      {/* 4. SECTION: SKINCARE & BOTANICAL GLOW */}
      <section id="skincare-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 space-y-8">
        <div className="bg-[#2a4d45] text-white rounded-3xl overflow-hidden card-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Image */}
            <div className="lg:col-span-5 relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] bg-[#1a3c34] order-2 lg:order-1">
              <img
                src="/images/pfy_black_soap.jpg"
                alt="PERFECT FOR YOU African Black Soap"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-4 left-4 bg-[#112923]/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15 text-[11px] text-emerald-200 font-medium">
                Healthy Hair, Happy Skin 🌿
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Nourish &amp; Glow 🌸</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Authentic Black Soap &amp; Botanicals. <br />
                <span className="italic font-medium text-emerald-200">Healthy Hair, Happy Skin.</span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
                Crafted with plantain skin ash, cocoa pod ash, raw forest honey, and pure unrefined Northern Ghanaian shea butter. Gently purifies pores, clears blemishes, and balances moisture without stripping your skin or scalp.
              </p>

              <div className="pt-2">
                <button
                  id="promo-shop-skincare-btn"
                  onClick={() => handleCategorySelect("skincare")}
                  className="px-8 py-4 bg-white text-[#1a3c34] hover:bg-[#f9f9f7] rounded-full font-semibold text-sm tracking-wide transition-all inline-flex items-center space-x-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Skincare &amp; Black Soap</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Skincare Products Grid */}
        {skincareProducts.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
                  Gentle Barrier Care
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#1a3c34] font-medium">
                  Soaps, Butters &amp; Facial Balms
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
        )}
      </section>

      {/* 5. SECTION: SLIPPERS & FOOTWEAR */}
      <section id="slippers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 space-y-8">
        <div className="bg-[#f5f2ed] border border-black/5 rounded-3xl p-8 sm:p-12 lg:p-14 card-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block">
                Everyday Comfort &amp; Elegance
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium">
                Slippers &amp; Slide Sandals
              </h2>
              <p className="text-xs sm:text-sm text-[#5a5a40] max-w-lg">
                Effortless comfort designed for everyday Ghanaian lifestyles. Lightweight soles, cushioned footbeds, and versatile neutral tones.
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
      </section>

      {/* 6. SECTION: BAGS & TOTES */}
      <section id="bags-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 space-y-8">
        <div className="bg-[#faf9f6] border border-black/5 rounded-3xl p-8 sm:p-12 lg:p-14 card-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block">
                Functional Craftsmanship
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium">
                Handcrafted Everyday Bags &amp; Totes
              </h2>
              <p className="text-xs sm:text-sm text-[#5a5a40] max-w-lg">
                Thoughtfully built to hold all your work, market, and travel essentials with effortless grace and durable materials.
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

      {/* 7. SECTION: OUR STORY (Authentic Ghanaian Heritage) */}
      <section id="story-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="bg-[#112923] text-white rounded-3xl overflow-hidden card-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Story Text */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-medium">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Our Heritage &amp; Roots</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Born in Accra. <br />
                <span className="italic font-medium text-emerald-200">Grounded in Authentic Care.</span>
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Perfect For You was founded on a simple realization: everyday beauty, self-care, and personal style shouldn't be filled with toxic additives, confusing steps, or fragile materials.
              </p>

              <p className="text-stone-300 text-sm leading-relaxed">
                From unrefined shea butter hand-whipped by women's cooperatives in Northern Ghana to herbal scalp infusions, comforting slide sandals, and durable tote bags, every piece is curated to honor your daily routine.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-center">
                <div>
                  <p className="font-serif text-2xl font-bold text-emerald-200">100%</p>
                  <p className="text-[11px] text-stone-300 uppercase tracking-wider">Ghana Sourced</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-emerald-200">0%</p>
                  <p className="text-[11px] text-stone-300 uppercase tracking-wider">Harsh Synthetics</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-emerald-200">5k+</p>
                  <p className="text-[11px] text-stone-300 uppercase tracking-wider">Happy Crowns</p>
                </div>
              </div>
            </div>

            {/* Story Visual */}
            <div className="lg:col-span-5 relative aspect-square lg:aspect-auto lg:h-full min-h-[340px]">
              <img
                src="/images/pfy_model_collection.jpg"
                alt="PERFECT FOR YOU Handcrafted Authentic Care"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION: THE DAILY RITUAL */}
      <section id="ritual-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
            Simple, Effective, Transformative
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium">
            The 3-Step Daily Ritual
          </h2>
          <p className="text-xs sm:text-sm text-[#5a5a40] mt-2">
            Build consistency with a ritual designed to restore hair length, keep skin glowing, and start your day with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 card-shadow space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] text-[#1a3c34] font-serif font-bold text-xl flex items-center justify-center">
              1
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1a3c34]">
              Cleanse &amp; Clarify
            </h3>
            <p className="text-xs sm:text-sm text-[#5a5a40] leading-relaxed">
              Use our authentic herbal African Black Soap or botanical scalp cleanser to wash away impurities without stripping your natural sebum.
            </p>
            <div className="pt-2 text-[11px] font-bold text-[#1a3c34]">
              Recommended: African Black Soap &amp; Scalp Wash
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 card-shadow space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] text-[#1a3c34] font-serif font-bold text-xl flex items-center justify-center">
              2
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1a3c34]">
              Hydrate &amp; Seal
            </h3>
            <p className="text-xs sm:text-sm text-[#5a5a40] leading-relaxed">
              Mist hair with aloe vera floral water, apply Whipped Moisture Butter, and massage Botanical Hair Oil onto scalp for 3 minutes.
            </p>
            <div className="pt-2 text-[11px] font-bold text-[#1a3c34]">
              Recommended: Complete Hair Care Ritual Set
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 card-shadow space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] text-[#1a3c34] font-serif font-bold text-xl flex items-center justify-center">
              3
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1a3c34]">
              Crown &amp; Step Out
            </h3>
            <p className="text-xs sm:text-sm text-[#5a5a40] leading-relaxed">
              Protect your crown with our luxury silk satin bonnet at night, slip into cushioned everyday slides, and grab your handcrafted tote.
            </p>
            <div className="pt-2 text-[11px] font-bold text-[#1a3c34]">
              Recommended: Comfort Slides &amp; Canvas Tote
            </div>
          </div>
        </div>
      </section>

      {/* 9. FEATURED PRODUCTS ("Customer Favorites") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
              Natural &amp; Botanical
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium">
              Customer Favorites
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory("all");
              navigate("shop");
            }}
            className="text-[#5a5a40] text-xs font-bold uppercase tracking-widest border-b border-[#5a5a40]/30 pb-1 hover:text-[#1a3c34] transition-colors"
          >
            View All Products
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 10. WHY SHOP WITH US? */}
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
                Carefully selected natural ingredients crafted with your everyday hair, beauty, and lifestyle in mind.
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
                Direct WhatsApp consultation and support to answer any questions and guide your routine before ordering.
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
                Reliable doorstep delivery in Accra, Tema, Kumasi, Takoradi, and dispatch across all regions in Ghana.
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
                Seamless and safe checkout using MTN Mobile Money, Telecel Cash, AT Money, or Visa/Mastercard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. CUSTOMER REVIEWS */}
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
                  <span className="font-serif font-bold text-[#1a3c34] block">{rev.author}</span>
                  <span className="text-[#5a5a40] text-[11px]">{rev.location}</span>
                </div>
                <span className="text-[#1a3c34] font-semibold text-[11px] bg-[#f5f5f0] px-3 py-1 rounded-full">
                  Verified Order
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. INSTAGRAM / SOCIAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1.5 text-xs text-[#5a5a40] mb-1 font-bold tracking-wider uppercase">
            <Instagram className="w-4 h-4 text-[#1a3c34]" />
            <span>@perfectforyou_gh</span>
          </div>
          <h3 className="font-serif text-2xl text-[#1a3c34] font-medium">
            Join Our Community
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#f9f9f7] card-shadow">
            <img
              src="/images/pfy_model_duo.jpg"
              alt="Ayurvedic Mask & Hair Growth Oil"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#f9f9f7] card-shadow">
            <img
              src="/images/pfy_black_soap.jpg"
              alt="PERFECT FOR YOU African Black Soap"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#f9f9f7] card-shadow">
            <img
              src="/images/pfy_hair_butter.jpg"
              alt="PERFECT FOR YOU Hair Butter Moisturizer"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#f9f9f7] card-shadow">
            <img
              src="/images/pfy_hair_mask.jpg"
              alt="PERFECT FOR YOU Ayurvedic Hair Mask pouch"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

