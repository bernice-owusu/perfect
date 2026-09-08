import React, { useState } from "react";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { ProductCard } from "./ProductCard.tsx";
import { formatPrice } from "../utils/format.ts";

export const ProductDetailView: React.FC = () => {
  const {
    products,
    routeParams,
    navigate,
    addToCart,
    isInWishlist,
    toggleWishlist,
    settings,
  } = useStore();

  const product = products.find(
    (p) => p.id === routeParams.productId || p.slug === routeParams.productId
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "";
  });
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Accordion open states
  const [openSection, setOpenSection] = useState<string>("description");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-4">
          Product Not Found
        </h2>
        <button
          onClick={() => navigate("shop")}
          className="px-6 py-3 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-semibold tracking-wider transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, undefined, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, undefined, selectedSize);
    navigate("checkout");
  };

  const phone = settings?.whatsapp || "233544590749";
  const whatsappProductUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Hi Perfect For You, I have a question about ${product.name} (GH₵${product.price})`
  )}`;

  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id && p.is_active)
    .slice(0, 4);

  // Dynamic Bundle Companion Recommendation
  const bundleCompanion = products.find(
    (p) => p.id !== product.id && p.is_active && (
      (product.category_id === "cat-hair" && p.category_id === "cat-hair") ||
      (product.category_id === "cat-skincare" && p.category_id === "cat-skincare") ||
      (product.category_id === "cat-slippers" && p.category_id === "cat-bags") ||
      (product.category_id === "cat-bags" && p.category_id === "cat-slippers")
    )
  ) || relatedProducts[0];

  const [bundleAdded, setBundleAdded] = useState(false);

  const handleAddBundle = () => {
    if (!bundleCompanion) return;
    addToCart(product, 1, undefined, selectedSize);
    addToCart(bundleCompanion, 1);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb / Back button */}
      <button
        onClick={() => navigate("shop")}
        className="inline-flex items-center space-x-1.5 text-xs text-[#5a5a40] hover:text-[#1a3c34] mb-6 font-medium uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Collections</span>
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* LEFT: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-4/5 w-full bg-[#eae7e0] rounded-3xl overflow-hidden border border-black/5 card-shadow">
            <img
              src={
                product.images[activeImageIdx] ||
                product.images[0] ||
                "/images/pfy_hair_set.jpg"
              }
              alt={product.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("/images/pfy_hair_set.jpg")) {
                  target.src = "/images/pfy_hair_set.jpg";
                }
              }}
              className="w-full h-full object-cover object-center"
            />

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#5a5a40] hover:text-rose-600 shadow-xs transition-transform hover:scale-105"
              aria-label="Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  inWishlist ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
            </button>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.discount_price && product.discount_price > product.price && (
                <span className="bg-[#1a3c34] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Save {formatPrice(product.discount_price - product.price)}
                </span>
              )}
              {isLowStock && (
                <span className="bg-[#5a5a40] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Only {product.stock} left in stock
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIdx === idx
                      ? "border-[#1a3c34] ring-2 ring-[#1a3c34]/20"
                      : "border-stone-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("/images/pfy_hair_set.jpg")) {
                        target.src = "/images/pfy_hair_set.jpg";
                      }
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Details & Buy Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {/* Category tag & rating */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a5a40]">
                {product.category_name}
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-amber-500">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-[#1a1a1a] font-semibold">
                  {product.rating ? product.rating.toFixed(1) : "5.0"}
                </span>
                <span className="text-[#5a5a40]">
                  ({product.reviews_count || 18} reviews)
                </span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#1a3c34] leading-tight mb-3">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-2xl sm:text-3xl font-bold text-[#1a3c34]">
                {formatPrice(product.price)}
              </span>
              {product.discount_price && product.discount_price > product.price && (
                <span className="text-base text-stone-400 line-through">
                  {formatPrice(product.discount_price)}
                </span>
              )}
              <span className="text-xs text-[#1a3c34] bg-[#f5f5f0] px-3 py-1 rounded-full font-medium">
                In Stock ({product.stock} units available)
              </span>
            </div>

            {/* Short highlight */}
            <p className="text-sm text-[#5a5a40] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size / Variant Selector if applicable */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                Size / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedSize === s
                        ? "bg-[#1a3c34] text-white border-[#1a3c34] shadow-xs"
                        : "bg-white text-stone-700 border-stone-300 hover:border-stone-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA buttons */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-between sm:justify-start border border-stone-300 rounded-full bg-white px-3 py-1.5 sm:px-2 sm:py-1 self-stretch sm:self-auto">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                id="pdp-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-full font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-md min-h-[48px] ${
                  isOutOfStock
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : isAdded
                    ? "bg-[#5a5a40] text-white"
                    : "bg-[#1a3c34] hover:bg-[#2a4d45] text-white active:scale-98"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • {formatPrice(product.price * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Buy Now Direct Button */}
            <button
              id="pdp-buy-now-btn"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 px-6 rounded-full font-semibold text-sm bg-[#5a5a40] hover:bg-[#4a4a35] text-white shadow-xs transition-all flex items-center justify-center space-x-2 min-h-[48px]"
            >
              <span>Buy Now (Instant Guest Checkout)</span>
            </button>

            {/* WhatsApp Consultation Link */}
            <a
              href={whatsappProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl border border-black/10 bg-[#f9f9f7] hover:bg-[#eae7e0] text-[#1a3c34] text-xs font-semibold flex items-center justify-center space-x-2 transition-colors min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-[#1a3c34]" />
              <span>Ask a Question on WhatsApp before ordering</span>
            </a>
          </div>

          {/* Value Props Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 py-4 border-y border-black/5 text-xs text-[#5a5a40]">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#1a3c34]" />
              <span>Doorstep Delivery across Ghana</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#1a3c34]" />
              <span>Verified Paystack MoMo / Card</span>
            </div>
          </div>

          {/* Authentic Brand Ritual Guidance Card */}
          {product.name.toLowerCase().includes("hair oil") && (
            <div className="bg-[#1a3c34]/5 border border-[#1a3c34]/15 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#1a3c34] font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Brand Ritual: Where Does Oil Fall?</span>
              </div>
              <div className="space-y-1 text-stone-700">
                <p className="font-semibold text-rose-700 text-[11px]">
                  ❌ Oil is NOT hydration • ❌ Oil is NOT a moisturizer
                </p>
                <p className="text-stone-800 font-medium">
                  💧 <strong>Oil is a Sealant + Scalp Food:</strong> Feeds follicles, improves root circulation, and seals hair ends. Use 2–3 times weekly (not daily).
                </p>
              </div>
            </div>
          )}

          {product.name.toLowerCase().includes("butter") && (
            <div className="bg-[#1a3c34]/5 border border-[#1a3c34]/15 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#1a3c34] font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Brand Ritual: Hydration vs. Moisturization</span>
              </div>
              <p className="text-stone-800 leading-relaxed">
                <strong>Moisturization = Seals The Water:</strong> Butters and creams do <strong className="underline">not</strong> add water—they trap and lock hydration already inside your hair to keep it soft and resilient for days.
              </p>
            </div>
          )}

          {product.name.toLowerCase().includes("mask") && (
            <div className="bg-[#1a3c34]/5 border border-[#1a3c34]/15 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#1a3c34] font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Brand Ritual: Healthy Hair, Happy Skin — naturally</span>
              </div>
              <p className="text-stone-800 leading-relaxed">
                <strong>100% Chemical-Free Ayurvedic Treatment:</strong> Amla, bhringraj, and fenugreek deliver essential minerals directly to your roots, reduce split ends, and balance your scalp.
              </p>
            </div>
          )}

          {product.name.toLowerCase().includes("black soap") && (
            <div className="bg-[#1a3c34]/5 border border-[#1a3c34]/15 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#1a3c34] font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Brand Slogan: Healthy Hair, Happy Skin</span>
              </div>
              <p className="text-stone-800 leading-relaxed">
                Multipurpose clarifying cleanse handcrafted with plantain ash, cocoa ash, raw honey, and pure northern shea butter. Clears blemishes and refreshes scalps without stripping natural moisture.
              </p>
            </div>
          )}

          {/* Frequently Bought Together (Smart Bundle Builder) */}
          {bundleCompanion && (
            <div className="bg-[#faf9f6] border border-stone-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                  Frequently Bought Together
                </span>
                <span className="text-xs font-bold text-stone-600">
                  Save time &amp; delivery
                </span>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Product 1 */}
                <div className="relative">
                  <img
                    src={product.images[0] || "/images/pfy_hair_set.jpg"}
                    alt={product.name}
                    className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl object-cover bg-stone-100 border border-stone-200"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-[#1a3c34] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                </div>

                <span className="text-stone-400 font-bold text-lg">+</span>

                {/* Product 2 (Companion) */}
                <div className="relative">
                  <img
                    src={bundleCompanion.images[0] || "/images/pfy_hair_mist.jpg"}
                    alt={bundleCompanion.name}
                    className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl object-cover bg-stone-100 border border-stone-200"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-[#1a3c34] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                </div>

                <div className="min-w-0 flex-1 pl-1">
                  <p className="text-xs font-bold text-stone-900 leading-tight">
                    {product.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    + {bundleCompanion.name}
                  </p>
                  <p className="text-xs font-extrabold text-[#1a3c34] mt-1">
                    Combined: {formatPrice(product.price + bundleCompanion.price)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="add-both-to-cart-btn"
                onClick={handleAddBundle}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-[#1a3c34] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-98 shadow-xs"
              >
                {bundleAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Both Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add Both Items to Cart</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Expandable Accordion Sections (PRD #12) */}
          <div className="space-y-2 divide-y divide-stone-200 text-sm">
            {/* Description */}
            <div className="pt-3">
              <button
                onClick={() => toggleSection("description")}
                className="w-full flex items-center justify-between py-2 text-left font-serif font-semibold text-stone-900"
              >
                <span>Product Description</span>
                {openSection === "description" ? (
                  <ChevronUp className="w-4 h-4 text-stone-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                )}
              </button>
              {openSection === "description" && (
                <div className="pb-3 text-stone-600 text-xs sm:text-sm leading-relaxed">
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="pt-3">
                <button
                  onClick={() => toggleSection("benefits")}
                  className="w-full flex items-center justify-between py-2 text-left font-serif font-semibold text-stone-900"
                >
                  <span>Key Benefits</span>
                  {openSection === "benefits" ? (
                    <ChevronUp className="w-4 h-4 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  )}
                </button>
                {openSection === "benefits" && (
                  <ul className="pb-3 text-stone-600 text-xs sm:text-sm space-y-1.5 list-disc list-inside">
                    {product.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* How to Use */}
            {product.how_to_use && (
              <div className="pt-3">
                <button
                  onClick={() => toggleSection("how_to_use")}
                  className="w-full flex items-center justify-between py-2 text-left font-serif font-semibold text-stone-900"
                >
                  <span>How to Use</span>
                  {openSection === "how_to_use" ? (
                    <ChevronUp className="w-4 h-4 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  )}
                </button>
                {openSection === "how_to_use" && (
                  <div className="pb-3 text-stone-600 text-xs sm:text-sm leading-relaxed">
                    <p>{product.how_to_use}</p>
                  </div>
                )}
              </div>
            )}

            {/* Ingredients */}
            {product.ingredients && (
              <div className="pt-3">
                <button
                  onClick={() => toggleSection("ingredients")}
                  className="w-full flex items-center justify-between py-2 text-left font-serif font-semibold text-stone-900"
                >
                  <span>Ingredients &amp; Materials</span>
                  {openSection === "ingredients" ? (
                    <ChevronUp className="w-4 h-4 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  )}
                </button>
                {openSection === "ingredients" && (
                  <div className="pb-3 text-stone-600 text-xs sm:text-sm leading-relaxed">
                    <p>{product.ingredients}</p>
                  </div>
                )}
              </div>
            )}

            {/* Shipping Info */}
            <div className="pt-3">
              <button
                onClick={() => toggleSection("shipping")}
                className="w-full flex items-center justify-between py-2 text-left font-serif font-semibold text-stone-900"
              >
                <span>Delivery in Ghana</span>
                {openSection === "shipping" ? (
                  <ChevronUp className="w-4 h-4 text-stone-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                )}
              </button>
              {openSection === "shipping" && (
                <div className="pb-3 text-stone-600 text-xs sm:text-sm space-y-2">
                  <p>
                    <strong>Greater Accra:</strong> Delivered within 24 hours (GH₵20–30 depending on area).
                  </p>
                  <p>
                    <strong>Kumasi, Takoradi &amp; Other Regions:</strong> Dispatched via trusted regional express courier (2–3 business days, GH₵35–50).
                  </p>
                  <p>
                    Free delivery on all orders above <strong>GH₵300</strong>!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24 pt-12 border-t border-black/5">
          <div className="mb-8">
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#5a5a40] block mb-1">
              Complete The Routine
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1a3c34] font-medium">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
