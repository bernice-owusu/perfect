import React, { useEffect } from "react";
import { StoreProvider, useStore } from "./context/StoreContext.tsx";
import { Header } from "./components/Header.tsx";
import { Footer } from "./components/Footer.tsx";
import { BottomNav } from "./components/BottomNav.tsx";
import { WhatsAppButton } from "./components/WhatsAppButton.tsx";
import { CartDrawer } from "./components/CartDrawer.tsx";
import { HomeView } from "./components/HomeView.tsx";
import { ShopView } from "./components/ShopView.tsx";
import { ProductDetailView } from "./components/ProductDetailView.tsx";
import { CartView } from "./components/CartView.tsx";
import { CheckoutView } from "./components/CheckoutView.tsx";
import { OrderConfirmationView } from "./components/OrderConfirmationView.tsx";
import { OrderTrackingView } from "./components/OrderTrackingView.tsx";
import { WishlistView } from "./components/WishlistView.tsx";
import { AdminPortal } from "./components/admin/AdminPortal.tsx";

const StoreApp: React.FC = () => {
  const { currentRoute, isLoading } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentRoute]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#5a5a40]/20 border-t-[#1a3c34] animate-spin" />
        <span className="font-serif text-[#1a3c34] text-xl font-semibold tracking-wide">
          Perfect For You
        </span>
      </div>
    );
  }

  // Admin view operates as a dedicated portal
  if (currentRoute === "admin") {
    return <AdminPortal />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f2ed] text-[#1a1a1a] font-sans selection:bg-[#1a3c34] selection:text-white">
      {/* Global Header */}
      <Header />

      {/* Main Routing Views */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentRoute === "home" && <HomeView />}
        {currentRoute === "shop" && <ShopView />}
        {currentRoute === "product" && <ProductDetailView />}
        {currentRoute === "cart" && <CartView />}
        {currentRoute === "checkout" && <CheckoutView />}
        {currentRoute === "order-confirmation" && <OrderConfirmationView />}
        {currentRoute === "order-tracking" && <OrderTrackingView />}
        {currentRoute === "wishlist" && <WishlistView />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Floating WhatsApp Quick Action Button */}
      <WhatsAppButton />

      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreApp />
    </StoreProvider>
  );
}
