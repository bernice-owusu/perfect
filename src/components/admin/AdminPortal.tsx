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
  Save,
  RefreshCw,
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
    settings,
    refreshData,
    navigate,
  } = useStore();

  // Login form state
  const [emailInput, setEmailInput] = useState("admin@perfectforyou.com");
  const [passwordInput, setPasswordInput] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab: 'dashboard' | 'products' | 'orders' | 'categories' | 'settings'
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "categories" | "settings">("dashboard");

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

  // Order status modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Settings form state
  const [tempSettings, setTempSettings] = useState<StoreSettings | null>(settings);

  // Product Search in Admin
  const [productSearch, setProductSearch] = useState("");
  // Order status filter in Admin
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

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

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingProduct),
        });
      } else {
        // Create new
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingProduct),
        });
      }
      setShowProductModal(false);
      setEditingProduct(null);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
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
        headers: { "Content-Type": "application/json" },
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

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSettings) return;
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
            <BrandLogo variant="vertical" size="lg" />
            <div className="pt-2 border-t border-black/5">
              <span className="inline-block px-3 py-1 bg-[#1a3c34]/5 text-[#1a3c34] text-[11px] font-bold uppercase tracking-widest rounded-full">
                Admin Management Portal
              </span>
            </div>
            <p className="text-xs text-[#5a5a40]">
              Sign in to manage catalog products, orders, inventory, and Ghana delivery rates.
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
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category_name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === "all") return true;
    return o.order_status.toLowerCase() === orderStatusFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#f5f2ed] pb-20">
      {/* Top Admin Bar */}
      <header className="bg-[#1a3c34] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandLogo variant="horizontal" size="sm" inverted={true} showTagline={false} />
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
              onClick={logoutAdmin}
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
            <span>Products ({products.length})</span>
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
            <span>Settings &amp; Delivery</span>
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
                        <span className="text-stone-400 text-xs">({ord.phone})</span>
                      </div>
                      <span className="text-[11px] text-stone-500 block mt-0.5">
                        {ord.items.length} item(s) • {ord.city} ({ord.region})
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
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
                      images: [
                        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
                      ],
                      description: "",
                      is_active: true,
                      is_featured: false,
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
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
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

              {/* Status Filter */}
              <div className="flex items-center space-x-2 text-xs">
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

            {/* Orders List Table */}
            <div className="bg-white rounded-3xl border border-black/5 card-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f9f9f7] border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Destination</th>
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
                          <span className="text-[11px] text-stone-500">
                            {ord.phone}
                          </span>
                        </td>

                        <td className="p-4 text-stone-600 max-w-xs truncate">
                          {ord.city} ({ord.region})
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
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: CATEGORIES (PRD #24)            */}
        {/* ======================================= */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                Product Categories
              </h2>
              <p className="text-xs text-stone-500">
                Curated departments for Hair products, Skincare, Slippers, and Bags.
              </p>
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
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-stone-900">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 mb-3">
                      {cat.description}
                    </p>
                    <span className="text-xs font-semibold text-[#5a5a40]">
                      {products.filter((p) => p.category_id === cat.id).length} Active Products
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: SETTINGS & DELIVERY (PRD #25)   */}
        {/* ======================================= */}
        {activeTab === "settings" && tempSettings && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                Store Settings &amp; Delivery Fees
              </h2>
              <p className="text-xs text-stone-500">
                Manage contact WhatsApp, top announcement banner, and regional delivery charges.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-black/5 p-6 sm:p-8 card-shadow space-y-6">
              {/* Store & WhatsApp */}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Free Accra Delivery Threshold (GH₵)
                    </label>
                    <input
                      type="number"
                      value={tempSettings.free_delivery_threshold}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          free_delivery_threshold: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Zones */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="font-serif text-base font-semibold text-stone-900 pb-2 border-b border-stone-100">
                  Regional Delivery Zones &amp; Rates (GH₵)
                </h3>

                <div className="space-y-3">
                  {tempSettings.delivery_zones.map((zone, idx) => (
                    <div
                      key={zone.id}
                      className="p-3 bg-[#f9f9f7] rounded-2xl border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-xs text-stone-900 block">
                          {zone.name}
                        </span>
                        <span className="text-[11px] text-[#5a5a40]">
                          ETA: {zone.eta}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-stone-500">Fee (GH₵):</span>
                        <input
                          type="number"
                          value={zone.fee}
                          onChange={(e) => {
                            const updated = [...tempSettings.delivery_zones];
                            updated[idx].fee = Number(e.target.value);
                            setTempSettings({ ...tempSettings, delivery_zones: updated });
                          }}
                          className="w-20 px-3 py-1 text-xs font-bold text-[#1a3c34] bg-white border border-stone-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                        />
                      </div>
                    </div>
                  ))}
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h3 className="font-serif text-xl font-semibold text-stone-900">
                {editingProduct.id ? "Edit Product Details" : "Add New Product"}
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
                  Image URL (High quality photo)
                </label>
                <input
                  type="text"
                  value={editingProduct.images?.[0] || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      images: [e.target.value],
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
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-xl font-semibold"
                >
                  Save Product
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-black/5 my-8 space-y-6">
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
              <div className="flex justify-between">
                <span className="text-stone-500">Phone:</span>
                <a href={`tel:${selectedOrder.phone}`} className="font-semibold text-[#1a3c34] hover:underline">
                  {selectedOrder.phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Email:</span>
                <span className="font-semibold text-stone-900">{selectedOrder.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Delivery Address:</span>
                <span className="font-semibold text-stone-900 text-right max-w-[200px]">
                  {selectedOrder.address}, {selectedOrder.city} ({selectedOrder.region})
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
          </div>
        </div>
      )}
    </div>
  );
};
