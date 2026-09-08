import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { StoreSettings } from "./src/types.ts";

export interface StoreData {
  products: any[];
  categories: any[];
  orders: any[];
  settings: any;
  reviews: any[];
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)");
    }
    client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}

// Postgres returns NUMERIC columns as strings (e.g. "0.80") and JSONB as objects.
// Coerce prices/ratings/stock back to numbers so the API shape matches the old store.
function coerceProduct(p: any): any {
  return {
    ...p,
    price: Number(p.price),
    discount_price: p.discount_price === null || p.discount_price === undefined ? undefined : Number(p.discount_price),
    stock: Number(p.stock),
    rating: p.rating === null || p.rating === undefined ? undefined : Number(p.rating),
    reviews_count: Number(p.reviews_count ?? 0),
  };
}

function coerceOrder(o: any): any {
  return {
    ...o,
    subtotal: Number(o.subtotal),
    delivery_fee: Number(o.delivery_fee),
    total: Number(o.total),
  };
}

export async function loadAllFromSupabase(): Promise<StoreData> {
  const sb = getClient();

  const [categoriesRes, productsRes, ordersRes, settingsRes, reviewsRes] = await Promise.all([
    sb.from("categories").select("*").order("name"),
    sb.from("products").select("*"),
    sb.from("orders").select("*"),
    sb.from("settings").select("data").eq("id", "default").maybeSingle(),
    sb.from("reviews").select("*"),
  ]);

  for (const res of [categoriesRes, productsRes, ordersRes, settingsRes, reviewsRes]) {
    if (res.error) {
      throw new Error(`Supabase load error: ${res.error.message}`);
    }
  }

  const products = (productsRes.data ?? []).map(coerceProduct);
  const orders = (ordersRes.data ?? []).map(coerceOrder);

  const settings: StoreSettings = settingsRes.data?.data || null;

  return {
    products,
    categories: categoriesRes.data ?? [],
    orders,
    settings,
    reviews: reviewsRes.data ?? [],
  };
}

export async function saveAllToSupabase(data: StoreData): Promise<void> {
  const sb = getClient();

  // Upsert each collection. Empty arrays skip (DELETE/INSERT cycles handled per-collection).
  if (data.products.length) {
    const { error } = await sb.from("products").upsert(data.products, { onConflict: "id" });
    if (error) throw new Error(`Supabase products save error: ${error.message}`);
  }
  if (data.categories.length) {
    const { error } = await sb.from("categories").upsert(data.categories, { onConflict: "id" });
    if (error) throw new Error(`Supabase categories save error: ${error.message}`);
  }
  if (data.orders.length) {
    const { error } = await sb.from("orders").upsert(data.orders, { onConflict: "id" });
    if (error) throw new Error(`Supabase orders save error: ${error.message}`);
  }
  if (data.settings) {
    const { error } = await sb.from("settings").upsert({ id: "default", data: data.settings }, { onConflict: "id" });
    if (error) throw new Error(`Supabase settings save error: ${error.message}`);
  }
  if (data.reviews.length) {
    const { error } = await sb.from("reviews").upsert(data.reviews, { onConflict: "id" });
    if (error) throw new Error(`Supabase reviews save error: ${error.message}`);
  }
}