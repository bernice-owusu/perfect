import React from "react";
import { Home, ShoppingBag, Heart, ShoppingCart, Truck } from "lucide-react";
import { useStore, AppRoute } from "../context/StoreContext.tsx";

export const BottomNav: React.FC = () => {
  const { currentRoute, navigate, cartCount, wishlist, hasPurchased } = useStore();

  if (currentRoute === "admin") return null;

  const navItems: { label: string; route: AppRoute; icon: React.ReactNode; badge?: number }[] = [
    { label: "Home", route: "home", icon: <Home className="w-5 h-5" /> },
    { label: "Shop", route: "shop", icon: <ShoppingBag className="w-5 h-5" /> },
    { label: "Wishlist", route: "wishlist", icon: <Heart className="w-5 h-5" />, badge: wishlist.length },
    { label: "Cart", route: "cart", icon: <ShoppingCart className="w-5 h-5" />, badge: cartCount },
    ...(hasPurchased
      ? [{ label: "Track", route: "order-tracking" as AppRoute, icon: <Truck className="w-5 h-5" /> }]
      : []),
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 px-2 sm:px-3 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.07)]"
    >
      {navItems.map((item) => {
        const isActive = currentRoute === item.route;
        return (
          <button
            key={item.label}
            id={`bottom-nav-${item.route}`}
            onClick={() => navigate(item.route)}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] relative transition-colors ${
              isActive ? "text-[#1a3c34] font-bold" : "text-[#5a5a40]/80 hover:text-[#1a1a1a]"
            }`}
          >
            <div className="relative">
              {item.icon}
              {Boolean(item.badge && item.badge > 0) && (
                <span className="absolute -top-1.5 -right-2 bg-[#1a3c34] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a3c34] mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
