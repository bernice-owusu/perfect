import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import * as crypto from "crypto";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import { MongoClient, type Db } from "mongodb";
import type { Product, Category, Order, StoreSettings, CustomerReview, ProductTip } from "./src/types.ts";

const PORT = Number(process.env.PORT) || 3000;
const app = express();

// Cookie parser for refresh tokens
app.use(cookieParser());

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex");
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString("hex");
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Audit Log Storage (in production, use a proper logging service)
interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: "auth" | "admin_action" | "security" | "api_error";
  action: string;
  userId?: string;
  email?: string;
  ip: string;
  userAgent: string;
  details: Record<string, unknown>;
  success: boolean;
}

const auditLogs: AuditLogEntry[] = [];
const MAX_AUDIT_LOGS = 10000;

function writeAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  const logEntry: AuditLogEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  auditLogs.push(logEntry);
  if (auditLogs.length > MAX_AUDIT_LOGS) {
    auditLogs.shift();
  }
  // In production, also send to logging service (e.g., DataDog, LogRocket, etc.)
  console.log("[AUDIT]", JSON.stringify(logEntry));
}

// Failed login tracking for brute-force detection
const failedLogins = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

function recordFailedLogin(ip: string, email: string) {
  const now = Date.now();
  const record = failedLogins.get(ip) || { count: 0, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;
  // Lock after 5 failed attempts for 15 minutes
  if (record.count >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000;
    writeAuditLog({
      type: "security",
      action: "account_locked",
      email,
      ip,
      userAgent: "",
      details: { reason: "Too many failed login attempts", attempts: record.count },
      success: false,
    });
  }
  failedLogins.set(ip, record);
}

function isIpLocked(ip: string): boolean {
  const record = failedLogins.get(ip);
  if (!record || !record.lockedUntil) return false;
  if (Date.now() > record.lockedUntil) {
    failedLogins.delete(ip);
    return false;
  }
  return true;
}

function clearFailedLogins(ip: string) {
  failedLogins.delete(ip);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.paystack.co"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.paystack.co"],
      frameSrc: ["'self'", "https://js.paystack.co"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting - disabled for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints - disabled
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { error: "Too many login attempts, please try again later." },
});
app.use("/api/admin/login", authLimiter);
app.use("/api/paystack/verify", authLimiter);

// CSRF protection (manual implementation for API endpoints)
const csrfTokens = new Map<string, { token: string; expires: number }>();

function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token));
}

function csrfMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Skip CSRF for GET requests and public endpoints
  const publicPaths = [
    "/api/health",
    "/api/revision",
    "/api/products",
    "/api/categories",
    "/api/settings",
    "/api/reviews",
    "/api/tips",
    "/api/paystack/public-key",
  ];
  if (req.method === "GET" || publicPaths.some(p => req.path.startsWith(p))) {
    return next();
  }
  // Skip CSRF for admin login (handled by rate limit)
  if (req.path === "/admin/login") {
    return next();
  }

  const sessionId = req.headers["x-session-id"] as string || req.ip || "anonymous";
  const token = req.headers["x-csrf-token"] as string;

  if (!token || !validateCsrfToken(sessionId, token)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
}

app.use("/api/", csrfMiddleware);

// Endpoint to get CSRF token
app.get("/api/csrf-token", (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || req.ip || "anonymous";
  const token = generateCsrfToken();
  csrfTokens.set(sessionId, { token, expires: Date.now() + 60 * 60 * 1000 }); // 1 hour
  // Clean old tokens periodically
  if (csrfTokens.size > 1000) {
    const now = Date.now();
    for (const [key, val] of csrfTokens.entries()) {
      if (val.expires < now) csrfTokens.delete(key);
    }
  }
  res.json({ csrfToken: token });
});

// Default initial data based on PRD requirements
const initialCategories: Category[] = [
  {
    id: "cat-hair",
    name: "Hair",
    slug: "hair",
    description: "Hair care, nourishing oils, herbal masks, butters and hair sets.",
    image: "/images/pfy_model_duo.jpeg",
    is_active: true,
    item_count: 10,
  },
  {
    id: "cat-skincare",
    name: "Skincare",
    slug: "skincare",
    description: "Botanical products for everyday glow, hydration and skin barrier care.",
    image: "/images/pfy_black_soap.jpg",
    is_active: true,
    item_count: 4,
  },
  {
    id: "cat-slippers",
    name: "Slippers",
    slug: "slippers",
    description: "Comfortable and effortlessly stylish everyday footwear and slides.",
    image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
    is_active: true,
    item_count: 3,
  },
  {
    id: "cat-bags",
    name: "Bags",
    slug: "bags",
    description: "Handcrafted tote bags, clutches and crossbodies for everyday style.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    is_active: true,
    item_count: 3,
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Hair & beauty tools — derma rollers, scalp massagers and everyday self-care essentials.",
    image: "https://images.unsplash.com/flagged/photo-1570698500117-0c1785821fe1?auto=format&fit=crop&w=800&q=80",
    is_active: true,
    item_count: 2,
  },
];

const initialSettings: StoreSettings = {
  store_name: "Perfect For You",
  tagline: "Beauty. Confidence. Simplicity.",
  phone: "+233 54 459 0749 / 053 805 5631",
  whatsapp: "233544590749",
  email: "nancybempah2@gmail.com",
  address: "Perfect For You, St. John's Overhead, Achimota, Accra, Ghana",
  currency: "GH₵",
  delivery_zones: [
    { id: "accra", name: "Greater Accra (Accra Central, East Legon, Airport, Osu)", fee: 20, eta: "Same day / 24 hours" },
    { id: "tema", name: "Greater Accra (Tema, Spintex, Kasoa)", fee: 30, eta: "1-2 business days" },
    { id: "kumasi", name: "Ashanti Region (Kumasi & environs)", fee: 35, eta: "2-3 business days" },
    { id: "takoradi", name: "Western Region (Sekondi-Takoradi)", fee: 40, eta: "2-3 business days" },
    { id: "other", name: "Other Regions across Ghana", fee: 50, eta: "3-4 business days" },
  ],
  paystack_public_key: "pk_test_pfy_mock_public_key",
  paystack_test_mode: true,
  social_links: {
    instagram: "https://instagram.com/perfectforyou_gh",
    tiktok: "https://www.tiktok.com/@perfect_for_you2",
    facebook: "https://facebook.com/perfectforyou.gh",
    snapchat: "https://snapchat.com/t/3UgHdBXR",
  },
};

// Data store helpers
interface StoreData {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: StoreSettings;
  reviews: CustomerReview[];
  tips: ProductTip[];
  admins: AdminUser[];
}

interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "admin";
  createdAt: string;
  refreshTokenHash?: string;
  lastLogin?: string;
}

// Fresh-start seed: default categories + settings only (needed by the
// storefront). Products, orders, and reviews start empty — they are entered
// through the admin panel.
async function createEmptyStore(): Promise<StoreData> {
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const defaultAdmin2Password = process.env.ADMIN2_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);
  const passwordHash2 = await bcrypt.hash(defaultAdmin2Password, 12);

  return {
    products: [],
    categories: initialCategories,
    orders: [],
    settings: initialSettings,
    reviews: [],
    tips: [],
    admins: [
      {
        id: "admin-1",
        email: process.env.ADMIN_EMAIL || "admin@perfectforyou.com",
        passwordHash,
        name: "Store Administrator",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "admin-2",
        email: process.env.ADMIN2_EMAIL || "bernyx.owusu@gmail.com",
        passwordHash: passwordHash2,
        name: "Bernice Owusu",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

let store: StoreData = {
  products: [],
  categories: initialCategories,
  orders: [],
  settings: initialSettings,
  reviews: [],
  tips: [],
  admins: [],
};

// Bumped on every saveData() so clients (storefront + admin) can auto-sync
let storeRevision = 0;

// --- MongoDB (durable store, REQUIRED) -------------------------------------
// The store lives in MongoDB (e.g. MongoDB Atlas) and is the ONLY source of
// truth — no fallback to the local JSON file. A single document keeps the
// exact JSON shape used everywhere else, so no schema migration is needed.
const MONGO_COLLECTION = "store";
let mongoDb: Db | null = null;
let mongoConnectError: string | null = null;

async function connectMongo(): Promise<void> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    mongoConnectError = "DATABASE_URL is not set — MongoDB (e.g. Mongo Atlas) is required for live data.";
    return;
  }
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    mongoDb = client.db();
    console.log("Connected to MongoDB. MongoDB is the live store.");
  } catch (err) {
    mongoConnectError = err instanceof Error ? err.message : String(err);
    mongoDb = null;
  }
}

async function loadStoreFromDb(): Promise<StoreData | null> {
  if (!mongoDb) return null;
  try {
    const doc = await mongoDb
      .collection(MONGO_COLLECTION)
      .findOne({ _id: "main" } as any);
    if (!doc) return null;
    const data: Record<string, unknown> = { ...(doc as unknown as Record<string, unknown>) };
    delete data._id;
    delete data.updatedAt;
    if (!data.tips) data.tips = [];
    if (!data.reviews) data.reviews = [];
    if (!data.orders) data.orders = [];
    if (!data.products) data.products = [];
    if (!data.categories) data.categories = [];
    if (!data.settings) data.settings = initialSettings;
    if (!data.admins) {
      const emptyStore = await createEmptyStore();
      data.admins = emptyStore.admins;
    }
    return data as unknown as StoreData;
  } catch (err) {
    console.error("Error reading store from MongoDB:", err);
    return null;
  }
}

async function persistStoreToDb(data: StoreData): Promise<void> {
  if (!mongoDb) return;
  try {
    await mongoDb.collection(MONGO_COLLECTION).replaceOne(
      { _id: "main" } as any,
      { _id: "main", ...data, updatedAt: new Date().toISOString() } as any,
      { upsert: true }
    );
  } catch (err) {
    console.error("Error writing store to MongoDB:", err);
  }
}

// Store always comes from MongoDB (the local JSON file is only read once as a
// seed on first run, then MongoDB is authoritative).
async function refreshStore(): Promise<StoreData> {
  const fromDb = await loadStoreFromDb();
  if (fromDb) store = fromDb;
  return store;
}

async function saveData(data: StoreData) {
  storeRevision += 1;
  await persistStoreToDb(data);
}

async function initStore(): Promise<StoreData> {
  await connectMongo();
  if (!mongoDb) {
    throw new Error(
      mongoConnectError || "MongoDB is required but not configured. Set DATABASE_URL."
    );
  }
  const fromDb = await loadStoreFromDb();
  if (fromDb) {
    store = fromDb;
    // Ensure admins array exists for backward compatibility
    if (!store.admins) {
      store.admins = await (await createEmptyStore()).admins;
      await saveData(store);
    }
    return store;
  }
  store = await createEmptyStore();
  await saveData(store);
  return store;
}

// Multer configuration for image uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
    }
  },
});

// Serve uploaded images statically
app.use("/uploads", express.static(uploadDir));

// Helper to calculate next order number (based on highest existing, never re-uses)
function generateOrderNumber(): string {
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

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", name: "Perfect For You API" });
});

// Sync revision — increments on every store write so clients can detect changes
// without re-downloading the full store each poll.
app.get("/api/revision", (_req, res) => {
  res.json({ revision: storeRevision });
});

// Settings
app.get("/api/settings", async (_req, res) => {
  await refreshStore();
  res.json({ settings: store.settings });
});

app.put("/api/settings", requireAdmin, auditAdminAction("settings_update"), async (req, res) => {
  store.settings = { ...store.settings, ...req.body };
  await saveData(store);
  res.json({ success: true, settings: store.settings });
});

// Categories
app.get("/api/categories", async (_req, res) => {
  await refreshStore();
  // compute current item counts
  const categoriesWithCounts = store.categories.map((cat) => {
    const count = store.products.filter(
      (p) => p.category_id === cat.id && p.is_active
    ).length;
    return { ...cat, item_count: count };
  });
  res.json({ categories: categoriesWithCounts });
});

app.post("/api/categories", requireAdmin, auditAdminAction("category_create"), async (req, res) => {
  const { name, description, image, is_active } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    description: description || "",
    image: image || "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
    is_active: is_active !== false,
  };
  store.categories.push(newCat);
  await saveData(store);
  res.status(201).json({ success: true, category: newCat });
});

app.put("/api/categories/:id", requireAdmin, auditAdminAction("category_update"), async (req, res) => {
  const index = store.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Category not found" });

  store.categories[index] = { ...store.categories[index], ...req.body };
  // Keep product category_name in sync when a category is renamed
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

app.delete("/api/categories/:id", requireAdmin, auditAdminAction("category_delete"), async (req, res) => {
  const index = store.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Category not found" });

  // Check if category has products
  const hasProducts = store.products.some((p) => p.category_id === req.params.id);
  if (hasProducts) {
    return res.status(400).json({ error: "Cannot delete category with products. Move or delete products first." });
  }

  store.categories.splice(index, 1);
  await saveData(store);
  res.json({ success: true });
});

// Tips / Usage Guides
app.get("/api/tips", async (_req, res) => {
  await refreshStore();
  const activeTips = store.tips.filter((t) => t.is_active);
  activeTips.sort((a, b) => a.display_order - b.display_order);
  res.json({ tips: activeTips });
});

app.get("/api/tips/all", requireAdmin, async (_req, res) => {
  await refreshStore();
  const allTips = [...store.tips].sort((a, b) => a.display_order - b.display_order);
  res.json({ tips: allTips });
});

app.post("/api/tips", requireAdmin, auditAdminAction("tip_create"), async (req, res) => {
  const { title, description, image, product_id, category_id, is_active, display_order } = req.body;
  if (!title || !image) {
    return res.status(400).json({ error: "Title and image are required" });
  }

  let product_name: string | undefined;
  if (product_id) {
    const product = store.products.find((p) => p.id === product_id);
    if (product) product_name = product.name;
  }

  let category_name: string | undefined;
  if (category_id) {
    const category = store.categories.find((c) => c.id === category_id);
    if (category) category_name = category.name;
  }

  const newTip: ProductTip = {
    id: `tip-${Date.now()}`,
    title,
    description: description || "",
    image,
    product_id,
    product_name,
    category_id,
    category_name,
    is_active: is_active !== false,
    display_order: display_order ?? store.tips.length,
    created_at: new Date().toISOString(),
  };

  store.tips.push(newTip);
  await saveData(store);
  res.status(201).json({ success: true, tip: newTip });
});

app.put("/api/tips/:id", requireAdmin, auditAdminAction("tip_update"), async (req, res) => {
  const index = store.tips.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Tip not found" });

  const updates = req.body;
  if (updates.product_id) {
    const product = store.products.find((p) => p.id === updates.product_id);
    if (product) updates.product_name = product.name;
  }
  if (updates.category_id) {
    const category = store.categories.find((c) => c.id === updates.category_id);
    if (category) updates.category_name = category.name;
  }

  store.tips[index] = { ...store.tips[index], ...updates, updated_at: new Date().toISOString() };
  await saveData(store);
  res.json({ success: true, tip: store.tips[index] });
});

app.delete("/api/tips/:id", requireAdmin, auditAdminAction("tip_delete"), async (req, res) => {
  const index = store.tips.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Tip not found" });

  store.tips.splice(index, 1);
  await saveData(store);
  res.json({ success: true });
});

// Products
app.get("/api/products", async (req, res) => {
  await refreshStore();
  const { category, search, featured, active_only, sort, is_set } = req.query;
  let list = [...store.products];

  // Active filter (default to active only for storefront unless active_only=false)
  if (active_only !== "false") {
    list = list.filter((p) => p.is_active);
  }

  // Category filter
  if (category && typeof category === "string" && category !== "all") {
    list = list.filter(
      (p) =>
        p.category_id === category ||
        p.slug.includes(category) ||
        p.category_name?.toLowerCase() === category.toLowerCase()
    );
  }

  // Featured filter
  if (featured === "true") {
    list = list.filter((p) => p.is_featured);
  }

  // Set filter
  if (is_set === "true") {
    list = list.filter((p) => p.is_set);
  } else if (is_set === "false") {
    list = list.filter((p) => !p.is_set);
  }

  // Search filter
  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === "newest") {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    // Featured / default
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

app.post("/api/products", requireAdmin, auditAdminAction("product_create"), async (req, res) => {
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
    is_set,
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  const category = store.categories.find((c) => c.id === category_id);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + `-${Date.now().toString().slice(-4)}`;

  const newProd: Product = {
    id: `prod-${Date.now()}`,
    name,
    slug,
    category_id: category_id || "cat-hair",
    category_name: category ? category.name : "Beauty",
    description: description || "",
    price: Number(price),
    discount_price: discount_price ? Number(discount_price) : undefined,
    stock: Number(stock ?? 10),
    sku: sku || `PFY-${Math.floor(1000 + Math.random() * 9000)}`,
    images: images && images.length > 0 ? images : [],
    sizes: sizes || [],
    benefits: Array.isArray(benefits) ? benefits : benefits ? [benefits] : [],
    ingredients: ingredients || "",
    how_to_use: how_to_use || "",
    is_featured: !!is_featured,
    is_active: is_active !== false,
    is_set: !!is_set,
    rating: 5.0,
    reviews_count: 0,
    created_at: new Date().toISOString(),
  };

  store.products.unshift(newProd);
  await saveData(store);
  res.status(201).json({ success: true, product: newProd });
});

app.put("/api/products/:id", requireAdmin, auditAdminAction("product_update"), async (req, res) => {
  const index = store.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const existing = store.products[index];
  const updated = {
    ...existing,
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
    discount_price: req.body.discount_price !== undefined ? (req.body.discount_price ? Number(req.body.discount_price) : undefined) : existing.discount_price,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : existing.stock,
    updated_at: new Date().toISOString(),
  };

  if (req.body.category_id) {
    const cat = store.categories.find((c) => c.id === req.body.category_id);
    if (cat) updated.category_name = cat.name;
  }

  store.products[index] = updated;
  await saveData(store);
  res.json({ success: true, product: updated });
});

app.delete("/api/products/:id", requireAdmin, auditAdminAction("product_delete"), async (req, res) => {
  const index = store.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const [removed] = store.products.splice(index, 1);
  store.reviews = store.reviews.filter((r) => r.product_id !== removed.id);
  await saveData(store);
  res.json({ success: true, message: "Product deleted", product: removed });
});

// Orders & Checkout
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
    payment_method = "paystack",
  } = req.body;

  if (!customer_name || !phone || !items || items.length === 0) {
    return res.status(400).json({ error: "Please fill in all customer details and at least one item." });
  }

  // Validate stock availability first, then calculate subtotal and deduct inventory
  let subtotal = 0;
  const oversold: string[] = [];
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
      error: `Insufficient stock: ${oversold.join("; ")}. Please reduce the quantity.`,
    });
  }

  for (const item of items) {
    const prod = store.products.find((p) => p.id === item.product_id);
    if (prod) {
      // Deduct inventory automatically per PRD requirement #27
      prod.stock = Math.max(0, prod.stock - (item.quantity || 1));
    }
  }

  const orderNum = generateOrderNumber();
  const newOrder: Order = {
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
    created_at: new Date().toISOString(),
    delivery_contact_status: "Not Contacted",
    delivery_note: "",
  };

  store.orders.unshift(newOrder);
  await saveData(store);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: "Order placed successfully",
  });
});

// Admin orders listing (protected: contains customer PII)
app.get("/api/orders", requireAdmin, async (req, res) => {
  await refreshStore();
  const { status, search } = req.query;
  let list = [...store.orders];

  if (status && status !== "All") {
    list = list.filter((o) => o.order_status.toLowerCase() === (status as string).toLowerCase());
  }

  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.email.toLowerCase().includes(q)
    );
  }

  res.json({ orders: list, total: list.length });
});

app.put("/api/orders/:id/status", requireAdmin, auditAdminAction("order_status_update"), async (req, res) => {
  const { status, order_status, delivery_contact_status, delivery_note } = req.body;
  const order = store.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const nextStatus = status || order_status;
  if (nextStatus) order.order_status = nextStatus;
  if (delivery_contact_status) order.delivery_contact_status = delivery_contact_status;
  if (delivery_note !== undefined) order.delivery_note = delivery_note;
  order.updated_at = new Date().toISOString();
  await saveData(store);
  res.json({ success: true, order });
});

// Paystack public key (safe to expose) used by the browser checkout popup.
app.get("/api/paystack/public-key", (_req, res) => {
  const publicKey =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
    process.env.PAYSTACK_PUBLIC_KEY ||
    "";
  res.json({ publicKey });
});

// Verify a Paystack transaction with the secret key before creating an order.
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
        message: data?.message || "Transaction was not successful",
      });
    }

    // Paystack returns the amount in the smallest unit (pesewas for GHS).
    if (amount != null && Math.round(Number(amount) * 100) !== tx.amount) {
      return res.json({
        verified: false,
        reference,
        status: "amount_mismatch",
        message: "Paid amount does not match the order total",
      });
    }

    return res.json({
      status: "success",
      verified: true,
      reference,
      amount: tx.amount,
      currency: tx.currency,
      gateway_response: tx.gateway_response,
      message: "Transaction verified by Paystack",
    });
  } catch (err) {
    console.error("Paystack verification error:", err);
    return res.status(502).json({ verified: false, error: "Could not reach payment gateway" });
  }
});

// --- Admin auth ------------------------------------------------------------
// In-memory session tokens. Tokens are per-process, so a server restart or
// Vercel cold start simply asks the admin to sign in again.
const adminTokens = new Set<string>();

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  
  // Check legacy in-memory token first (backward compatibility)
  if (token && adminTokens.has(token)) return next();
  
  // Check JWT access token
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
      if (decoded.role === "admin") {
        (req as any).admin = decoded;
        return next();
      }
    } catch (err) {
      // Token invalid or expired
    }
  }
  
  return res.status(401).json({ error: "Unauthorized: admin sign-in required." });
}

// Audit logging middleware for admin actions
function auditAdminAction(action: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const originalSend = res.send;
    res.send = function (body?: any): express.Response {
      const admin = (req as any).admin;
      const success = res.statusCode >= 200 && res.statusCode < 400;
      writeAuditLog({
        type: "admin_action",
        action,
        userId: admin?.sub,
        email: admin?.email,
        ip: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        details: {
          method: req.method,
          path: req.path,
          body: req.method !== "GET" ? req.body : undefined,
          params: req.params,
          query: req.query,
        },
        success,
      });
      return originalSend.call(this, body);
    };
    next();
  };
}

// Admin Auth - uses bcrypt to verify against stored hashed passwords in MongoDB
// Returns JWT access token + refresh token (httpOnly cookie)
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userAgent = req.headers["user-agent"] || "";

  if (!email || !password) {
    writeAuditLog({ type: "auth", action: "login_failed", ip, userAgent, details: { reason: "Missing credentials" }, success: false });
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Check IP lockout
  if (isIpLocked(ip)) {
    writeAuditLog({ type: "security", action: "login_blocked", ip, userAgent, details: { reason: "IP temporarily locked" }, success: false });
    return res.status(429).json({ error: "Too many failed attempts. Please try again later." });
  }

  await refreshStore();
  const admin = store.admins?.find((a: any) => a.email === email);
  if (!admin || !admin.passwordHash) {
    recordFailedLogin(ip, email);
    writeAuditLog({ type: "auth", action: "login_failed", email, ip, userAgent, details: { reason: "Invalid email" }, success: false });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    recordFailedLogin(ip, email);
    writeAuditLog({ type: "auth", action: "login_failed", email, ip, userAgent, details: { reason: "Invalid password" }, success: false });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Success - clear failed attempts
  clearFailedLogins(ip);

  // Generate JWT tokens
  const accessToken = jwt.sign(
    { sub: admin.id, email: admin.email, role: "admin" },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { sub: admin.id, type: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Store refresh token hash in admin record for revocation
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  admin.refreshTokenHash = refreshTokenHash;
  admin.lastLogin = new Date().toISOString();
  await saveData(store);

  // Set refresh token as httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/admin/refresh",
  });

  writeAuditLog({ type: "auth", action: "login_success", userId: admin.id, email: admin.email, ip, userAgent, details: {}, success: true });

  return res.json({
    success: true,
    accessToken,
    user: {
      name: admin.name || "Store Administrator",
      email: admin.email,
      role: "admin",
    },
  });
});

// Refresh access token using refresh token cookie
app.post("/api/admin/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { sub: string; type: string };
    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    await refreshStore();
    const admin = store.admins?.find((a: any) => a.id === decoded.sub);
    if (!admin || !admin.refreshTokenHash) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    if (admin.refreshTokenHash !== refreshTokenHash) {
      writeAuditLog({ type: "security", action: "refresh_token_reuse_detected", userId: admin.id, ip: req.ip || "", userAgent: req.headers["user-agent"] || "", details: {}, success: false });
      // Revoke all tokens for this user
      admin.refreshTokenHash = undefined;
      await saveData(store);
      return res.status(401).json({ error: "Token revoked" });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { sub: admin.id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    return res.json({ success: true, accessToken });
  } catch (err) {
    writeAuditLog({ type: "auth", action: "refresh_failed", ip: req.ip || "", userAgent: req.headers["user-agent"] || "", details: { error: String(err) }, success: false });
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

// Admin change password
app.post("/api/admin/change-password", requireAdmin, auditAdminAction("password_change"), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = (req as any).admin;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required" });
  }
  
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  
  await refreshStore();
  const adminUser = store.admins?.find((a: any) => a.id === admin.sub);
  
  if (!adminUser || !adminUser.passwordHash) {
    return res.status(404).json({ error: "Admin user not found" });
  }
  
  const valid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
  if (!valid) {
    writeAuditLog({
      type: "auth",
      action: "password_change_failed",
      userId: admin.sub,
      email: admin.email,
      ip: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
      details: { reason: "Invalid current password" },
      success: false,
    });
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  
  const newPasswordHash = await bcrypt.hash(newPassword, 12);
  adminUser.passwordHash = newPasswordHash;
  
  // Invalidate all refresh tokens for this admin (force re-login on other devices)
  adminUser.refreshTokenHash = undefined;
  
  await saveData(store);
  
  writeAuditLog({
    type: "auth",
    action: "password_changed",
    userId: admin.sub,
    email: admin.email,
    ip: req.ip || "",
    userAgent: req.headers["user-agent"] || "",
    details: {},
    success: true,
  });
  
  return res.json({ success: true, message: "Password changed successfully. Please log in again." });
});

// Admin logout - revokes refresh token
app.post("/api/admin/logout", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const auth = req.headers.authorization || "";
  const accessToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  // Try to identify admin from access token for audit log
  let adminId: string | undefined;
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as { sub: string };
      adminId = decoded.sub;
    } catch {}
  }

  if (refreshToken) {
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await refreshStore();
    const admin = store.admins?.find((a: any) => a.refreshTokenHash === refreshTokenHash);
    if (admin) {
      admin.refreshTokenHash = undefined;
      await saveData(store);
    }
  }

  // Clear refresh token cookie
  res.clearCookie("refreshToken", { path: "/api/admin/refresh" });

  // Also remove from legacy in-memory tokens
  if (accessToken) {
    adminTokens.delete(accessToken);
  }

  if (adminId) {
    writeAuditLog({ type: "auth", action: "logout", userId: adminId, ip: req.ip || "", userAgent: req.headers["user-agent"] || "", details: {}, success: true });
  }

  return res.json({ success: true });
});

// Admin Stats
app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
  await refreshStore();
  const totalSales = store.orders.reduce((sum, o) => (o.payment_status === "paid" ? sum + o.total : sum), 0);
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
    lowStockProducts: store.products.filter((p) => p.is_active && p.stock <= 7),
  });
});

// Audit Logs (admin only)
app.get("/api/admin/audit-logs", requireAdmin, async (req, res) => {
  const { type, limit = 100, offset = 0 } = req.query;
  let logs = [...auditLogs].reverse(); // newest first
  
  if (type) {
    logs = logs.filter((l) => l.type === type);
  }
  
  const start = Number(offset);
  const end = start + Number(limit);
  const paginated = logs.slice(start, end);
  
  res.json({
    logs: paginated,
    total: logs.length,
    offset: start,
    limit: Number(limit),
  });
});

// Failed login attempts (for monitoring)
app.get("/api/admin/failed-logins", requireAdmin, (_req, res) => {
  const now = Date.now();
  const locked = Array.from(failedLogins.entries())
    .filter(([, v]) => v.lockedUntil && v.lockedUntil > now)
    .map(([ip, v]) => ({ ip, ...v }));
  
  res.json({ lockedIps: locked, totalTracked: failedLogins.size });
});

// Image Upload Endpoint
app.post("/api/upload/image", requireAdmin, auditAdminAction("image_upload"), upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl, filename: req.file.filename });
});

// Reviews
app.get("/api/reviews", async (_req, res) => {
  await refreshStore();
  res.json({ reviews: store.reviews });
});

// Customer review submission (admin adds on behalf of customer) - recomputes the product's live rating
app.post("/api/reviews", requireAdmin, auditAdminAction("review_create"), async (req, res) => {
  const { product_id, author, location, rating, comment, verified_purchase } = req.body;
  if (!product_id || !author || !rating) {
    return res.status(400).json({ error: "Product, author name and rating are required" });
  }
  const product = store.products.find((p) => p.id === product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const newReview: CustomerReview = {
    id: `rev-${Date.now()}`,
    product_id,
    product_name: product.name,
    author: String(author).slice(0, 80),
    location: location || "Ghana",
    rating: Math.max(1, Math.min(5, Number(rating))),
    comment: String(comment || "").slice(0, 1000),
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    verified_purchase: !!verified_purchase,
  };

  store.reviews.unshift(newReview);

  // Recompute the product's aggregate rating from its reviews
  const productReviews = store.reviews.filter((r) => r.product_id === product_id);
  const avg = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
  product.rating = Math.round(avg * 10) / 10;
  product.reviews_count = productReviews.length;

  await saveData(store);
  res.status(201).json({
    success: true,
    review: newReview,
    rating: product.rating,
    reviews_count: product.reviews_count,
  });
});

// Review moderation (admin): delete a review and recompute product rating
app.delete("/api/reviews/:id", requireAdmin, auditAdminAction("review_delete"), async (req, res) => {
  await refreshStore();
  const idx = store.reviews.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Review not found" });

  const removed = store.reviews[idx];
  store.reviews.splice(idx, 1);

  const product = store.products.find((p) => p.id === removed.product_id);
  if (product) {
    const productReviews = store.reviews.filter((r) => r.product_id === product.id);
    const avg =
      productReviews.length > 0
        ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
        : 5;
    product.rating = Math.round(avg * 10) / 10;
    product.reviews_count = productReviews.length;
  }

  await saveData(store);
  res.json({ success: true });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVER (local dev / self-hosted only)
// -------------------------------------------------------------
async function start() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    !fs.existsSync(path.join(process.cwd(), "vite.config.ts"));

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Perfect For You server running on port ${PORT}`);
  });
}

// When running directly (local dev / self-hosted), start the full server.
// On Vercel, this module is only used for its exported `app` handler
// (see api/handler.ts); Vercel's serverless runtime invokes the handler, so we
// must NOT call app.listen in that context.
if (!process.env.VERCEL) {
  initStore().then(start).catch((err) => {
    console.error("Failed to initialize store (MongoDB required):", err);
    process.exit(1);
  });
}

export default app;
export { initStore };
