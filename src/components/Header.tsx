import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Heart,
  ShoppingCart,
  X,
  Sparkles,
  Truck,
  Menu,
  ShoppingBag,
  MessageCircle,
  HeartHandshake,
  Star,
  Ghost,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../context/StoreContext.tsx";
import { BrandLogo } from "./BrandLogo.tsx";

export const Header: React.FC = () => {
  const {
    currentRoute,
    navigate,
    cartCount,
    wishlist,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    adminUser,
    hasPurchased,
    settings,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerSearchInputRef = useRef<HTMLInputElement>(null);

  // Lock background scrolling when mobile drawer is open so it stays fixed over the page
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close drawer on route change or resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // If in admin route, header has a different, admin-specific look or can be omitted
  if (currentRoute === "admin") {
    return (
      <header className="bg-[#1a3c34] text-white border-b border-[#2a4d45] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("home")}
              className="flex items-center space-x-2 text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-[#2a4d45] flex items-center justify-center border border-white/15 text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-lg tracking-wider font-semibold text-white block leading-tight">
                  PERFECT FOR YOU
                </span>
                <span className="text-[10px] tracking-widest uppercase text-emerald-200 block font-medium">
                  Admin Management Portal
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              id="admin-return-storefront-btn"
              onClick={() => navigate("home")}
              className="text-xs text-white/90 hover:text-white bg-[#2a4d45] hover:bg-[#112923] border border-white/20 px-4 py-2 rounded-full transition-colors"
            >
              ← Back to Customer Storefront
            </button>
          </div>
        </div>
      </header>
    );
  }

  const openDrawer = (focusSearch = false) => {
    setMobileMenuOpen(true);
    if (focusSearch) {
      setTimeout(() => {
        drawerSearchInputRef.current?.focus();
      }, 200);
    }
  };

  const handleCategoryClick = (catSlug: string) => {
    setMobileMenuOpen(false);
    if (currentRoute === "home") {
      const sectionMap: Record<string, string> = {
        hair: "hair-section",
        skincare: "skincare-section",
        slippers: "slippers-section",
        bags: "bags-section",
      };
      const sectionId = sectionMap[catSlug];
      if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) {
          const yOffset = -85;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
          return;
        }
      }
    }
    setSelectedCategory(catSlug);
    navigate("shop", { categorySlug: catSlug });
  };

  const handleSectionJump = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentRoute !== "home") {
      navigate("home");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const yOffset = -85;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        const yOffset = -85;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileMenuOpen(false);
      navigate("shop");
    }
  };

  const whatsappPhone = settings?.whatsapp || "233544590749";
  const snapchatUrl = settings?.social_links?.snapchat || "https://www.snapchat.com/t/vjlTm2Px";

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/5 transition-all">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-6">
          {/* Left section: Hamburger button (on phone) + Brand Logo Icon */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Mobile Hamburger Toggle Button - opens 3/4 left drawer */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => openDrawer(false)}
              className="lg:hidden p-2 -ml-1 text-[#1a1a1a] hover:text-[#1a3c34] rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo - ONLY THE ICON */}
            <button
              id="brand-logo-btn"
              onClick={() => navigate("home")}
              className="flex items-center justify-center p-1 rounded-xl group transition-transform hover:scale-105 shrink-0"
              aria-label="Perfect For You Home"
              title="Perfect For You"
            >
              <BrandLogo variant="mark" size="md" />
            </button>
          </div>

          {/* Desktop Inline Menu Bar - visible on lg+ screens without clipping */}
          <nav
            id="main-menu-bar"
            aria-label="Main Navigation Menu"
            className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs uppercase tracking-wider font-semibold text-[#1a1a1a]/75 whitespace-nowrap overflow-x-auto no-scrollbar"
          >
            <button
              id="nav-home-btn"
              onClick={() => navigate("home")}
              className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold shrink-0 ${
                currentRoute === "home"
                  ? "bg-[#1a3c34] text-white shadow-xs"
                  : "text-[#1a1a1a]/75 hover:text-[#1a3c34] hover:bg-black/5"
              }`}
            >
              Home
            </button>

            <button
              id="nav-shop-all-btn"
              onClick={() => {
                setSelectedCategory("all");
                navigate("shop");
              }}
              className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold shrink-0 ${
                currentRoute === "shop" && selectedCategory === "all"
                  ? "bg-[#1a3c34] text-white shadow-xs"
                  : "text-[#1a1a1a]/75 hover:text-[#1a3c34] hover:bg-black/5"
              }`}
            >
              Shop All
            </button>

            <button
              id="nav-quiz-btn"
              onClick={() => handleSectionJump("routine-quiz-section")}
              className="px-3 py-1.5 rounded-full transition-all text-xs font-semibold shrink-0 text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/60 flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Routine Quiz</span>
            </button>

            <button
              id="nav-snapchat-btn"
              onClick={() => handleSectionJump("snapchat-stories-section")}
              className="px-3 py-1.5 rounded-full transition-all text-xs font-semibold shrink-0 text-[#1a1a1a]/75 hover:text-[#1a3c34] hover:bg-black/5"
            >
              Snapchat Stories
            </button>

            <button
              id="nav-hair-btn"
              onClick={() => handleCategoryClick("hair")}
              className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold shrink-0 ${
                currentRoute === "shop" && selectedCategory === "hair"
                  ? "bg-[#1a3c34] text-white shadow-xs"
                  : "text-[#1a1a1a]/75 hover:text-[#1a3c34] hover:bg-black/5"
              }`}
            >
              Hair Care
            </button>

            <button
              id="nav-skincare-btn"
              onClick={() => handleCategoryClick("skincare")}
              className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold shrink-0 ${
                currentRoute === "shop" && selectedCategory === "skincare"
                  ? "bg-[#1a3c34] text-white shadow-xs"
                  : "text-[#1a1a1a]/75 hover:text-[#1a3c34] hover:bg-black/5"
              }`}
            >
              Skincare
            </button>

            <button
              id="nav-slippers-btn"
              onClick={() => handleCategoryClick("slippers")}
              className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold shrink-0 ${
                currentRoute === "shop" && selectedCategory === "slippers"
                  ? "bg-[#1a3c34] text-white shadow-xs"
                  : "text-[#1a1a1a]/75 hover:text-[#1a3c34] hover:bg-black/5"
              }`}
            >
              Slippers
            </button>

            <button
              id="nav-bags-btn"
              onClick={() => handleCategoryClick("bags")}
              className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold shrink-0 ${
                currentRoute === "shop" && selectedCategory === "bags"
                  ? "bg-[#1a3c34] text-white shadow-xs"
                  : "text-[#1a1a1a]/75 hover:text-[#1a3c34] hover:bg-black/5"
              }`}
            >
              Bags
            </button>

            {hasPurchased && (
              <button
                id="nav-tracking-btn"
                onClick={() => navigate("order-tracking")}
                className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold flex items-center space-x-1.5 shrink-0 ${
                  currentRoute === "order-tracking"
                    ? "bg-[#1a3c34] text-white shadow-xs"
                    : "text-[#5a5a40] hover:text-[#1a3c34] hover:bg-black/5 font-bold"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & Search */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 shrink-0">
            {/* Mobile Search Button - opens the 3/4 left drawer with search focused on mobile/tablet */}
            <button
              id="mobile-search-toggle-btn"
              onClick={() => openDrawer(true)}
              className="lg:hidden p-2 text-[#1a1a1a]/75 hover:text-[#1a3c34] rounded-full hover:bg-black/5 transition-colors"
              aria-label="Search Store"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop Search Bar (Always visible on lg+) */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:block relative">
              <input
                id="header-search-input"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 xl:w-56 pl-8 pr-7 py-1.5 text-xs bg-[#f5f2ed]/80 hover:bg-white focus:bg-white border border-black/5 focus:border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 transition-all placeholder:text-[#5a5a40]/70"
              />
              <Search className="w-3.5 h-3.5 text-[#5a5a40] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Wishlist Button */}
            <button
              id="header-wishlist-btn"
              onClick={() => navigate("wishlist")}
              className="p-2 text-[#1a1a1a]/75 hover:text-[#1a3c34] rounded-full hover:bg-black/5 relative transition-colors"
              aria-label="View Wishlist"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#1a3c34] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#1a1a1a]/75 hover:text-[#1a3c34] rounded-full hover:bg-black/5 relative transition-colors flex items-center space-x-1.5"
              aria-label="View Shopping Cart"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#1a3c34] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Navigation Drawer from Left (takes 3/4 of the page, rendered outside header so it overlays all page sections completely) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-[100] md:hidden">
                {/* Full-screen Backdrop (darkened right 1/4 area) */}
                <motion.div
                  key="mobile-nav-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-hidden="true"
                />

                {/* Drawer panel: from left side, exactly 3/4 width of the page, full 100vh height */}
                <motion.div
                  key="mobile-nav-panel"
                  id="mobile-nav-drawer"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="fixed top-0 bottom-0 left-0 w-[75vw] max-w-[340px] bg-[#faf9f6] h-screen h-[100dvh] shadow-[15px_0_40px_rgba(0,0,0,0.35)] flex flex-col z-[101] overflow-hidden"
                >
                  {/* Drawer Header with Brand Emblem and Close Button */}
                  <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center space-x-2.5">
                      <BrandLogo variant="mark" size="sm" />
                      <div>
                        <span className="font-serif text-sm sm:text-base font-bold text-[#1a3c34] tracking-wide block leading-tight">
                          PERFECT FOR YOU
                        </span>
                        <span className="text-[9px] text-[#5a5a40] tracking-widest uppercase font-semibold block">
                          Accra, Ghana
                        </span>
                      </div>
                    </div>
                    <button
                      id="mobile-drawer-close-btn"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
                      aria-label="Close Navigation"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Integrated Search Bar inside Drawer */}
                  <div className="px-3.5 py-3 border-b border-black/5 bg-white/70 shrink-0">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                      <Search className="w-4 h-4 text-[#5a5a40] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        ref={drawerSearchInputRef}
                        id="drawer-search-input"
                        type="text"
                        placeholder="Search hair, shea, slippers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-black/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a3c34]/20 focus:border-[#1a3c34] text-[#1a1a1a]"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                          aria-label="Clear search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </form>
                  </div>

                  {/* Drawer Scrollable Navigation Content */}
                  <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto min-h-0">
                    <p className="px-2.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#5a5a40] mb-2">
                      Collections
                    </p>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("home");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                        currentRoute === "home"
                          ? "bg-[#1a3c34] text-white shadow-xs"
                          : "text-[#1a1a1a] hover:bg-black/5"
                      }`}
                    >
                      <span>Home</span>
                      <span className="text-xs opacity-60">→</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setMobileMenuOpen(false);
                        navigate("shop");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                        currentRoute === "shop" && selectedCategory === "all"
                          ? "bg-[#1a3c34] text-white shadow-xs"
                          : "text-[#1a1a1a] hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <ShoppingBag className="w-4 h-4 text-[#1a3c34]" />
                        <span>Shop All</span>
                      </div>
                      <span className="text-xs opacity-60">→</span>
                    </button>

                    <button
                      onClick={() => handleCategoryClick("hair")}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                        currentRoute === "shop" && selectedCategory === "hair"
                          ? "bg-[#1a3c34] text-white shadow-xs"
                          : "text-[#1a1a1a] hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Sparkles className="w-4 h-4 text-[#1a3c34]" />
                        <span>Hair Care</span>
                      </div>
                      <span className="text-[11px] text-[#5a5a40]">Oils &amp; Pomade</span>
                    </button>

                    <button
                      onClick={() => handleCategoryClick("skincare")}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                        currentRoute === "shop" && selectedCategory === "skincare"
                          ? "bg-[#1a3c34] text-white shadow-xs"
                          : "text-[#1a1a1a] hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Sparkles className="w-4 h-4 text-[#1a3c34]" />
                        <span>Skincare</span>
                      </div>
                      <span className="text-[11px] text-[#5a5a40]">Shea &amp; Soaps</span>
                    </button>

                    <button
                      onClick={() => handleCategoryClick("slippers")}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                        currentRoute === "shop" && selectedCategory === "slippers"
                          ? "bg-[#1a3c34] text-white shadow-xs"
                          : "text-[#1a1a1a] hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Sparkles className="w-4 h-4 text-[#1a3c34]" />
                        <span>Slippers</span>
                      </div>
                      <span className="text-[11px] text-[#5a5a40]">Slide Sandals</span>
                    </button>

                    <button
                      onClick={() => handleCategoryClick("bags")}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                        currentRoute === "shop" && selectedCategory === "bags"
                          ? "bg-[#1a3c34] text-white shadow-xs"
                          : "text-[#1a1a1a] hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Sparkles className="w-4 h-4 text-[#1a3c34]" />
                        <span>Bags</span>
                      </div>
                      <span className="text-[11px] text-[#5a5a40]">Totes &amp; Carry</span>
                    </button>

                    <div className="pt-2.5 pb-1">
                      <div className="h-px bg-black/5" />
                    </div>

                    <p className="px-2.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#5a5a40] mb-2">
                      Interactive &amp; Discover
                    </p>

                    <button
                      id="drawer-nav-quiz-btn"
                      onClick={() => handleSectionJump("routine-quiz-section")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/50 transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Match My Hair Routine</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                        Quiz
                      </span>
                    </button>

                    <button
                      id="drawer-nav-snapchat-btn"
                      onClick={() => handleSectionJump("snapchat-stories-section")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-[#1a1a1a] hover:bg-black/5 transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Ghost className="w-4 h-4 text-amber-500" />
                        <span>Daily Snapchat Stories</span>
                      </div>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">Watch</span>
                    </button>

                    <button
                      id="drawer-nav-results-btn"
                      onClick={() => handleSectionJump("results-comparison-section")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-[#1a1a1a] hover:bg-black/5 transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#1a3c34]" />
                        <span>Before &amp; After Proof</span>
                      </div>
                      <span className="text-[10px] text-[#5a5a40] font-bold">Compare</span>
                    </button>

                    <button
                      id="drawer-nav-story-btn"
                      onClick={() => handleSectionJump("story-section")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-[#1a1a1a] hover:bg-black/5 transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <HeartHandshake className="w-4 h-4 text-[#1a3c34]" />
                        <span>Our Story &amp; Roots</span>
                      </div>
                      <span className="text-[11px] text-[#5a5a40]">Accra Heritage</span>
                    </button>

                    <button
                      id="drawer-nav-ritual-btn"
                      onClick={() => handleSectionJump("ritual-section")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-[#1a1a1a] hover:bg-black/5 transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Star className="w-4 h-4 text-[#1a3c34]" />
                        <span>The Daily Ritual</span>
                      </div>
                      <span className="text-[11px] text-[#5a5a40]">3-Step Guide</span>
                    </button>

                    <div className="pt-2.5 pb-1">
                      <div className="h-px bg-black/5" />
                    </div>

                    <p className="px-2.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#5a5a40] mb-2">
                      Orders &amp; Assistance
                    </p>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("order-tracking");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                        currentRoute === "order-tracking"
                          ? "bg-[#1a3c34] text-white shadow-xs"
                          : "text-[#1a1a1a] hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Truck className="w-4 h-4 text-[#1a3c34]" />
                        <span>Track Order</span>
                      </div>
                      <span className="text-[11px] text-[#5a5a40]">Live status</span>
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("wishlist");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all ${
                        currentRoute === "wishlist"
                          ? "bg-[#1a3c34] text-white shadow-xs"
                          : "text-[#1a1a1a] hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Heart className="w-4 h-4 text-[#1a3c34]" />
                        <span>My Wishlist</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="text-[11px] bg-[#1a3c34] text-white px-2 py-0.5 rounded-full font-bold">
                          {wishlist.length}
                        </span>
                      )}
                    </button>

                    {/* Direct WhatsApp Concierge */}
                    <a
                      href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                        "Hi Perfect For You, I am browsing your store and would like assistance."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold bg-[#25D366]/10 text-emerald-900 hover:bg-[#25D366]/20 transition-all mt-1"
                    >
                      <div className="flex items-center space-x-2.5">
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        <span>WhatsApp Concierge</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded">
                        Chat
                      </span>
                    </a>

                    {/* Snapchat */}
                    {snapchatUrl && (
                      <a
                        href={snapchatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold bg-yellow-400/20 text-stone-900 hover:bg-yellow-400/30 transition-all mt-1"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Ghost className="w-4 h-4 text-stone-900 fill-stone-900" />
                          <span>Snapchat</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-800 bg-white/80 px-1.5 py-0.5 rounded">
                          Follow
                        </span>
                      </a>
                    )}
                  </div>

                  {/* Drawer Footer info */}
                  <div className="p-3.5 bg-white border-t border-black/5 text-center space-y-2 shrink-0">
                    <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#1a3c34] font-semibold">
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span>FREE delivery in Accra over GH₵200</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
};
