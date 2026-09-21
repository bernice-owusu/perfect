var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/handler.ts
var handler_exports = {};
__export(handler_exports, {
  default: () => handler
});
module.exports = __toCommonJS(handler_exports);

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_multer = __toESM(require("multer"), 1);
var crypto = __toESM(require("crypto"), 1);
var import_mongodb = require("mongodb");
var PORT = Number(process.env.PORT) || 3e3;
var app = (0, import_express.default)();
app.use(import_express.default.json());
var initialCategories = [
  {
    id: "cat-hair",
    name: "Hair",
    slug: "hair",
    description: "Hair care, nourishing oils, herbal masks, butters and hair sets.",
    image: "/images/pfy_model_duo.jpeg",
    is_active: true,
    item_count: 10
  },
  {
    id: "cat-skincare",
    name: "Skincare",
    slug: "skincare",
    description: "Botanical products for everyday glow, hydration and skin barrier care.",
    image: "/images/pfy_black_soap.jpg",
    is_active: true,
    item_count: 4
  },
  {
    id: "cat-slippers",
    name: "Slippers",
    slug: "slippers",
    description: "Comfortable and effortlessly stylish everyday footwear and slides.",
    image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
    is_active: true,
    item_count: 3
  },
  {
    id: "cat-bags",
    name: "Bags",
    slug: "bags",
    description: "Handcrafted tote bags, clutches and crossbodies for everyday style.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    is_active: true,
    item_count: 3
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Hair & beauty tools \u2014 derma rollers, scalp massagers and everyday self-care essentials.",
    image: "https://images.unsplash.com/flagged/photo-1570698500117-0c1785821fe1?auto=format&fit=crop&w=800&q=80",
    is_active: true,
    item_count: 2
  }
];
var initialSettings = {
  store_name: "Perfect For You",
  tagline: "Beauty. Confidence. Simplicity.",
  phone: "+233 54 459 0749 / 053 805 5631",
  whatsapp: "233544590749",
  email: "nancybempah2@gmail.com",
  address: "Perfect For You, St. John's Overhead, Achimota, Accra, Ghana",
  currency: "GH\u20B5",
  delivery_zones: [
    { id: "accra", name: "Greater Accra (Accra Central, East Legon, Airport, Osu)", fee: 20, eta: "Same day / 24 hours" },
    { id: "tema", name: "Greater Accra (Tema, Spintex, Kasoa)", fee: 30, eta: "1-2 business days" },
    { id: "kumasi", name: "Ashanti Region (Kumasi & environs)", fee: 35, eta: "2-3 business days" },
    { id: "takoradi", name: "Western Region (Sekondi-Takoradi)", fee: 40, eta: "2-3 business days" },
    { id: "other", name: "Other Regions across Ghana", fee: 50, eta: "3-4 business days" }
  ],
  paystack_public_key: "pk_test_pfy_mock_public_key",
  paystack_test_mode: true,
  social_links: {
    instagram: "https://instagram.com/perfectforyou_gh",
    tiktok: "https://www.tiktok.com/@perfect_for_you2",
    facebook: "https://facebook.com/perfectforyou.gh",
    snapchat: "https://snapchat.com/t/3UgHdBXR"
  }
};
function createEmptyStore() {
  return {
    products: [],
    categories: initialCategories,
    orders: [],
    settings: initialSettings,
    reviews: []
  };
}
var store = createEmptyStore();
var storeRevision = 0;
var MONGO_COLLECTION = "store";
var mongoDb = null;
var mongoConnectError = null;
async function connectMongo() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    mongoConnectError = "DATABASE_URL is not set \u2014 MongoDB (e.g. Mongo Atlas) is required for live data.";
    return;
  }
  try {
    const client = new import_mongodb.MongoClient(uri, { serverSelectionTimeoutMS: 8e3 });
    await client.connect();
    mongoDb = client.db();
    console.log("Connected to MongoDB. MongoDB is the live store.");
  } catch (err) {
    mongoConnectError = err instanceof Error ? err.message : String(err);
    mongoDb = null;
  }
}
async function loadStoreFromDb() {
  if (!mongoDb) return null;
  try {
    const doc = await mongoDb.collection(MONGO_COLLECTION).findOne({ _id: "main" });
    if (!doc) return null;
    const data = { ...doc };
    delete data._id;
    delete data.updatedAt;
    return data;
  } catch (err) {
    console.error("Error reading store from MongoDB:", err);
    return null;
  }
}
async function persistStoreToDb(data) {
  if (!mongoDb) return;
  try {
    await mongoDb.collection(MONGO_COLLECTION).replaceOne(
      { _id: "main" },
      { _id: "main", ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() },
      { upsert: true }
    );
  } catch (err) {
    console.error("Error writing store to MongoDB:", err);
  }
}
async function refreshStore() {
  const fromDb = await loadStoreFromDb();
  if (fromDb) store = fromDb;
  return store;
}
async function saveData(data) {
  storeRevision += 1;
  await persistStoreToDb(data);
}
async function initStore() {
  await connectMongo();
  if (!mongoDb) {
    throw new Error(
      mongoConnectError || "MongoDB is required but not configured. Set DATABASE_URL."
    );
  }
  const fromDb = await loadStoreFromDb();
  if (fromDb) {
    store = fromDb;
    return store;
  }
  await saveData(store);
  return store;
}
var uploadDir = import_path.default.join(process.cwd(), "public", "uploads");
if (!import_fs.default.existsSync(uploadDir)) {
  import_fs.default.mkdirSync(uploadDir, { recursive: true });
}
var storage = import_multer.default.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = import_path.default.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
    }
  }
});
app.use("/uploads", import_express.default.static(uploadDir));
function generateOrderNumber() {
  let maxNum = 100;
  for (const o of store.orders) {
    const match = o.order_number.match(/PFY-(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n) && n > maxNum) maxNum = n;
    }
  }
  return `PFY-${String(maxNum + 1).padStart(6, "0")}`;
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", name: "Perfect For You API" });
});
app.get("/api/revision", (_req, res) => {
  res.json({ revision: storeRevision });
});
app.get("/api/settings", async (_req, res) => {
  await refreshStore();
  res.json({ settings: store.settings });
});
app.put("/api/settings", requireAdmin, async (req, res) => {
  store.settings = { ...store.settings, ...req.body };
  await saveData(store);
  res.json({ success: true, settings: store.settings });
});
app.get("/api/categories", async (_req, res) => {
  await refreshStore();
  const categoriesWithCounts = store.categories.map((cat) => {
    const count = store.products.filter(
      (p) => p.category_id === cat.id && p.is_active
    ).length;
    return { ...cat, item_count: count };
  });
  res.json({ categories: categoriesWithCounts });
});
app.post("/api/categories", requireAdmin, async (req, res) => {
  const { name, description, image, is_active } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    description: description || "",
    image: image || "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
    is_active: is_active !== false
  };
  store.categories.push(newCat);
  await saveData(store);
  res.status(201).json({ success: true, category: newCat });
});
app.put("/api/categories/:id", requireAdmin, async (req, res) => {
  const index = store.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Category not found" });
  store.categories[index] = { ...store.categories[index], ...req.body };
  if (store.categories[index].name) {
    for (const prod of store.products) {
      if (prod.category_id === req.params.id) {
        prod.category_name = store.categories[index].name;
      }
    }
  }
  await saveData(store);
  res.json({ success: true, category: store.categories[index] });
});
app.get("/api/products", async (req, res) => {
  await refreshStore();
  const { category, search, featured, active_only, sort, is_set } = req.query;
  let list = [...store.products];
  if (active_only !== "false") {
    list = list.filter((p) => p.is_active);
  }
  if (category && typeof category === "string" && category !== "all") {
    list = list.filter(
      (p) => p.category_id === category || p.slug.includes(category) || p.category_name?.toLowerCase() === category.toLowerCase()
    );
  }
  if (featured === "true") {
    list = list.filter((p) => p.is_featured);
  }
  if (is_set === "true") {
    list = list.filter((p) => p.is_set);
  } else if (is_set === "false") {
    list = list.filter((p) => !p.is_set);
  }
  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category_name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    );
  }
  if (sort === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === "newest") {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  }
  res.json({ products: list, total: list.length });
});
app.get("/api/products/:idOrSlug", async (req, res) => {
  await refreshStore();
  const { idOrSlug } = req.params;
  const prod = store.products.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug
  );
  if (!prod) return res.status(404).json({ error: "Product not found" });
  res.json({ product: prod });
});
app.post("/api/products", requireAdmin, async (req, res) => {
  const {
    name,
    category_id,
    description,
    price,
    discount_price,
    stock,
    sku,
    images,
    sizes,
    benefits,
    ingredients,
    how_to_use,
    is_featured,
    is_active,
    is_set
  } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }
  const category = store.categories.find((c) => c.id === category_id);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + `-${Date.now().toString().slice(-4)}`;
  const newProd = {
    id: `prod-${Date.now()}`,
    name,
    slug,
    category_id: category_id || "cat-hair",
    category_name: category ? category.name : "Beauty",
    description: description || "",
    price: Number(price),
    discount_price: discount_price ? Number(discount_price) : void 0,
    stock: Number(stock ?? 10),
    sku: sku || `PFY-${Math.floor(1e3 + Math.random() * 9e3)}`,
    images: images && images.length > 0 ? images : [],
    sizes: sizes || [],
    benefits: Array.isArray(benefits) ? benefits : benefits ? [benefits] : [],
    ingredients: ingredients || "",
    how_to_use: how_to_use || "",
    is_featured: !!is_featured,
    is_active: is_active !== false,
    is_set: !!is_set,
    rating: 5,
    reviews_count: 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  store.products.unshift(newProd);
  await saveData(store);
  res.status(201).json({ success: true, product: newProd });
});
app.put("/api/products/:id", requireAdmin, async (req, res) => {
  const index = store.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });
  const existing = store.products[index];
  const updated = {
    ...existing,
    ...req.body,
    price: req.body.price !== void 0 ? Number(req.body.price) : existing.price,
    discount_price: req.body.discount_price !== void 0 ? req.body.discount_price ? Number(req.body.discount_price) : void 0 : existing.discount_price,
    stock: req.body.stock !== void 0 ? Number(req.body.stock) : existing.stock,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (req.body.category_id) {
    const cat = store.categories.find((c) => c.id === req.body.category_id);
    if (cat) updated.category_name = cat.name;
  }
  store.products[index] = updated;
  await saveData(store);
  res.json({ success: true, product: updated });
});
app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  const index = store.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });
  const [removed] = store.products.splice(index, 1);
  store.reviews = store.reviews.filter((r) => r.product_id !== removed.id);
  await saveData(store);
  res.json({ success: true, message: "Product deleted", product: removed });
});
app.post("/api/orders", async (req, res) => {
  await refreshStore();
  const {
    customer_name,
    email,
    phone,
    region,
    city,
    address,
    delivery_instructions,
    items,
    delivery_fee = 0,
    payment_reference,
    payment_method = "paystack"
  } = req.body;
  if (!customer_name || !phone || !items || items.length === 0) {
    return res.status(400).json({ error: "Please fill in all customer details and at least one item." });
  }
  let subtotal = 0;
  const oversold = [];
  for (const item of items) {
    const prod = store.products.find((p) => p.id === item.product_id);
    subtotal += item.price * (item.quantity || 1);
    if (prod) {
      const qty = item.quantity || 1;
      if (prod.stock < qty) {
        oversold.push(`${prod.name} (only ${prod.stock} left, you requested ${qty})`);
      }
    }
  }
  if (oversold.length > 0) {
    return res.status(400).json({
      error: `Insufficient stock: ${oversold.join("; ")}. Please reduce the quantity.`
    });
  }
  for (const item of items) {
    const prod = store.products.find((p) => p.id === item.product_id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - (item.quantity || 1));
    }
  }
  const orderNum = generateOrderNumber();
  const newOrder = {
    id: `ord-${Date.now()}`,
    order_number: orderNum,
    customer_name,
    email,
    phone,
    region: region || "Ghana",
    city: city || "",
    address,
    delivery_instructions: delivery_instructions || "",
    items,
    subtotal,
    delivery_fee: Number(delivery_fee),
    total: subtotal + Number(delivery_fee),
    payment_status: payment_method === "cash_on_delivery" ? "pending" : "paid",
    order_status: payment_method === "cash_on_delivery" ? "Pending" : "Paid",
    payment_method,
    paystack_reference: payment_reference || `pstk_sim_${Date.now()}`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    delivery_contact_status: "Not Contacted",
    delivery_note: ""
  };
  store.orders.unshift(newOrder);
  await saveData(store);
  res.status(201).json({
    success: true,
    order: newOrder,
    message: "Order placed successfully"
  });
});
app.get("/api/orders", requireAdmin, async (req, res) => {
  await refreshStore();
  const { status, search } = req.query;
  let list = [...store.orders];
  if (status && status !== "All") {
    list = list.filter((o) => o.order_status.toLowerCase() === status.toLowerCase());
  }
  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (o) => o.order_number.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q) || o.phone.includes(q) || o.email.toLowerCase().includes(q)
    );
  }
  res.json({ orders: list, total: list.length });
});
app.put("/api/orders/:id/status", requireAdmin, async (req, res) => {
  const { status, order_status, delivery_contact_status, delivery_note } = req.body;
  const order = store.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  const nextStatus = status || order_status;
  if (nextStatus) order.order_status = nextStatus;
  if (delivery_contact_status) order.delivery_contact_status = delivery_contact_status;
  if (delivery_note !== void 0) order.delivery_note = delivery_note;
  order.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  await saveData(store);
  res.json({ success: true, order });
});
app.get("/api/paystack/public-key", (_req, res) => {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || "";
  res.json({ publicKey });
});
app.post("/api/paystack/verify", async (req, res) => {
  const { reference, amount } = req.body || {};
  if (!reference) {
    return res.status(400).json({ verified: false, error: "Payment reference required" });
  }
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ verified: false, error: "Payment gateway is not configured" });
  }
  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const data = await paystackRes.json();
    const tx = data?.data;
    if (!paystackRes.ok || !data?.status || tx?.status !== "success") {
      return res.json({
        verified: false,
        reference,
        status: tx?.status || "failed",
        message: data?.message || "Transaction was not successful"
      });
    }
    if (amount != null && Math.round(Number(amount) * 100) !== tx.amount) {
      return res.json({
        verified: false,
        reference,
        status: "amount_mismatch",
        message: "Paid amount does not match the order total"
      });
    }
    return res.json({
      status: "success",
      verified: true,
      reference,
      amount: tx.amount,
      currency: tx.currency,
      gateway_response: tx.gateway_response,
      message: "Transaction verified by Paystack"
    });
  } catch (err) {
    console.error("Paystack verification error:", err);
    return res.status(502).json({ verified: false, error: "Could not reach payment gateway" });
  }
});
var adminTokens = /* @__PURE__ */ new Set();
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token && adminTokens.has(token)) return next();
  return res.status(401).json({ error: "Unauthorized: admin sign-in required." });
}
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "admin@perfectforyou.com" && password === "admin123" || email === "bernyx.owusu@gmail.com" && password === "admin123") {
    const token = crypto.randomBytes(32).toString("hex");
    adminTokens.add(token);
    return res.json({
      success: true,
      token,
      user: {
        name: "Store Administrator",
        email,
        role: "admin"
      }
    });
  }
  return res.status(401).json({ error: "Invalid admin email or password. Use demo login or admin@perfectforyou.com / admin123." });
});
app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  adminTokens.delete(token);
  return res.json({ success: true });
});
app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  await refreshStore();
  const totalSales = store.orders.reduce((sum, o) => o.payment_status === "paid" ? sum + o.total : sum, 0);
  const totalOrders = store.orders.length;
  const totalProducts = store.products.length;
  const lowStockCount = store.products.filter((p) => p.is_active && p.stock <= 7).length;
  const pendingOrdersCount = store.orders.filter((o) => o.order_status === "Pending" || o.order_status === "Paid" || o.order_status === "Processing").length;
  res.json({
    totalSales,
    totalOrders,
    totalProducts,
    lowStockCount,
    pendingOrdersCount,
    recentOrders: store.orders.slice(0, 5),
    lowStockProducts: store.products.filter((p) => p.is_active && p.stock <= 7)
  });
});
app.post("/api/upload/image", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl, filename: req.file.filename });
});
app.get("/api/reviews", async (_req, res) => {
  await refreshStore();
  res.json({ reviews: store.reviews });
});
app.post("/api/reviews", requireAdmin, async (req, res) => {
  const { product_id, author, location, rating, comment, verified_purchase } = req.body;
  if (!product_id || !author || !rating) {
    return res.status(400).json({ error: "Product, author name and rating are required" });
  }
  const product = store.products.find((p) => p.id === product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const newReview = {
    id: `rev-${Date.now()}`,
    product_id,
    product_name: product.name,
    author: String(author).slice(0, 80),
    location: location || "Ghana",
    rating: Math.max(1, Math.min(5, Number(rating))),
    comment: String(comment || "").slice(0, 1e3),
    date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    verified_purchase: !!verified_purchase
  };
  store.reviews.unshift(newReview);
  const productReviews = store.reviews.filter((r) => r.product_id === product_id);
  const avg = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
  product.rating = Math.round(avg * 10) / 10;
  product.reviews_count = productReviews.length;
  await saveData(store);
  res.status(201).json({
    success: true,
    review: newReview,
    rating: product.rating,
    reviews_count: product.reviews_count
  });
});
app.delete("/api/reviews/:id", requireAdmin, async (req, res) => {
  await refreshStore();
  const idx = store.reviews.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Review not found" });
  const removed = store.reviews[idx];
  store.reviews.splice(idx, 1);
  const product = store.products.find((p) => p.id === removed.product_id);
  if (product) {
    const productReviews = store.reviews.filter((r) => r.product_id === product.id);
    const avg = productReviews.length > 0 ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length : 5;
    product.rating = Math.round(avg * 10) / 10;
    product.reviews_count = productReviews.length;
  }
  await saveData(store);
  res.json({ success: true });
});
async function start() {
  const isProduction = process.env.NODE_ENV === "production" || !import_fs.default.existsSync(import_path.default.join(process.cwd(), "vite.config.ts"));
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Perfect For You server running on port ${PORT}`);
  });
}
if (!process.env.VERCEL) {
  initStore().then(start).catch((err) => {
    console.error("Failed to initialize store (MongoDB required):", err);
    process.exit(1);
  });
}
var server_default = app;

// api/handler.ts
var ready;
async function handler(req, res) {
  if (!ready) {
    ready = initStore().then(
      () => void 0,
      (err) => {
        console.error("initStore failed:", err);
      }
    );
  }
  await ready;
  return server_default(req, res);
}
