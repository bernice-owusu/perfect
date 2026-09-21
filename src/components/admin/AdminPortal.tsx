import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  X,
  Search,
  DollarSign,
  Layers,
  PackageOpen,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  Download,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";
import { useStore } from "../../context/StoreContext.tsx";
import { BrandLogo } from "../BrandLogo.tsx";
import type { Product, Order, OrderStatus, Category, StoreSettings } from "../../types.ts";

export const AdminPortal: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminUser,
    loginAdmin,
    logoutAdmin,
    products,
    categories,
    orders,
    reviews,
    settings,
    refreshData,
    navigate,
  } = useStore();

  // Admin API helpers — every admin request must carry the Bearer session token.
  const adminToken = () => localStorage.getItem("pfy_admin_token") || "";
  const adminHeaders = (json = true) => {
    const headers: Record<string, string> = { Authorization: `Bearer ${adminToken()}` };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
  };

  // Max gallery images per product (bags use the full set; all products allow this).
  const MAX_PRODUCT_IMAGES = 5;

  // Login form state
  const [emailInput, setEmailInput] = useState("admin@perfectforyou.com");
  const [passwordInput, setPasswordInput] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab: 'dashboard' | 'products' | 'orders' | 'categories' | 'settings' | 'sets' | 'reviews'
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "orders" | "categories" | "settings" | "sets" | "reviews"
  >("dashboard");

  // Admin stats
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockCount: 0,
  });

  // Product Modal / Editing State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Category Modal / Editing State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const catImageInputRef = React.useRef<HTMLInputElement>(null);

  // Order status modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Delete-product confirmation modal
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  // Settings form state
  const [tempSettings, setTempSettings] = useState<StoreSettings | null>(settings);

  // Product Search in Admin
  const [productSearch, setProductSearch] = useState("");
  // Order status filter in Admin
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  // Order search in Admin
  const [orderSearch, setOrderSearch] = useState("");
  // Back-door delivery note draft (order modal)
  const [deliveryNoteDraft, setDeliveryNoteDraft] = useState("");
  // Review management (admin adds on behalf of customer)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({
    product_id: "",
    author: "",
    location: "Ghana",
    rating: 5,
    comment: "",
    verified_purchase: true,
  });
  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminStats();
    }
  }, [isAdminAuthenticated, orders, products]);

  useEffect(() => {
    if (settings) {
      setTempSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (selectedOrder) {
      setDeliveryNoteDraft(selectedOrder.delivery_note || "");
    }
  }, [selectedOrder]);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { headers: adminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: adminHeaders(false),
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setEditingProduct((prev) => {
          const existing = prev?.images || [];
          if (existing.length >= MAX_PRODUCT_IMAGES) return prev;
          return { ...prev!, images: [...existing, data.imageUrl] };
        });
        setUploadError("");
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      if (res.ok) {
        const data = await res.json();
        loginAdmin(data.token, data.user);
      } else {
        setLoginError("Invalid email or password. Please use admin@perfectforyou.com / admin123");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Save / Update Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    try {
      if (editingProduct.id) {
        // Update
        await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: adminHeaders(),
          body: JSON.stringify(editingProduct),
        });
      } else {
        // Create new
        await fetch("/api/products", {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify(editingProduct),
        });
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setUploadError("");
      setUploading(false);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  };

  // Category Image Upload Handler
  const handleCategoryImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: adminHeaders(false),
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setEditingCategory((prev) => ({ ...prev!, image: data.imageUrl }));
        setUploadError("");
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Save / Update Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    try {
      if (editingCategory.id) {
        // Update
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: adminHeaders(),
          body: JSON.stringify(editingCategory),
        });
      } else {
        // Create new
        await fetch("/api/categories", {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify(editingCategory),
        });
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setUploadError("");
      setUploading(false);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Error saving category");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE", headers: adminHeaders() });
      if (!res.ok) throw new Error("Delete failed");
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({ order_status: newStatus }),
      });
      await refreshData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // Update back-door delivery contact status + note (persisted to server)
  const handleUpdateDelivery = async (
    orderId: string,
    delivery_contact_status: string,
    delivery_note: string
  ) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({ delivery_contact_status, delivery_note }),
      });
      await refreshData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          delivery_contact_status: delivery_contact_status as Order["delivery_contact_status"],
          delivery_note,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save delivery details");
    }
  };

  // Export orders (respecting current filters) to a CSV file
  const exportOrdersCSV = () => {
    const rows = filteredOrders.map((o) => ({
      Order: o.order_number,
      Date: new Date(o.created_at).toLocaleDateString("en-GB"),
      Customer: o.customer_name,
      Phone: o.phone,
      Email: o.email,
      Destination: o.city ? `${o.city} (${o.region})` : "To be arranged by team",
      Items: o.items.map((it) => `${it.product_name} x${it.quantity}`).join("; "),
      Subtotal: o.subtotal.toFixed(2),
      Delivery: o.delivery_fee.toFixed(2),
      Total: o.total.toFixed(2),
      Payment: `${o.payment_method} ${o.payment_status}`,
      Fulfillment: o.order_status,
      DeliveryStatus: o.delivery_contact_status || "Not Contacted",
      Note: (o.delivery_note || "").replace(/[\n\r]+/g, " | "),
    }));

    if (rows.length === 0) {
      alert("No orders to export.");
      return;
    }

    const headers = Object.keys(rows[0]) as string[];
    const escape = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(String(r[h as keyof typeof r]))).join(",")),
    ].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `perfect-for-you-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Open "add review" modal, pre-selecting a product
  const openAddReview = (productId?: string) => {
    setReviewDraft({
      product_id: productId || (products[0]?.id ?? ""),
      author: "",
      location: "Ghana",
      rating: 5,
      comment: "",
      verified_purchase: true,
    });
    setShowReviewModal(true);
  };

  // Admin adds a review on behalf of a customer (from WhatsApp)
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewDraft.product_id || !reviewDraft.author.trim() || !reviewDraft.comment.trim()) return;
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify(reviewDraft),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to add review");
        return;
      }
      setShowReviewModal(false);
      setReviewDraft({ product_id: "", author: "", location: "Ghana", rating: 5, comment: "", verified_purchase: true });
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to add review");
    }
  };

  // Admin deletes a review
  const handleDeleteReview = async (reviewId: string, author: string) => {
    if (!confirm(`Delete \u201C${author}\u201Ds review? This also updates the product rating.`)) return;
    try {
      await fetch(`/api/reviews/${reviewId}`, { method: "DELETE", headers: adminHeaders() });
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete review");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSettings) return;
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify(tempSettings),
      });
      await refreshData();
      alert("Settings updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update settings");
    }
  };

  // ============================================
  // 1. LOGIN SCREEN IF NOT AUTHENTICATED (PRD #20)
  // ============================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-black/5 card-shadow space-y-6">
          <div className="text-center space-y-3">
            <BrandLogo variant="mark" size="lg" />
            <div className="pt-2 border-t border-black/5">
              <span className="inline-block px-3 py-1 bg-[#1a3c34]/5 text-[#1a3c34] text-[11px] font-bold uppercase tracking-widest rounded-full">
                Admin Management Portal
              </span>
            </div>
            <p className="text-xs text-[#5a5a40]">
              Sign in to manage catalog products, orders, inventory, and store settings.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md"
            >
              {isLoggingIn ? "Authenticating..." : "Sign In to Admin"}
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Demo: admin@perfectforyou.com</span>
            <button
              onClick={() => navigate("home")}
              className="text-[#1a3c34] hover:underline font-medium"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // 2. AUTHENTICATED ADMIN DASHBOARD (PRD #21 - #25)
  // ============================================
  const matchesProductSearch = (p: Product) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category_name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  };

  // Regular products only — sets live exclusively in the Sets & Bundles tab.
  const filteredProducts = products.filter((p) => !p.is_set && matchesProductSearch(p));

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== "all" && o.order_status.toLowerCase() !== orderStatusFilter.toLowerCase()) {
      return false;
    }
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q)
    );
  });

  const filteredSets = products.filter((p) => p.is_set && matchesProductSearch(p));

  return (
    <div className="min-h-screen bg-[#f5f2ed] pb-20">
      {/* Top Admin Bar */}
      <header className="bg-[#1a3c34] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandLogo variant="mark" size="sm" inverted={true} />
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-[#eae7e0] text-[10px] font-semibold tracking-wider uppercase border border-white/10">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("home")}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </button>

            <div className="text-right hidden md:block">
              <span className="text-xs font-medium block leading-none">
                {adminUser?.name || "Admin"}
              </span>
              <span className="text-[10px] text-[#eae7e0]">
                {adminUser?.email || "admin@perfectforyou.com"}
              </span>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 rounded-full bg-white/10 hover:bg-rose-900/40 text-stone-200 hover:text-rose-200 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto border-t border-white/10 scrollbar-none text-xs font-medium">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === "dashboard"
                ? "border-white text-white font-bold"
                : "border-transparent text-stone-300 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === "products"
                ? "border-white text-white font-bold"
                : "border-transparent text-stone-300 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
                <span>Products ({products.filter((p) => !p.is_set).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sets")}
            className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === "sets"
                ? "border-white text-white font-bold"
                : "border-transparent text-stone-300 hover:text-white"
            }`}
          >
            <PackageOpen className="w-4 h-4" />
            <span>Sets ({products.filter((p) => p.is_set).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === "orders"
                ? "border-white text-white font-bold"
                : "border-transparent text-stone-300 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === "reviews"
                ? "border-white text-white font-bold"
                : "border-transparent text-stone-300 hover:text-white"
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Reviews ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === "categories"
                ? "border-white text-white font-bold"
                : "border-transparent text-stone-300 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === "settings"
                ? "border-white text-white font-bold"
                : "border-transparent text-stone-300 hover:text-white"
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ======================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW (PRD #21)    */}
        {/* ======================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-black/5 card-shadow">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#eae7e0] text-[#1a3c34] flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1a3c34]">
                  GH₵{stats.totalSales || orders.reduce((s, o) => s + (o.payment_status === "paid" ? o.total : 0), 0)}
                </span>
                <span className="text-[11px] text-[#1a3c34] block mt-1 font-medium">
                  Verified via Paystack
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total Orders
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {stats.totalOrders || orders.length}
                </span>
                <span className="text-[11px] text-stone-400 block mt-1">
                  Lifetime customer purchases
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Pending Dispatch
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-700">
                  {orders.filter((o) => o.order_status === "Paid" || o.order_status === "Processing").length}
                </span>
                <span className="text-[11px] text-stone-400 block mt-1">
                  Requires packaging / rider
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Low Stock Alerts
                  </span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-rose-700">
                  {products.filter((p) => p.stock <= 5).length}
                </span>
                <span className="text-[11px] text-rose-600 block mt-1 font-medium">
                  Under 5 units in stock
                </span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-900">
                    Recent Customer Orders
                  </h3>
                  <span className="text-xs text-stone-500">
                    Latest guest transactions through Paystack
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-semibold text-[#1a3c34] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {orders.slice(0, 5).map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50 p-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-[#1a3c34]">
                          {ord.order_number}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="font-semibold text-xs text-stone-900">
                          {ord.customer_name}
                        </span>
                        <span className="text-stone-400 text-xs flex items-center gap-1.5">
                          ({ord.phone})
                          <a
                            href={`tel:${ord.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded-md text-[#1a3c34] hover:bg-[#1a3c34]/5"
                            title="Call customer"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                            title="Contact on WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 block mt-0.5">
                        {ord.items.length} item(s) • {ord.city ? `${ord.city}, ${ord.region}` : "To be arranged by team"}
                      </span>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <span className="font-bold text-xs text-stone-900">
                        GH₵{ord.total}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                          ord.order_status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.order_status === "Shipped"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ord.order_status}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          (ord.delivery_contact_status || "Not Contacted") === "Not Contacted"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {ord.delivery_contact_status || "Not Contacted"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: PRODUCT MANAGEMENT (PRD #22)    */}
        {/* ======================================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900">
                  Products &amp; Pricing Management
                </h2>
                <p className="text-xs text-stone-500">
                  Update live prices, inventory counts, images, and discounts without hard-coding.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search product / SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      name: "",
                      slug: "",
                      sku: `PFY-${Math.floor(Math.random() * 9000 + 1000)}`,
                      category_id: categories[0]?.id || "cat-hair",
                      category_name: categories[0]?.name || "Hair Care",
                      price: 80,
                      discount_price: undefined,
                      stock: 25,
                      images: [],
                      description: "",
                      is_active: true,
                      is_featured: false,
                      is_set: false,
                    });
                    setShowProductModal(true);
                  }}
                  className="px-4 py-2 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Live Price</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="p-4 flex items-center space-x-3">
                          <img
                            src={prod.images[0]}
                            alt=""
                            className="w-10 h-12 object-cover rounded-lg bg-stone-100 shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-stone-900 block">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-stone-400 flex items-center space-x-2">
                              <span>SKU: {prod.sku || "N/A"}</span>
                              {prod.is_set && (
                                <span className="bg-[#1a3c34] text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                  Set
                                </span>
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-stone-600">
                          {prod.category_name}
                        </td>

                        <td className="p-4 font-bold text-[#1a3c34]">
                          GH₵{prod.price}
                        </td>

                        <td className="p-4 text-stone-500">
                          {prod.discount_price ? `GH₵${prod.discount_price}` : "—"}
                        </td>

                        <td className="p-4">
                          <span
                            className={`font-semibold ${
                              prod.stock <= 5 ? "text-rose-600 font-bold" : "text-stone-700"
                            }`}
                          >
                            {prod.stock} units
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              prod.is_active
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-stone-100 text-stone-500"
                            }`}
                          >
                            {prod.is_active ? "Active" : "Draft"}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct({ ...prod });
                              setShowProductModal(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-[#1a3c34] hover:bg-stone-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete({ id: prod.id, name: prod.name })}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB: SETS & BUNDLES                     */}
        {/* ======================================= */}
        {activeTab === "sets" && (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900">
                  Sets &amp; Bundles
                </h2>
                <p className="text-xs text-stone-500">
                  Curated combos sold as one unit — upload one set image and set
                  one price.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search set / SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      name: "",
                      slug: "",
                      sku: `PFY-SET-${Math.floor(Math.random() * 9000 + 1000)}`,
                      category_id: categories[0]?.id || "cat-hair",
                      category_name: categories[0]?.name || "Hair Care",
                      price: 0,
                      discount_price: undefined,
                      stock: 10,
                      images: [],
                      description: "",
                      is_active: true,
                      is_featured: true,
                      is_set: true,
                    });
                    setShowProductModal(true);
                  }}
                  className="px-4 py-2 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
              </div>
            </div>

            {/* Sets Table */}
            {filteredSets.length > 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Set</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Live Price</th>
                        <th className="p-4">Discount</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredSets.map((prod) => (
                        <tr key={prod.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="p-4 flex items-center space-x-3">
                            <img
                              src={prod.images[0]}
                              alt=""
                              className="w-10 h-12 object-cover rounded-lg bg-stone-100 shrink-0"
                            />
                            <div>
                              <span className="font-semibold text-stone-900 flex items-center space-x-2">
                                {prod.name}
                                <span className="bg-[#1a3c34] text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                  Set
                                </span>
                              </span>
                              <span className="text-[10px] text-stone-400">
                                SKU: {prod.sku || "N/A"}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-stone-600">
                            {prod.category_name}
                          </td>

                          <td className="p-4 font-bold text-[#1a3c34]">
                            GH₵{prod.price}
                          </td>

                          <td className="p-4 text-stone-500">
                            {prod.discount_price ? `GH₵${prod.discount_price}` : "—"}
                          </td>

                          <td className="p-4">
                            <span
                              className={`font-semibold ${
                                prod.stock <= 5 ? "text-rose-600 font-bold" : "text-stone-700"
                              }`}
                            >
                              {prod.stock} units
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                prod.is_active
                                  ? "bg-emerald-50 text-emerald-800"
                                  : "bg-stone-100 text-stone-500"
                              }`}
                            >
                              {prod.is_active ? "Active" : "Draft"}
                            </span>
                          </td>

                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct({ ...prod });
                                setShowProductModal(true);
                              }}
                              className="p-1.5 text-stone-600 hover:text-[#1a3c34] hover:bg-stone-100 rounded-lg"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setProductToDelete({ id: prod.id, name: prod.name })}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-200/80 mx-auto max-w-md p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">
                  No sets yet
                </h3>
                <p className="text-stone-500 text-xs leading-relaxed mb-6">
                  Create your first set — upload one image, set one price, and
                  sell the bundle as its own unit.
                </p>
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: "",
                      slug: "",
                      sku: `PFY-SET-${Math.floor(Math.random() * 9000 + 1000)}`,
                      category_id: categories[0]?.id || "cat-hair",
                      category_name: categories[0]?.name || "Hair Care",
                      price: 0,
                      discount_price: undefined,
                      stock: 10,
                      images: [],
                      description: "",
                      is_active: true,
                      is_featured: true,
                      is_set: true,
                    });
                    setShowProductModal(true);
                  }}
                  className="px-6 py-3 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-semibold"
                >
                  Create First Set
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: ORDER MANAGEMENT (PRD #23)      */}
        {/* ======================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900">
                  Customer Orders &amp; Dispatch
                </h2>
                <p className="text-xs text-stone-500">
                  Manage fulfillment, update tracking statuses, and view delivery instructions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search order #, name, phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a3c34] w-full sm:w-56"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>

                <button
                  onClick={exportOrdersCSV}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                {/* Status Filter */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-stone-500">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white border border-stone-300 rounded-full px-3 py-1.5 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                  >
                    <option value="all">All Orders</option>
                    <option value="Paid">Paid (Pending Dispatch)</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
            </div>
          </div>

            {/* Orders List - responsive cards on mobile/tablet, table on lg+ */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-black/5 card-shadow p-10 text-center text-sm text-stone-500">
                No orders match your filters.
              </div>
            ) : (
              <>
                {/* Mobile / tablet order cards */}
                <div className="lg:hidden space-y-3">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className="bg-white rounded-2xl border border-black/5 card-shadow p-4 space-y-3 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-mono font-bold text-sm text-[#1a3c34]">
                            {ord.order_number}
                          </span>
                          <span className="block text-[11px] text-stone-400 mt-0.5">
                            {new Date(ord.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-stone-100 rounded-lg text-stone-700 font-semibold text-xs">
                          View
                        </span>
                      </div>

                      <div>
                        <span className="font-semibold text-stone-900 block text-xs">
                          {ord.customer_name}
                        </span>
                        <span className="text-[11px] text-stone-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                          {ord.phone}
                          <a
                            href={`tel:${ord.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1a3c34]/5 text-[#1a3c34] hover:bg-[#1a3c34]/10 font-semibold"
                            title="Call customer"
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </a>
                          <a
                            href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                            title="Contact on WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </a>
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs">
                          <span className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold block mb-1">
                            Team Delivery
                          </span>
                          {ord.city ? (
                            <span className="text-stone-600 text-[11px] block">
                              {ord.city}, {ord.region}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-stone-400 block">
                              To be arranged by team
                            </span>
                          )}
                          <span
                            className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              (ord.delivery_contact_status || "Not Contacted") === "Not Contacted"
                                ? "bg-rose-50 text-rose-600"
                                : (ord.delivery_contact_status || "") === "Contacted"
                                ? "bg-sky-50 text-sky-700"
                                : (ord.delivery_contact_status || "") === "Delivery Arranged"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {ord.delivery_contact_status || "Not Contacted"}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-sm text-stone-900 block">
                            GH₵{ord.total}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                            Paystack {ord.payment_status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                        <span className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">
                          Fulfillment
                        </span>
                        <select
                          value={ord.order_status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                          }
                          className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-[11px] font-semibold text-stone-800"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped / Rider</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="bg-white rounded-3xl border border-black/5 card-shadow overflow-hidden hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f9f9f7] border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Order #</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Team Delivery</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Fulfillment</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredOrders.map((ord) => (
                          <tr
                            key={ord.id}
                            className="hover:bg-stone-50/60 transition-colors cursor-pointer"
                            onClick={() => setSelectedOrder(ord)}
                          >
                            <td className="p-4 font-mono font-bold text-[#1a3c34]">
                              {ord.order_number}
                            </td>

                            <td className="p-4 text-stone-500">
                              {new Date(ord.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>

                            <td className="p-4">
                              <span className="font-semibold text-stone-900 block">
                                {ord.customer_name}
                              </span>
                              <span className="text-[11px] text-stone-500 flex items-center gap-1.5">
                                {ord.phone}
                                <a
                                  href={`tel:${ord.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1a3c34]/5 text-[#1a3c34] hover:bg-[#1a3c34]/10 font-semibold"
                                  title="Call customer"
                                >
                                  <Phone className="w-3 h-3" />
                                  Call
                                </a>
                                <a
                                  href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                                  title="Contact on WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  WhatsApp
                                </a>
                              </span>
                            </td>

                            <td className="p-4">
                              {ord.city ? (
                                <span className="text-stone-600 text-[11px] block">{ord.city}, {ord.region}</span>
                              ) : (
                                <span className="text-[10px] font-semibold text-stone-400 block">
                                  To be arranged by team
                                </span>
                              )}
                              <span
                                className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  (ord.delivery_contact_status || "Not Contacted") === "Not Contacted"
                                    ? "bg-rose-50 text-rose-600"
                                    : (ord.delivery_contact_status || "") === "Contacted"
                                    ? "bg-sky-50 text-sky-700"
                                    : (ord.delivery_contact_status || "") === "Delivery Arranged"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {ord.delivery_contact_status || "Not Contacted"}
                              </span>
                            </td>

                            <td className="p-4 font-bold text-stone-900">
                              GH₵{ord.total}
                            </td>

                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                                Paystack {ord.payment_status}
                              </span>
                            </td>

                            <td className="p-4">
                              <select
                                value={ord.order_status}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                                }
                                className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-[11px] font-semibold text-stone-800"
                              >
                                <option value="Paid">Paid</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped / Rider</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(ord);
                                }}
                                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 font-semibold"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB: REVIEWS (admin adds on behalf)     */}
        {/* ======================================= */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900">
                  Customer Reviews
                </h2>
                <p className="text-xs text-stone-500">
                  We collect reviews on WhatsApp — add them here on the customer's behalf so they appear on the storefront.
                </p>
              </div>

              <button
                onClick={() => openAddReview()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Review</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-black/5 card-shadow p-10 text-center text-sm text-stone-500">
                No reviews yet. Click "Add Review" to publish the first one.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-stone-900 text-sm block mt-1.5">
                          {rev.author}
                          <span className="text-stone-400 font-normal"> • {rev.location}</span>
                        </span>
                        <span className="text-[11px] text-[#1a3c34] font-medium block">
                          {rev.product_name || "Product"}
                          {rev.verified_purchase ? " • Verified purchase" : ""}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(rev.id, rev.author)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">"{rev.comment}"</p>
                    <span className="text-[10px] text-stone-400 block">{rev.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: CATEGORIES (PRD #24)            */}
        {/* ======================================= */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900">
                  Product Categories
                </h2>
                <p className="text-xs text-stone-500">
                  Curated departments for Hair products, Skincare, Slippers, and Bags.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory({
                    name: "",
                    slug: "",
                    description: "",
                    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
                    is_active: true,
                  });
                  setShowCategoryModal(true);
                }}
                className="px-4 py-2 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="aspect-4/3 relative bg-stone-100">
                    <img
                      src={cat.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setEditingCategory({ ...cat });
                        setShowCategoryModal(true);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-xs text-stone-700 hover:text-[#1a3c34] rounded-full shadow-xs transition-colors"
                      title="Edit category"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!cat.is_active && (
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800/80 text-white">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-stone-900">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 mb-3">
                      {cat.description}
                    </p>
                    <span className="text-xs font-semibold text-[#5a5a40]">
                      {products.filter((p) => p.category_id === cat.id && !p.is_set).length} Active Products
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: SETTINGS (PRD #25)        */}
        {/* ======================================= */}
        {activeTab === "settings" && tempSettings && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                Store Settings
              </h2>
              <p className="text-xs text-stone-500">
                Manage contact details, announcement banner, and social media links.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-black/5 p-6 sm:p-8 card-shadow space-y-6">
              {/* Contact & Announcement */}
              <div className="space-y-4">
                <h3 className="font-serif text-base font-semibold text-stone-900 pb-2 border-b border-stone-100">
                  Contact &amp; Announcement
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Store Announcement Bar
                  </label>
                  <input
                    type="text"
                    value={tempSettings.announcement_bar}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, announcement_bar: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Customer Support WhatsApp
                    </label>
                    <input
                      type="text"
                      value={tempSettings.whatsapp}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, whatsapp: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Enquiry Email
                    </label>
                    <input
                      type="email"
                      value={tempSettings.email}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Store Address
                  </label>
                  <input
                    type="text"
                    value={tempSettings.address}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-semibold text-stone-900 pb-2 border-b border-stone-100">
                  Social Media Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      value={tempSettings.social_links?.instagram || ""}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          social_links: {
                            ...tempSettings.social_links,
                            instagram: e.target.value,
                          },
                        })
                      }
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      TikTok URL
                    </label>
                    <input
                      type="text"
                      value={tempSettings.social_links?.tiktok || ""}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          social_links: {
                            ...tempSettings.social_links,
                            tiktok: e.target.value,
                          },
                        })
                      }
                      placeholder="https://www.tiktok.com/@..."
                      className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="text"
                      value={tempSettings.social_links?.facebook || ""}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          social_links: {
                            ...tempSettings.social_links,
                            facebook: e.target.value,
                          },
                        })
                      }
                      placeholder="https://facebook.com/..."
                      className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Snapchat Profile URL
                    </label>
                    <input
                      type="text"
                      value={tempSettings.social_links?.snapchat || ""}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          social_links: {
                            ...tempSettings.social_links,
                            snapchat: e.target.value,
                          },
                        })
                      }
                      placeholder="https://www.snapchat.com/t/..."
                      className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-semibold flex items-center space-x-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ============================================ */}
      {/* MODAL: ADD / EDIT PRODUCT (PRD #22)          */}
      {/* ============================================ */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex overflow-y-auto p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 m-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h3 className="font-serif text-xl font-semibold text-stone-900">
                {editingProduct.id
                  ? editingProduct.is_set
                    ? "Edit Set Details"
                    : "Edit Product Details"
                  : editingProduct.is_set
                  ? "Add New Set"
                  : "Add New Product"}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category_id}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        category_id: e.target.value,
                        category_name: cat?.name || "General",
                      });
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Price (GH₵) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Discount Price (GH₵)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional original price"
                    value={editingProduct.discount_price || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        discount_price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock ?? 10}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Product Images{" "}
                  <span className="font-normal text-stone-400">
                    ({editingProduct.images?.length || 0}/{MAX_PRODUCT_IMAGES})
                  </span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach((f) => handleImageUpload(f));
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                <div className="space-y-3">
                  {editingProduct.images && editingProduct.images.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {editingProduct.images.map((img, idx) => (
                        <div
                          key={`${img}-${idx}`}
                          className="relative aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200"
                        >
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setEditingProduct({
                                ...editingProduct,
                                images: editingProduct.images!.filter((_, i) => i !== idx),
                              })
                            }
                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {editingProduct.images.length < MAX_PRODUCT_IMAGES && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square border-2 border-dashed border-[#1a3c34]/30 bg-[#1a3c34]/5 hover:border-[#1a3c34]/50 hover:bg-[#1a3c34]/10 rounded-xl flex flex-col items-center justify-center text-[#1a3c34]/70 transition-colors"
                        >
                          <Plus className="w-6 h-6" />
                          <span className="text-[11px] mt-1 font-medium">Add</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-xl p-6 text-center transition-colors border-[#1a3c34]/30 bg-[#1a3c34]/5 hover:border-[#1a3c34]/50 hover:bg-[#1a3c34]/10"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add("border-[#1a3c34]", "bg-[#1a3c34]/10");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("border-[#1a3c34]", "bg-[#1a3c34]/10");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("border-[#1a3c34]", "bg-[#1a3c34]/10");
                        Array.from(e.dataTransfer.files).forEach((f) => handleImageUpload(f));
                      }}
                    >
                      <Upload className="w-8 h-8 mx-auto text-[#1a3c34]/60 mb-2" />
                      <p className="text-sm font-medium text-stone-700">
                        Click or drag images to upload
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        JPEG, PNG, WebP or GIF • Max 5MB • Up to {MAX_PRODUCT_IMAGES} images
                      </p>
                    </div>
                  )}
                  {uploading && <p className="text-xs text-amber-600 mt-2">Uploading...</p>}
                  {uploadError && <p className="text-xs text-rose-600 mt-2">{uploadError}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Ingredients / Materials
                  </label>
                  <input
                    type="text"
                    value={editingProduct.ingredients || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        ingredients: e.target.value,
                      })
                    }
                    placeholder="e.g. Raw shea butter, amla oil"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    How to Use
                  </label>
                  <input
                    type="text"
                    value={editingProduct.how_to_use || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        how_to_use: e.target.value,
                      })
                    }
                    placeholder="e.g. Apply to damp scalp 3x weekly"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured ?? false}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_featured: e.target.checked,
                      })
                    }
                    className="rounded text-[#1a3c34] focus:ring-[#1a3c34]"
                  />
                  <span>Featured on Home Page</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active ?? true}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_active: e.target.checked,
                      })
                    }
                    className="rounded text-[#1a3c34] focus:ring-[#1a3c34]"
                  />
                  <span>Active for Sale</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setUploadError("");
                    setUploading(false);
                  }}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-xl font-semibold"
                >
                  {editingProduct.is_set ? "Save Set" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL: ADD / EDIT CATEGORY                  */}
      {/* ============================================ */}
      {showCategoryModal && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex overflow-y-auto p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 m-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h3 className="font-serif text-xl font-semibold text-stone-900">
                {editingCategory.id ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Category Image / Icon
                </label>
                <div className="space-y-3">
                  {editingCategory.image && (
                    <div className="relative w-32 h-24 bg-stone-100 rounded-xl overflow-hidden">
                      <img
                        src={editingCategory.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCategory({
                            ...editingCategory,
                            image: "",
                          })
                        }
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div
                    className="border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer bg-[#1a3c34]/5 hover:border-[#1a3c34]/50 hover:bg-[#1a3c34]/10"
                    onClick={() => catImageInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files[0]) {
                        handleCategoryImageUpload(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <input
                      ref={catImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => e.target.files[0] && handleCategoryImageUpload(e.target.files[0])}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 mx-auto text-[#1a3c34]/60 mb-2" />
                    <p className="text-sm font-medium text-stone-700">
                      {editingCategory.image ? "Click or drag to replace" : "Click or drag to upload"}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      JPEG, PNG, WebP or GIF • Max 5MB
                    </p>
                    {uploading && <p className="text-xs text-amber-600 mt-2">Uploading...</p>}
                    {uploadError && <p className="text-xs text-rose-600 mt-2">{uploadError}</p>}
                  </div>
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingCategory.is_active ?? true}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      is_active: e.target.checked,
                    })
                  }
                  className="rounded text-[#1a3c34] focus:ring-[#1a3c34]"
                />
                <span>Active (visible on storefront)</span>
              </label>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setUploadError("");
                    setUploading(false);
                  }}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-xl font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL: ADD REVIEW (ON BEHALF OF CUSTOMER) */}
      {/* ============================================ */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex overflow-y-auto p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 m-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Publish on behalf of customer
                </span>
                <h3 className="font-serif text-xl font-semibold text-stone-900">
                  Add Review
                </h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Product *
                </label>
                <select
                  required
                  value={reviewDraft.product_id}
                  onChange={(e) =>
                    setReviewDraft({ ...reviewDraft, product_id: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewDraft.author}
                    onChange={(e) => setReviewDraft({ ...reviewDraft, author: e.target.value })}
                    placeholder="e.g. Adwoa O."
                    className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={reviewDraft.location}
                    onChange={(e) => setReviewDraft({ ...reviewDraft, location: e.target.value })}
                    placeholder="e.g. Accra"
                    className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Rating *
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setReviewDraft({ ...reviewDraft, rating: r })}
                      aria-label={`${r} star${r > 1 ? "s" : ""}`}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          r <= reviewDraft.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-stone-500 ml-2 font-semibold">
                    {reviewDraft.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Review Comment *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewDraft.comment}
                  onChange={(e) => setReviewDraft({ ...reviewDraft, comment: e.target.value })}
                  placeholder="What the customer shared with us on WhatsApp..."
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reviewDraft.verified_purchase}
                  onChange={(e) =>
                    setReviewDraft({ ...reviewDraft, verified_purchase: e.target.checked })
                  }
                  className="rounded text-[#1a3c34] focus:ring-[#1a3c34]"
                />
                <span>Verified purchase (shared with us on WhatsApp)</span>
              </label>

              <div className="pt-3 border-t border-stone-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-xl font-semibold"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL: ORDER DETAILS & DISPATCH INFO         */}
      {/* ============================================ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex overflow-y-auto p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-black/5 m-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Order Details
                </span>
                <h3 className="font-mono text-xl font-bold text-[#1a3c34]">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="bg-[#f9f9f7] p-4 rounded-2xl text-xs space-y-2 border border-black/5">
              <div className="flex justify-between">
                <span className="text-stone-500">Customer:</span>
                <span className="font-semibold text-stone-900">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-stone-500">Phone:</span>
                <span className="flex items-center gap-2">
                  <a href={`tel:${selectedOrder.phone}`} className="font-semibold text-[#1a3c34] hover:underline">
                    {selectedOrder.phone}
                  </a>
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#1a3c34]/5 text-[#1a3c34] hover:bg-[#1a3c34]/10 font-semibold"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </a>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Email:</span>
                <span className="font-semibold text-stone-900">{selectedOrder.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Delivery Address:</span>
                <span className="font-semibold text-stone-900 text-right max-w-[200px]">
                  {selectedOrder.address || selectedOrder.city
                    ? `${[selectedOrder.address, selectedOrder.city].filter(Boolean).join(", ")}${selectedOrder.address || selectedOrder.city ? ` (${selectedOrder.region})` : ""}`
                    : "To be arranged by our team"}
                </span>
              </div>
              {selectedOrder.delivery_instructions && (
                <div className="pt-2 border-t border-stone-200 text-amber-800">
                  <strong>Landmark:</strong> {selectedOrder.delivery_instructions}
                </div>
              )}
            </div>

            {/* Ordered Items */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-stone-800 block">Ordered Items:</span>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-3 max-h-48 overflow-y-auto">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-stone-900 block">{it.product_name}</span>
                      <span className="text-stone-400 text-[10px]">
                        Qty: {it.quantity} {it.size ? `• Size: ${it.size}` : ""}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900">GH₵{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status changer */}
            <div className="pt-3 border-t border-stone-200 space-y-2">
              <label className="block text-xs font-semibold text-stone-700">
                Update Fulfillment Status:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                {(["Paid", "Processing", "Shipped", "Delivered"] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      selectedOrder.order_status === st
                        ? "bg-[#1a3c34] text-white border-[#1a3c34]"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Back-door delivery tracking (team reaches out to arrange) */}
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <label className="block text-xs font-semibold text-stone-700">
                Team Delivery Contact:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                {(["Not Contacted", "Contacted", "Delivery Arranged", "Delivered"] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() =>
                        handleUpdateDelivery(selectedOrder.id, st, deliveryNoteDraft)
                      }
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                        (selectedOrder.delivery_contact_status || "Not Contacted") === st
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
              <textarea
                value={deliveryNoteDraft}
                onChange={(e) => setDeliveryNoteDraft(e.target.value)}
                rows={3}
                placeholder="Delivery arrangement agreed with the customer (address, landmark, time)..."
                className="w-full text-xs bg-[#f9f9f7] border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
              />
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    handleUpdateDelivery(
                      selectedOrder.id,
                      selectedOrder.delivery_contact_status || "Not Contacted",
                      deliveryNoteDraft
                    )
                  }
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Delivery Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL: DELETE PRODUCT CONFIRMATION           */}
      {/* ============================================ */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex overflow-y-auto p-4">
          <div className="w-full max-w-sm m-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-stone-900">
                Delete this product?
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                &ldquo;{productToDelete.name}&rdquo; will be permanently removed from your store and
                cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-xs text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = productToDelete.id;
                  setProductToDelete(null);
                  handleDeleteProduct(id);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 rounded-xl font-semibold text-xs text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL: LOGOUT CONFIRMATION                   */}
      {/* ============================================ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-stone-900">
                Sign out of Admin?
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                You'll need your admin credentials to sign back in later.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-xs text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logoutAdmin();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 rounded-xl font-semibold text-xs text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
