import React from "react";
import { MessageCircle, ShieldCheck, Heart, ArrowUpRight, Ghost } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { BrandLogo } from "./BrandLogo.tsx";

export const Footer: React.FC = () => {
  const { navigate, setSelectedCategory, settings, hasPurchased } = useStore();

  const handleCategoryClick = (catSlug: string) => {
    setSelectedCategory(catSlug);
    navigate("shop", { categorySlug: catSlug });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const phone = settings?.whatsapp || "233544590749";
  const snapchatUrl = settings?.social_links?.snapchat || "https://www.snapchat.com/t/vjlTm2Px";

  return (
    <footer className="bg-[#1a3c34] text-white pt-16 pb-24 md:pb-12 border-t border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => {
                navigate("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-left group transition-transform hover:opacity-95"
              aria-label="Perfect For You Home"
            >
              <BrandLogo variant="horizontal" size="md" inverted={true} />
            </button>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-sm">
              Beauty. Confidence. Simplicity. We bring authentic herbal hair rituals, nourishing barrier skincare, and comfortable footwear &amp; bags directly to your doorstep in Ghana.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5 items-center">
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>

              {snapchatUrl && (
                <a
                  href={snapchatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#FFFC00] hover:bg-[#ffeb3b] text-black text-xs font-semibold transition-colors shadow-xs"
                >
                  <Ghost className="w-4 h-4 fill-black text-black" />
                  <span>Snapchat</span>
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#f5f2ed] uppercase tracking-widest">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button
                  onClick={() => handleCategoryClick("hair")}
                  className="hover:text-white transition-colors"
                >
                  Hair Care Rituals
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("skincare")}
                  className="hover:text-white transition-colors"
                >
                  Skincare &amp; Balms
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("slippers")}
                  className="hover:text-white transition-colors"
                >
                  Footwear &amp; Slippers
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("bags")}
                  className="hover:text-white transition-colors"
                >
                  Everyday Bags &amp; Totes
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    navigate("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white transition-colors"
                >
                  All Products
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Help */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#f5f2ed] uppercase tracking-widest">
              Customer Help
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              {hasPurchased && (
                <li>
                  <button
                    onClick={() => {
                      navigate("order-tracking");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Track My Order
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => {
                    navigate("cart");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Shopping Bag
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate("wishlist");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white transition-colors"
                >
                  My Saved Wishlist
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${phone}?text=Hi%20Perfect%20For%20You,%20I%20have%20a%20question%20about%20delivery`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>Delivery Policies</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Ghana Dispatch */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-[#f5f2ed] uppercase tracking-widest">
              Ghana Dispatch
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Order dispatch hub located in East Legon, Accra. Express delivery across Greater Accra, Ashanti, Western &amp; all regions.
            </p>
            <p className="text-[11px] text-emerald-200/90 pt-1">
              Need assistance? Chat directly on WhatsApp (+233 54 459 0749) or add us on Snapchat.
            </p>
          </div>
        </div>

        {/* Bottom Payment Badges & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Perfect For You. All rights reserved. Accra, Ghana.</p>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Paystack Secured: MTN MoMo • Telecel • AT • Cards</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
