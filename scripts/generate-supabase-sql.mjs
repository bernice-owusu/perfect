import fs from "fs";
import path from "path";

const store = JSON.parse(
  fs.readFileSync(path.resolve("data/store.json"), "utf-8")
);

const sqlEsc = (v) => {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/'/g, "''") + "'";
};

const jsonb = (v) => {
  if (v === null || v === undefined) return "NULL";
  return "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb";
};

const num = (v) => (v === null || v === undefined ? "NULL" : Number(v));
const bool = (v) => (v === null || v === undefined ? "NULL" : v ? "true" : "false");

const lines = [];

lines.push(`-- Perfect For You - Supabase schema (generated from data/store.json)`);
lines.push(``);
lines.push(`-- Drop existing (dev only - comment out for first run if you prefer)`);
lines.push(`DROP TABLE IF EXISTS public.reviews;`);
lines.push(`DROP TABLE IF EXISTS public.orders;`);
lines.push(`DROP TABLE IF EXISTS public.settings;`);
lines.push(`DROP TABLE IF EXISTS public.products;`);
lines.push(`DROP TABLE IF EXISTS public.categories;`);
lines.push(``);
lines.push(`-- "special" for ~0.80 GH₵ decimal prices: use NUMERIC`);
lines.push(``);
lines.push(`CREATE TABLE public.categories (`);
lines.push(`  id TEXT PRIMARY KEY,`);
lines.push(`  name TEXT NOT NULL,`);
lines.push(`  slug TEXT NOT NULL,`);
lines.push(`  description TEXT,`);
lines.push(`  image TEXT,`);
lines.push(`  is_active BOOLEAN NOT NULL DEFAULT true,`);
lines.push(`  item_count INTEGER NOT NULL DEFAULT 0`);
lines.push(`);`);
lines.push(``);
lines.push(`CREATE TABLE public.products (`);
lines.push(`  id TEXT PRIMARY KEY,`);
lines.push(`  name TEXT NOT NULL,`);
lines.push(`  slug TEXT NOT NULL,`);
lines.push(`  category_id TEXT REFERENCES public.categories(id),`);
lines.push(`  category_name TEXT,`);
lines.push(`  description TEXT NOT NULL DEFAULT '',`);
lines.push(`  price NUMERIC NOT NULL,`);
lines.push(`  discount_price NUMERIC,`);
lines.push(`  stock INTEGER NOT NULL DEFAULT 0,`);
lines.push(`  sku TEXT,`);
lines.push(`  images JSONB NOT NULL DEFAULT '[]'::jsonb,`);
lines.push(`  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,`);
lines.push(`  variants JSONB NOT NULL DEFAULT '[]'::jsonb,`);
lines.push(`  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,`);
lines.push(`  ingredients TEXT,`);
lines.push(`  how_to_use TEXT,`);
lines.push(`  is_featured BOOLEAN NOT NULL DEFAULT false,`);
lines.push(`  is_active BOOLEAN NOT NULL DEFAULT true,`);
lines.push(`  rating NUMERIC,`);
lines.push(`  reviews_count INTEGER NOT NULL DEFAULT 0,`);
lines.push(`  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),`);
lines.push(`  updated_at TIMESTAMPTZ`);
lines.push(`);`);
lines.push(`CREATE INDEX idx_products_category ON public.products(category_id);`);
lines.push(`CREATE INDEX idx_products_active ON public.products(is_active);`);
lines.push(``);
lines.push(`CREATE TABLE public.orders (`);
lines.push(`  id TEXT PRIMARY KEY,`);
lines.push(`  order_number TEXT NOT NULL,`);
lines.push(`  customer_name TEXT NOT NULL,`);
lines.push(`  email TEXT NOT NULL,`);
lines.push(`  phone TEXT NOT NULL,`);
lines.push(`  region TEXT,`);
lines.push(`  city TEXT,`);
lines.push(`  address TEXT NOT NULL,`);
lines.push(`  delivery_instructions TEXT,`);
lines.push(`  items JSONB NOT NULL DEFAULT '[]'::jsonb,`);
lines.push(`  subtotal NUMERIC NOT NULL DEFAULT 0,`);
lines.push(`  delivery_fee NUMERIC NOT NULL DEFAULT 0,`);
lines.push(`  total NUMERIC NOT NULL DEFAULT 0,`);
lines.push(`  payment_status TEXT NOT NULL DEFAULT 'pending',`);
lines.push(`  order_status TEXT NOT NULL DEFAULT 'Pending',`);
lines.push(`  payment_method TEXT NOT NULL DEFAULT 'paystack',`);
lines.push(`  paystack_reference TEXT,`);
lines.push(`  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),`);
lines.push(`  updated_at TIMESTAMPTZ`);
lines.push(`);`);
lines.push(`CREATE INDEX idx_orders_number ON public.orders(order_number);`);
lines.push(``);
lines.push(`CREATE TABLE public.settings (`);
lines.push(`  id TEXT PRIMARY KEY,`);
lines.push(`  data JSONB NOT NULL`);
lines.push(`);`);
lines.push(``);
lines.push(`CREATE TABLE public.reviews (`);
lines.push(`  id TEXT PRIMARY KEY,`);
lines.push(`  product_id TEXT REFERENCES public.products(id),`);
lines.push(`  product_name TEXT,`);
lines.push(`  author TEXT NOT NULL,`);
lines.push(`  location TEXT,`);
lines.push(`  rating NUMERIC NOT NULL DEFAULT 5,`);
lines.push(`  comment TEXT NOT NULL DEFAULT '',`);
lines.push(`  date TEXT,`);
lines.push(`  verified_purchase BOOLEAN NOT NULL DEFAULT false`);
lines.push(`);`);
lines.push(``);
lines.push(`-- Leave RLS disabled: the backend uses the service-role key (bypasses RLS),`);
lines.push(`-- and the public never talks to Supabase directly (all traffic goes through our API).`);
lines.push(``);
lines.push(`-- Seed: categories`);
lines.push(`INSERT INTO public.categories (id, name, slug, description, image, is_active, item_count) VALUES`);
store.categories.forEach((c, i) => {
  const comma = i === store.categories.length - 1 ? ";" : ",";
  lines.push(
    `  (${sqlEsc(c.id)}, ${sqlEsc(c.name)}, ${sqlEsc(c.slug)}, ${sqlEsc(
      c.description
    )}, ${sqlEsc(c.image)}, ${bool(c.is_active)}, ${num(c.item_count ?? 0)})${comma}`
  );
});
lines.push(``);
lines.push(`-- Seed: products`);
store.products.forEach((p) => {
  lines.push(`INSERT INTO public.products (`);
  lines.push(`  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at`);
  lines.push(`) VALUES (`);
  lines.push(`  ${sqlEsc(p.id)},`);
  lines.push(`  ${sqlEsc(p.name)},`);
  lines.push(`  ${sqlEsc(p.slug)},`);
  lines.push(`  ${sqlEsc(p.category_id)},`);
  lines.push(`  ${sqlEsc(p.category_name)},`);
  lines.push(`  ${sqlEsc(p.description)},`);
  lines.push(`  ${num(p.price)},`);
  lines.push(`  ${num(p.discount_price)},`);
  lines.push(`  ${num(p.stock)},`);
  lines.push(`  ${sqlEsc(p.sku)},`);
  lines.push(`  ${jsonb(p.images ?? [])},`);
  lines.push(`  ${jsonb(p.sizes ?? [])},`);
  lines.push(`  ${jsonb(p.variants ?? [])},`);
  lines.push(`  ${jsonb(p.benefits ?? [])},`);
  lines.push(`  ${sqlEsc(p.ingredients)},`);
  lines.push(`  ${sqlEsc(p.how_to_use)},`);
  lines.push(`  ${bool(p.is_featured)},`);
  lines.push(`  ${bool(p.is_active)},`);
  lines.push(`  ${num(p.rating)},`);
  lines.push(`  ${num(p.reviews_count)},`);
  lines.push(`  ${sqlEsc(p.created_at)},`);
  lines.push(`  ${sqlEsc(p.updated_at)}`);
  lines.push(`);`);
  lines.push(``);
});
lines.push(`-- Seed: orders`);
store.orders.forEach((o) => {
  lines.push(`INSERT INTO public.orders (`);
  lines.push(`  id, order_number, customer_name, email, phone, region, city, address, delivery_instructions, items, subtotal, delivery_fee, total, payment_status, order_status, payment_method, paystack_reference, created_at, updated_at`);
  lines.push(`) VALUES (`);
  lines.push(`  ${sqlEsc(o.id)},`);
  lines.push(`  ${sqlEsc(o.order_number)},`);
  lines.push(`  ${sqlEsc(o.customer_name)},`);
  lines.push(`  ${sqlEsc(o.email)},`);
  lines.push(`  ${sqlEsc(o.phone)},`);
  lines.push(`  ${sqlEsc(o.region)},`);
  lines.push(`  ${sqlEsc(o.city)},`);
  lines.push(`  ${sqlEsc(o.address)},`);
  lines.push(`  ${sqlEsc(o.delivery_instructions)},`);
  lines.push(`  ${jsonb(o.items ?? [])},`);
  lines.push(`  ${num(o.subtotal)},`);
  lines.push(`  ${num(o.delivery_fee)},`);
  lines.push(`  ${num(o.total)},`);
  lines.push(`  ${sqlEsc(o.payment_status)},`);
  lines.push(`  ${sqlEsc(o.order_status)},`);
  lines.push(`  ${sqlEsc(o.payment_method)},`);
  lines.push(`  ${sqlEsc(o.paystack_reference)},`);
  lines.push(`  ${sqlEsc(o.created_at)},`);
  lines.push(`  ${sqlEsc(o.updated_at)}`);
  lines.push(`);`);
  lines.push(``);
});
lines.push(`-- Seed: settings (single row)`);
const s = store.settings;
lines.push(`INSERT INTO public.settings (id, data) VALUES ('default', ${jsonb(s)});`);
// Strip problematic keys (free_delivery_threshold etc are already in data via jsonb) - it's all in data, correct.
lines.push(``);
lines.push(`-- Seed: reviews`);
lines.push(`INSERT INTO public.reviews (id, product_id, product_name, author, location, rating, comment, date, verified_purchase) VALUES`);
store.reviews.forEach((r, i) => {
  const comma = i === store.reviews.length - 1 ? ";" : ",";
  lines.push(
    `  (${sqlEsc(r.id)}, ${sqlEsc(r.product_id)}, ${sqlEsc(
      r.product_name
    )}, ${sqlEsc(r.author)}, ${sqlEsc(r.location)}, ${num(r.rating)}, ${sqlEsc(
      r.comment
    )}, ${sqlEsc(r.date)}, ${bool(r.verified_purchase)})${comma}`
  );
});
lines.push(``);

fs.writeFileSync(path.resolve("supabase/schema.sql"), lines.join("\n"), "utf-8");
console.log("Generated supabase/schema.sql");