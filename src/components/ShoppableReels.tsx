import React from "react";
import { Sparkles, ArrowUpRight, Ghost, ShoppingBag, Check } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { formatPrice } from "../utils/format.ts";

interface SnapchatSpotlight {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  featuredProductId?: string;
}

export const ShoppableReels: React.FC = () => {
  const { settings, products, addToCart, setIsCartOpen } = useStore();
  const snapchatUrl = settings?.social_links?.snapchat || "https://www.snapchat.com/t/vjlTm2Px";

  const spotlights: SnapchatSpotlight[] = [
    {
      id: "snap-1",
      title: "Daily Crown Hydration & Edge Regimen",
      category: "Hair Care Tutorial",
      description: "Watch how we apply the herbal hair mist and oil massage on our daily Snapchat story.",
      image: "/images/pfy_hair_mist.jpg",
      featuredProductId: "prod-hair-oil-big",
    },
    {
      id: "snap-2",
      title: "Washday Sunday with Ayurvedic Mask",
      category: "Washday Routine",
      description: "Behind-the-scenes mixing, steam cap treatments, and coil definition routines.",
      image: "/images/pfy_hair_set.jpg",
      featuredProductId: "prod-hair-set-big",
    },
    {
      id: "snap-3",
      title: "Northern Ghana Raw Black Soap Making",
      category: "Skincare Secrets",
      description: "Fresh batches of pure cocoa pod and herbal black soap formulated for glowing skin.",
      image: "/images/pfy_black_soap.jpg",
      featuredProductId: "prod-skincare-soap-big",
    },
    {
      id: "snap-4",
      title: "Restocks, New Bags & Accra Deliveries",
      category: "Dispatch & Unboxing",
      description: "Live daily packaging, customer shoutouts, and express dispatch updates.",
      image: "/images/pfy_bag_duo.jpg",
      featuredProductId: "prod-bag-totebag",
    },
  ];

  const handleQuickAdd = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToCart(product, 1);
      setIsCartOpen(true);
    }
  };

  return (
    <section id="snapchat-stories-section" className="scroll-mt-28 space-y-6">
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/40 rounded-3xl p-6 sm:p-8 lg:p-10 card-shadow space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold">
              <Ghost className="w-3.5 h-3.5 text-amber-600" />
              <span>Official Snapchat Community</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium tracking-tight">
              Watch Our Daily Stories &amp; Tutorials
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
              We post daily hair care tutorials, live customer restocks, packaging moments, and natural hair consultations exclusively on our Snapchat.
            </p>
          </div>

          <a
            href={snapchatUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="snapchat-follow-btn"
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#FFFC00] hover:bg-[#ebd000] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 shrink-0 border border-black/10"
          >
            <Ghost className="w-4 h-4 fill-current" />
            <span>Join Us On Snapchat</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Real Story / Spotlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {spotlights.map((item) => {
            const product = products.find((p) => p.id === item.featuredProductId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Real Featured Product in Story */}
                  {product && (
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-stone-600 font-bold uppercase">Featured Item</p>
                        <p className="text-xs font-bold text-[#1a3c34]">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product.id, e)}
                        className="px-3 py-1.5 rounded-xl bg-[#1a3c34] hover:bg-[#2a4d45] text-white text-[11px] font-bold inline-flex items-center space-x-1.5 transition-colors shadow-2xs"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>
              <strong>Posting Daily on Snapchat:</strong> Add us to submit your hair texture photos for free routine advice and order assistance.
            </span>
          </div>
          <a
            href={snapchatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-900 font-bold underline hover:text-[#1a3c34] shrink-0"
          >
            Open snapchat.com/t/vjlTm2Px →
          </a>
        </div>
      </div>
    </section>
  );
};
