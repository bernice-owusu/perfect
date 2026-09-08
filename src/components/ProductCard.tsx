import React, { useState } from "react";
import { Heart, ShoppingBag, Check, Star } from "lucide-react";
import type { Product } from "../types.ts";
import { useStore } from "../context/StoreContext.tsx";
import { formatPrice } from "../utils/format.ts";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, addToCart, isInWishlist, toggleWishlist } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;
  const discountPercent =
    product.discount_price && product.discount_price > product.price
      ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleCardClick = () => {
    navigate("product", { productId: product.id });
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="group relative bg-[#f9f9f7] rounded-3xl border border-black/5 card-shadow hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/5 w-full bg-[#eae7e0] overflow-hidden">
        <img
          src={product.images[0] || "/images/pfy_hair_set.jpg"}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("/images/pfy_hair_set.jpg")) {
              target.src = "/images/pfy_hair_set.jpg";
            }
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Wishlist Button */}
        <button
          id={`wishlist-toggle-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#5a5a40] hover:text-rose-600 shadow-xs transition-all hover:scale-110"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              inWishlist ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Badges container */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10">
          {discountPercent && (
            <span className="bg-[#1a3c34] text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-xs">
              Save {discountPercent}%
            </span>
          )}
          {isLowStock && (
            <span className="bg-[#5a5a40] text-white text-[9px] sm:text-[10px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs">
              Only {product.stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-stone-800 text-white text-[9px] sm:text-[10px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
              Out of stock
            </span>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#5a5a40] mb-1">
            <span className="uppercase tracking-[0.18em] text-[9px] sm:text-[10px] font-bold text-[#5a5a40] truncate max-w-[90px] sm:max-w-none">
              {product.category_name || "Care"}
            </span>
            <div className="flex items-center space-x-1 text-amber-500 shrink-0">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
              <span className="text-[#1a1a1a] font-medium text-[11px] sm:text-xs">
                {product.rating ? product.rating.toFixed(1) : "5.0"}
              </span>
              <span className="text-[#5a5a40] text-[9px] sm:text-[10px]">
                ({product.reviews_count || 12})
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif text-[#1a1a1a] font-medium text-sm sm:text-base md:text-lg leading-snug line-clamp-2 mb-1 sm:mb-2 group-hover:text-[#1a3c34] transition-colors">
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-[11px] sm:text-xs text-[#5a5a40] line-clamp-1 sm:line-clamp-2 leading-relaxed mb-2 sm:mb-3">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2.5 sm:pt-3 border-t border-black/5 flex items-center justify-between gap-1 sm:gap-2 mt-auto">
          <div className="min-w-0">
            <div className="flex items-baseline space-x-1 sm:space-x-1.5 flex-wrap">
              <span className="text-sm sm:text-base md:text-lg font-bold text-[#1a3c34] whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
              {product.discount_price && product.discount_price > product.price && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through whitespace-nowrap">
                  {formatPrice(product.discount_price)}
                </span>
              )}
            </div>
          </div>

          {/* Add to cart button */}
          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold flex items-center space-x-1 sm:space-x-1.5 transition-all shadow-xs shrink-0 min-h-[34px] sm:min-h-[36px] ${
              isOutOfStock
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : isAdded
                ? "bg-[#5a5a40] text-white"
                : "bg-[#1a3c34] hover:bg-[#2a4d45] text-white active:scale-95"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
