import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type {
  Product,
  Category,
  CartItem,
  StoreSettings,
  CustomerReview,
  Order,
} from "../types.ts";

export type AppRoute =
  | "home"
  | "shop"
  | "product"
  | "cart"
  | "checkout"
  | "order-confirmation"
  | "about"
  | "contact"
  | "faq"
  | "wishlist"
  | "admin";

interface RouteParams {
  productId?: string;
  categorySlug?: string;
  orderNumber?: string;
  confirmedOrder?: Order;
}

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: StoreSettings | null;
  reviews: CustomerReview[];
  orders: Order[];
  isLoading: boolean;
  currentRoute: AppRoute;
  routeParams: RouteParams;
  cart: CartItem[];
  wishlist: string[]; // product ids
  isCartOpen: boolean;
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  searchQuery: string;
  selectedCategory: string;

  // Actions
  navigate: (route: AppRoute, params?: RouteParams) => void;
  addToCart: (product: Product, quantity?: number, variantId?: string, size?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string, size?: string) => void;
  removeFromCart: (productId: string, variantId?: string, size?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setIsCartOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  loginAdmin: (token: string, user: AdminUser) => void;
  logoutAdmin: () => void;
  refreshData: () => Promise<void>;
  cartSubtotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if current URL is /perfectadmin or #perfectadmin
  const isPerfectAdminUrl = (): boolean => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === "/perfectadmin" ||
      path === "/perfectadmin/" ||
      path.endsWith("/perfectadmin") ||
      path.endsWith("/perfectadmin/") ||
      hash === "#perfectadmin" ||
      hash === "#/perfectadmin"
    );
  };

  // Navigation: defaults to admin ONLY if visiting /perfectadmin
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() =>
    isPerfectAdminUrl() ? "admin" : "home"
  );
  const [routeParams, setRouteParams] = useState<RouteParams>({});

  // Sync route with URL bar changes (direct navigation, back/forward, hash changes)
  useEffect(() => {
    const handleUrlChange = () => {
      if (isPerfectAdminUrl()) {
        setCurrentRoute("admin");
      }
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("pfy_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pfy_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin session
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem("pfy_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem("pfy_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem("pfy_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Fetch initial data
  // The loading flag only gates the very first load. Background refreshes
  // (after admin saves, revision polling) must NOT flip it, otherwise App
  // swaps the admin portal for the spinner and its active tab resets.
  const hasLoadedRef = useRef(false);
  const refreshData = async () => {
    try {
      if (!hasLoadedRef.current) setIsLoading(true);
      const ordersFetch = adminUser
        ? fetch("/api/orders", {
            headers: { Authorization: `Bearer ${localStorage.getItem("pfy_admin_token") || ""}` },
          })
        : Promise.resolve(null);
      const [prodsRes, catsRes, setRes, revsRes, ordersRes] = await Promise.all([
        fetch("/api/products?active_only=false"),
        fetch("/api/categories"),
        fetch("/api/settings"),
        fetch("/api/reviews"),
        ordersFetch,
      ]);

      if (prodsRes.ok) {
        const d = await prodsRes.json();
        setProducts(d.products || []);
      }
      if (catsRes.ok) {
        const d = await catsRes.json();
        setCategories(d.categories || []);
      }
      if (setRes.ok) {
        const d = await setRes.json();
        setSettings(d.settings || null);
      }
      if (revsRes.ok) {
        const d = await revsRes.json();
        setReviews(d.reviews || []);
      }
      if (ordersRes && ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(d.orders || []);
      }
    } catch (err) {
      console.error("Error loading store data:", err);
    } finally {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Orders are admin-only (they hold customer PII): load them on sign-in and
  // drop them from memory when signed out.
  useEffect(() => {
    if (adminUser) {
      refreshData();
    } else {
      setOrders([]);
    }
  }, [adminUser]);

  // ---- Auto-sync: keep admin & storefront in sync (revision polling) ----
  // The server bumps /api/revision on every store write. Each open tab polls it
  // and re-fetches the store whenever it changes, so admin edits appear on the
  // storefront and new customer orders appear in admin without a manual reload.
  const revisionRef = useRef<number | null>(null);
  const syncingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkForChanges = async () => {
      if (syncingRef.current) return;
      try {
        syncingRef.current = true;
        const res = await fetch("/api/revision");
        if (!res.ok) return;
        const data = await res.json();
        const rev = data?.revision ?? null;
        if (rev === null) return;
        if (revisionRef.current !== null && rev !== revisionRef.current) {
          await refreshData();
        }
        revisionRef.current = rev;
      } catch (err) {
        // Ignore transient network errors; next poll will retry.
      } finally {
        syncingRef.current = false;
      }
    };

    refreshData()
      .then(() => checkForChanges())
      .catch(() => {});

    const intervalId = window.setInterval(checkForChanges, 10000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkForChanges();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const navigate = (route: AppRoute, params: RouteParams = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    if (typeof window !== "undefined") {
      if (route === "admin") {
        if (!isPerfectAdminUrl()) {
          try {
            window.history.pushState({}, "", "/perfectadmin");
          } catch {
            window.location.hash = "perfectadmin";
          }
        }
      } else {
        if (isPerfectAdminUrl()) {
          try {
            window.history.pushState({}, "", "/");
          } catch {
            window.location.hash = "";
          }
        }
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update the browser tab title for SEO + UX on every route change
  useEffect(() => {
    let title = "Perfect For You | Natural Hair Care, Skincare & Sets in Ghana";
    if (currentRoute === "shop") {
      title = "Shop | Perfect For You";
    } else if (currentRoute === "about") {
      title = "About Us | Perfect For You";
    } else if (currentRoute === "contact") {
      title = "Contact & Directions | Perfect For You";
    } else if (currentRoute === "faq") {
      title = "FAQ | Perfect For You";
    } else if (currentRoute === "cart") {
      title = "Your Cart | Perfect For You";
    } else if (currentRoute === "checkout") {
      title = "Checkout | Perfect For You";
    } else if (currentRoute === "wishlist") {
      title = "Wishlist | Perfect For You";
    } else if (currentRoute === "admin") {
      title = "Admin | Perfect For You";
    } else if (currentRoute === "product" && routeParams.productId) {
      const p = products.find((pr) => pr.id === routeParams.productId);
      if (p) {
        title = `${p.name} | Perfect For You`;
      }
    }
    if (typeof document !== "undefined") {
      document.title = title;
    }
  }, [currentRoute, routeParams.productId, products]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    variantId?: string,
    size?: string
  ) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product_id === product.id &&
          item.selected_variant_id === variantId &&
          item.selected_size === size
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            product_id: product.id,
            product,
            selected_size: size,
            selected_variant_id: variantId,
            unit_price: product.price,
            quantity,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (
    productId: string,
    quantity: number,
    variantId?: string,
    size?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product_id === productId &&
          item.selected_variant_id === variantId &&
          item.selected_size === size
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (
    productId: string,
    variantId?: string,
    size?: string
  ) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product_id === productId &&
            item.selected_variant_id === variantId &&
            item.selected_size === size
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const loginAdmin = (token: string, user: AdminUser) => {
    localStorage.setItem("pfy_admin_token", token);
    localStorage.setItem("pfy_admin_user", JSON.stringify(user));
    setAdminUser(user);
  };

  const logoutAdmin = () => {
    const token = localStorage.getItem("pfy_admin_token");
    if (token) {
      fetch("/api/admin/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem("pfy_admin_token");
    localStorage.removeItem("pfy_admin_user");
    setAdminUser(null);
  };

  const cartSubtotal =
    Math.round(
      cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) * 100
    ) / 100;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        reviews,
        orders,
        isLoading,
        currentRoute,
        routeParams,
        cart,
        wishlist,
        isCartOpen,
        adminUser,
        isAdminAuthenticated: !!adminUser,
        searchQuery,
        selectedCategory,
        navigate,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        setIsCartOpen,
        setSearchQuery,
        setSelectedCategory,
        loginAdmin,
        logoutAdmin,
        refreshData,
        cartSubtotal,
        cartCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
