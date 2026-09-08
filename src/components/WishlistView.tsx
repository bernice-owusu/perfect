import React from "react";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { ProductCard } from "./ProductCard.tsx";

export const WishlistView: React.FC = () => {
  const { products, wishlist, navigate } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 fill-rose-100" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-2">
          Your Wishlist is Empty
        </h1>
        <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto">
          Save your favorite botanical hair oils, natural skincare, and shoes by clicking the heart icon on any product.
        </p>
        <button
          onClick={() => navigate("shop")}
          className="px-7 py-3.5 bg-[#1a3c34] text-white rounded-full text-xs font-semibold hover:bg-[#2a4d45] transition-all"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button
        onClick={() => navigate("shop")}
        className="inline-flex items-center space-x-1.5 text-xs text-[#5a5a40] hover:text-[#1a3c34] mb-6 font-medium uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Continue Browsing</span>
      </button>

      <div className="mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-[#5a5a40] block mb-1">
          Saved For Later
        </span>
        <h1 className="font-serif text-3xl font-medium text-[#1a3c34]">
          Your Wishlist ({wishlistedProducts.length})
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlistedProducts.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
};
