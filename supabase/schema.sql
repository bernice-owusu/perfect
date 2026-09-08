-- Perfect For You - Supabase schema (generated from data/store.json)

-- Drop existing (dev only - comment out for first run if you prefer)
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.categories;

-- "special" for ~0.80 GH₵ decimal prices: use NUMERIC

CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  item_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id),
  category_name TEXT,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredients TEXT,
  how_to_use TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);

CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT,
  city TEXT,
  address TEXT NOT NULL,
  delivery_instructions TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'Pending',
  payment_method TEXT NOT NULL DEFAULT 'paystack',
  paystack_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);
CREATE INDEX idx_orders_number ON public.orders(order_number);

CREATE TABLE public.settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id),
  product_name TEXT,
  author TEXT NOT NULL,
  location TEXT,
  rating NUMERIC NOT NULL DEFAULT 5,
  comment TEXT NOT NULL DEFAULT '',
  date TEXT,
  verified_purchase BOOLEAN NOT NULL DEFAULT false
);

-- Leave RLS disabled: the backend uses the service-role key (bypasses RLS),
-- and the public never talks to Supabase directly (all traffic goes through our API).

-- Seed: categories
INSERT INTO public.categories (id, name, slug, description, image, is_active, item_count) VALUES
  ('cat-hair', 'Hair', 'hair', 'Hair care, nourishing oils, herbal masks, butters and hair sets.', '/images/pfy_model_duo.jpg', true, 10),
  ('cat-skincare', 'Skincare', 'skincare', 'Botanical products for everyday glow, hydration and skin barrier care.', '/images/pfy_black_soap.jpg', true, 4),
  ('cat-slippers', 'Slippers', 'slippers', 'Comfortable and effortlessly stylish everyday footwear and slides.', 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80', true, 3),
  ('cat-bags', 'Bags', 'bags', 'Handcrafted tote bags, clutches and crossbodies for everyday style.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', true, 3);

-- Seed: products
INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-pfy-black-soap',
  'PERFECT FOR YOU Black Soap',
  'perfect-for-you-black-soap',
  'cat-skincare',
  'Skincare',
  'Authentic Ghanaian Black Soap handcrafted with plantain skin ash, cocoa pod ash, wild forest honey, virgin coconut oil, and pure unrefined Northern shea butter. Slogan: "Healthy hair, happy skin". Gently clarifies skin pores and congested scalps, clears breakouts and razor bumps, and balances natural hydration without stripping.',
  0.5,
  NULL,
  25,
  'PFY-SOAP-250',
  '["/images/pfy_black_soap.jpg","https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["250g Standard Tub","500g Value Tub"]'::jsonb,
  '[]'::jsonb,
  '["Healthy hair, happy skin multipurpose cleanser","Clears blemishes, acne & hyperpigmentation gently","Enriched with raw forest honey & northern shea butter","Clarifying detox wash for face, body, and scalp"]'::jsonb,
  'Plantain Skin Ash, Cocoa Pod Ash, Raw Northern Ghana Shea Butter, Virgin Coconut Oil, Wild Forest Honey, Palm Kernel Oil, Purified Water.',
  'Lather a small pinch between damp palms or a bath sponge. Gently massage onto face, body, or damp scalp, then rinse thoroughly. Follow with Hair Butter or Glow Oil to seal in hydration.',
  true,
  true,
  5,
  51,
  '2026-09-08T08:02:21.640Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-oil-big',
  'PERFECT FOR YOU Nourishing Hair Growth Oil (250ml)',
  'hair-oil-big',
  'cat-hair',
  'Hair',
  'Our signature scalp food & sealant in a precision applicator bottle with black twist nozzle. Infused with rosemary, chebe, amla, fenugreek, and cold-pressed castor oil. As our brand teaches: Oil is NOT hydration and NOT a moisturizer. Oil is a sealant + scalp food to stimulate follicles, boost circulation, and seal hair ends (use 2-3x weekly, not daily).',
  0.8,
  NULL,
  18,
  'PFY-HO-BIG',
  '["/images/pfy_hair_oil.jpg","https://images.unsplash.com/photo-1608248597359-2572b834399b?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["250ml (Big)"]'::jsonb,
  '[]'::jsonb,
  '["Feeds the scalp & boosts follicle circulation","Seals hair ends (especially high porosity)","Oil is a sealant + scalp food (NOT daily)","Precision twist applicator nozzle for direct scalp targeting"]'::jsonb,
  'Castor Seed Oil, Jojoba Oil, Rosemary Essential Oil, Fenugreek Extract, Chebe Infusion, Vitamin E, Peppermint.',
  'Apply 3-5 drops directly to scalp and massage gently for 3 minutes daily. Use to seal ends after moisturizing.',
  true,
  true,
  4.9,
  32,
  '2026-08-28T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-oil-small',
  'PERFECT FOR YOU Nourishing Hair Growth Oil (100ml)',
  'hair-oil-small',
  'cat-hair',
  'Hair',
  'Compact travel edition of our signature Nourishing Hair Growth Oil with precision applicator twist nozzle. Feeds the scalp and seals fragile hair ends.',
  0.6,
  NULL,
  24,
  'PFY-HO-SML',
  '["/images/pfy_hair_oil.jpg"]'::jsonb,
  '["100ml (Small)"]'::jsonb,
  '[]'::jsonb,
  '["Convenient 100ml size with twist applicator nozzle","Scalp food & root nourishment","Seals moisture into hair ends"]'::jsonb,
  'Pure cold-pressed carrier oils, Rosemary & Lavender extract, Fenugreek, Vitamin E.',
  'Massage a few drops onto scalp and hair ends morning or night.',
  false,
  true,
  4.8,
  19,
  '2026-08-26T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-butter',
  'PERFECT FOR YOU Hair Butter',
  'perfect-for-you-hair-butter',
  'cat-hair',
  'Hair',
  'Our signature botanical hair moisturizer. Grounded in our core principle: Moisturization = Seals The Water. Butters and creams do NOT add water; they lock and trap hydration already in the hair. Whipped with raw unrefined Northern Ghanaian shea butter, mango butter, and pure botanical oils to keep your crown soft longer and protect against moisture loss.',
  0.55,
  NULL,
  20,
  'PFY-HB-01',
  '["/images/pfy_hair_butter.jpg","https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["200g (Regular)","350g (Jumbo)"]'::jsonb,
  '[]'::jsonb,
  '["Moisturization = Seals the water inside hair","Keeps hair soft significantly longer","Prevents moisture loss and breakage","Protects delicate strands & seals split ends"]'::jsonb,
  'Pure Raw Ghanaian Shea Butter, Mango Butter, Avocado Oil, Argan Oil, Sweet Almond Oil, Botanical Herbal Extracts.',
  'Apply to damp or misted hair in sections to seal in water and lock in hydration. Excellent for twists, braids, wash-and-gos, and protecting ends.',
  true,
  true,
  5,
  42,
  '2026-09-08T08:02:21.641Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-mist',
  'Revitalizing Hydration Hair Mist',
  'revitalizing-hydration-hair-mist',
  'cat-hair',
  'Hair',
  'Lightweight botanical leave-in refresher formulated with pure aloe vera juice, rose water, and green tea extract. Reawakens curls and restores scalp moisture instantly.',
  0.5,
  NULL,
  20,
  'PFY-HM-01',
  '["/images/pfy_hair_mist.jpg"]'::jsonb,
  '["250ml"]'::jsonb,
  '[]'::jsonb,
  '["Instant hydration without greasy residue","Detangles hair effortlessly","Cools and balances scalp pH"]'::jsonb,
  'Organic Aloe Barbadensis Juice, Rose Floral Water, Green Tea Extract, Vegetable Glycerin, Provitamin B5.',
  'Shake well and mist generously over dry or damp hair before styling. Follow with Hair Oil or Butter to lock in moisture.',
  false,
  true,
  4.7,
  14,
  '2026-08-23T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-mask-small',
  'PERFECT FOR YOU Ayurvedic Hair Mask (150g Pouch)',
  'herbal-hair-mask-small',
  'cat-hair',
  'Hair',
  'Natural Ayurvedic hair mask in a compact matte black stand-up pouch. Slogan: "Healthy Hair, Happy Skin — naturally". Formulated with amla, bhringraj, and fenugreek to restore shine, strength, and softness without harsh chemicals.',
  0.4,
  NULL,
  14,
  'PFY-HMS-SML',
  '["/images/pfy_hair_mask.jpg"]'::jsonb,
  '["150g"]'::jsonb,
  '[]'::jsonb,
  '["Deep Nourishment: Delivers vitamins & minerals directly to follicles","Hair Protection: Reduces breakage, split ends, and styling stress","Frizz Control: Smooths cuticle for silky, manageable curls","Healthy Scalp: Amla & fenugreek strengthen roots & fight dandruff","100% Chemical-Free: Safe for natural & treated hair"]'::jsonb,
  'Amla Fruit Powder, Bhringraj, Hibiscus Petals, Brahmi, Aloe Vera Gel, Coconut Milk Extract.',
  'Mix with warm water or aloe juice to form a smooth paste. Apply from root to tip, leave on for 30 minutes, and rinse thoroughly.',
  false,
  true,
  4.8,
  11,
  '2026-08-18T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-mask-big',
  'PERFECT FOR YOU Ayurvedic Hair Mask (350g Pouch)',
  'herbal-hair-mask-big',
  'cat-hair',
  'Hair',
  'Our full-sized Ayurvedic hair mask in a premium matte black stand-up resealable pouch. Crafted from centuries-old herbs, oils, and plant extracts. Slogan: "Healthy Hair, Happy Skin — naturally". Deeply nourishes your scalp and hair naturally, restoring shine, strength, and softness—without any harsh chemicals.',
  0.65,
  NULL,
  16,
  'PFY-HMS-BIG',
  '["/images/pfy_hair_mask.jpg"]'::jsonb,
  '["350g"]'::jsonb,
  '[]'::jsonb,
  '["Deep Nourishment: Herbal ingredients deliver essential vitamins straight to follicles","Hair Protection: Reduces breakage, split ends, and hair fall caused by stress","Frizz Control & Smooth Texture: Herbal oils smooth cuticles for silky manageable hair","Healthy Scalp: Amla, bhringraj, and fenugreek fight dandruff & balance oils","100% Chemical-Free: Safe for all hair types—even chemically treated hair"]'::jsonb,
  'Amla, Bhringraj, Shikakai, Neem, Hibiscus, Raw Honey Extract.',
  'Apply evenly to washed hair under a deep conditioner cap for 30-45 minutes. Rinse with cool water.',
  true,
  true,
  5,
  42,
  '2026-08-16T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-set-small',
  'Complete Hair Set Small',
  'hair-set-small',
  'cat-hair',
  'Hair',
  'The complete healthy hair starter ritual. Includes Hair Oil Small (100ml), Moisture Hair Butter, Revitalizing Mist, and Herbal Mask Small for total hair transformation.',
  0.7,
  0.85,
  8,
  'PFY-SET-SML',
  '["/images/pfy_hair_set.jpg","/images/pfy_model_collection.jpg"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Everything you need for healthy moisture & retention","Saves GH₵20 compared to individual purchase","Suitable for all natural hair types"]'::jsonb,
  'Full herbal botanical collection of oils, butters, mist and herbs.',
  'Follow the 4-step PFY ritual: Hydrate with Mist, Deep Condition with Mask, Seal with Butter, and Nourish Scalp with Oil.',
  true,
  true,
  5,
  53,
  '2026-08-13T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-set-big',
  'Complete Hair Set Big',
  'hair-set-big',
  'cat-hair',
  'Hair',
  'The premier full-sized collection. Features Hair Oil Big (250ml), Moisture Butter (200g), Hydration Mist (250ml), and Herbal Hair Mask Big (350g) for 3+ months of dedicated hair care.',
  0.85,
  0.95,
  9,
  'PFY-SET-BIG',
  '["/images/pfy_hair_set.jpg","/images/pfy_model_collection.jpg"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Full-sized 3-month supply","Maximum savings bundle","Fast-tracks length retention and volume"]'::jsonb,
  'Full herbal botanical collection in large sizes.',
  'Incorporate weekly into wash day and daily maintenance.',
  true,
  true,
  5,
  67,
  '2026-08-10T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-set-small-acc',
  'Hair Set Small + Accessories',
  'hair-set-small-plus-accessories',
  'cat-hair',
  'Hair',
  'The complete Hair Set Small packaged with our luxury satin bonnet, seamless wide-tooth comb, and premium microfiber hair drying towel.',
  0.88,
  0.96,
  6,
  'PFY-SET-SML-ACC',
  '["/images/pfy_hair_set.jpg","/images/pfy_model_collection.jpg"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Includes luxury silk/satin bonnet & protective tools","Reduces nighttime friction and frizz","Ideal premium gift package"]'::jsonb,
  'Complete Small Set + Pure Satin Bonnet, Detangling Comb.',
  'Apply products as usual and wrap hair in the silk bonnet overnight.',
  true,
  true,
  4.9,
  38,
  '2026-08-08T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-hair-set-big-acc',
  'Hair Set Big + Accessories',
  'hair-set-big-plus-accessories',
  'cat-hair',
  'Hair',
  'The ultimate luxury hair experience. Includes all 4 full-sized Big Hair care products accompanied by our double-layered satin bonnet, scalp massager brush, and seamless wooden detangling comb.',
  0.95,
  0.99,
  5,
  'PFY-SET-BIG-ACC',
  '["/images/pfy_hair_set.jpg","/images/pfy_model_collection.jpg"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["The ultimate complete regimen","Includes scalp massager & double-layer bonnet","Guaranteed healthy hair routine"]'::jsonb,
  'Complete Big Set + Double-layered Satin Bonnet, Silicone Scalp Massager, Detangling Comb.',
  'Use scalp massager while applying Hair Oil for 5 mins to boost circulation.',
  true,
  true,
  5,
  45,
  '2026-08-06T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-skin-glow-oil',
  'Botanical Glow Body & Face Oil',
  'botanical-glow-oil',
  'cat-skincare',
  'Skincare',
  'Silky, fast-absorbing botanical oil blend of cold-pressed marula, rosehip seed, and golden jojoba. Delivers a radiant glass-skin glow without feeling heavy in tropical climates.',
  0.75,
  NULL,
  14,
  'PFY-SK-GLOW',
  '["https://images.unsplash.com/photo-1608248597359-2572b834399b?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["100ml"]'::jsonb,
  '[]'::jsonb,
  '["Restores vibrant skin radiance","Non-comedogenic & fast-absorbing","Protects against moisture loss"]'::jsonb,
  'Rosehip Seed Oil, Marula Oil, Jojoba, Vitamin C Ester, Neroli Oil.',
  'Warm 2-3 drops between palms and gently press onto freshly washed face or body.',
  true,
  true,
  4.9,
  22,
  '2026-08-30T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-skin-shea-balm',
  'Nourishing Shea & Baobab Face Balm',
  'shea-baobab-face-balm',
  'cat-skincare',
  'Skincare',
  'Rich restorative balm crafted with micro-filtered Northern Ghana shea butter and baobab oil. Soothes dry patches and strengthens delicate skin barriers.',
  0.65,
  NULL,
  12,
  'PFY-SK-BALM',
  '["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["120ml"]'::jsonb,
  '[]'::jsonb,
  '["Deep barrier protection","Calms sensitized skin","Locks in hydration all day"]'::jsonb,
  'Unrefined Shea Butter, Baobab Oil, Calendula Extract, Beeswax.',
  'Melt a pea-sized amount between fingers and smooth over face and neck.',
  false,
  true,
  4.8,
  17,
  '2026-08-27T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-skin-aloe-mist',
  'Clarifying Aloe & Green Tea Face Mist',
  'clarifying-aloe-green-tea-face-mist',
  'cat-skincare',
  'Skincare',
  'Refreshing botanical toner mist with antioxidant green tea, witch hazel, and pure aloe vera. Tones pores and balances natural oils in humid weather.',
  0.45,
  NULL,
  18,
  'PFY-SK-MIST',
  '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["200ml"]'::jsonb,
  '[]'::jsonb,
  '["Balances skin sebum","Calms redness","Preps skin for serums"]'::jsonb,
  'Aloe Vera Leaf Juice, Camellia Sinensis (Green Tea), Witch Hazel, Niacinamide.',
  'Mist face after cleansing or throughout the day for an instant dewy refresh.',
  false,
  true,
  4.7,
  13,
  '2026-08-25T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-slip-forest-green',
  'Velvet Cloud Slides — Forest Green',
  'velvet-cloud-slides-forest-green',
  'cat-slippers',
  'Slippers',
  'Ultra-plush lifestyle slides featuring a rich forest-green velvet strap and memory foam footbed. The epitome of effortless elegance at home or on casual outings.',
  0.75,
  NULL,
  11,
  'PFY-SLIP-GRN',
  '["https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["37","38","39","40","41"]'::jsonb,
  '[]'::jsonb,
  '["High-density comfort foam","Signature deep green velvet finish","Durable anti-slip rubber outsole"]'::jsonb,
  NULL,
  NULL,
  true,
  true,
  4.9,
  24,
  '2026-08-22T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-slip-raffia',
  'Woven Raffia Everyday Slides',
  'woven-raffia-everyday-slides',
  'cat-slippers',
  'Slippers',
  'Handcrafted natural woven raffia slides lined with soft leather. Breathable, lightweight, and effortlessly chic with dresses or denim.',
  0.8,
  0.9,
  8,
  'PFY-SLIP-RAF',
  '["https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["38","39","40","41"]'::jsonb,
  '[]'::jsonb,
  '["Handwoven natural fibers","Soft cushioned footbed","Versatile day-to-evening aesthetic"]'::jsonb,
  NULL,
  NULL,
  false,
  true,
  4.8,
  15,
  '2026-08-20T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-slip-leather',
  'Minimalist Double-Strap Leather Sandals',
  'minimalist-leather-sandals',
  'cat-slippers',
  'Slippers',
  'Sleek double-strap sandals in supple chocolate leather with gold-tone buckle accents. Sturdy, elegant, and designed for walking in comfort.',
  0.85,
  NULL,
  7,
  'PFY-SLIP-LEA',
  '["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["37","38","39","40","41","42"]'::jsonb,
  '[]'::jsonb,
  '["Genuine quality leather","Ergonomic arch support","Adjustable custom straps"]'::jsonb,
  NULL,
  NULL,
  false,
  true,
  4.9,
  19,
  '2026-08-17T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-bag-totebag',
  'Everyday Structured Canvas & Leather Tote',
  'canvas-leather-tote',
  'cat-bags',
  'Bags',
  'Spacious, durable structured tote combining heavy natural cotton canvas with deep forest green leather accents. Fits a 15-inch laptop, planner, and beauty essentials comfortably.',
  0.9,
  NULL,
  9,
  'PFY-BAG-TOTE',
  '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Reinforced leather base and handles","Padded interior pocket with brass zip","Refined minimalist styling"]'::jsonb,
  NULL,
  NULL,
  true,
  true,
  5,
  31,
  '2026-08-31T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-bag-crossbody',
  'Emerald Green Vegan Leather Crossbody',
  'emerald-crossbody-bag',
  'cat-bags',
  'Bags',
  'Chic curved saddle bag crafted from buttery soft vegan leather in our signature botanical emerald hue. Features gold hardware and an adjustable strap.',
  0.88,
  0.95,
  5,
  'PFY-BAG-CRB',
  '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Signature brand emerald hue","Secure magnetic closure","Compact yet holds phone, cards, gloss and keys"]'::jsonb,
  NULL,
  NULL,
  false,
  true,
  4.8,
  16,
  '2026-08-29T08:39:45.087Z',
  NULL
);

INSERT INTO public.products (
  id, name, slug, category_id, category_name, description, price, discount_price, stock, sku, images, sizes, variants, benefits, ingredients, how_to_use, is_featured, is_active, rating, reviews_count, created_at, updated_at
) VALUES (
  'prod-bag-woven-clutch',
  'Artisan Woven Evening Clutch',
  'artisan-woven-clutch',
  'cat-bags',
  'Bags',
  'Handcrafted textured clutch bag with a detachable gold snake chain. Perfect for weddings, dinners, and special occasions.',
  0.7,
  NULL,
  10,
  'PFY-BAG-CLT',
  '["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '["Includes detachable gold chain strap","Luxurious silk satin lining","Hand-finished edges"]'::jsonb,
  NULL,
  NULL,
  false,
  true,
  4.9,
  12,
  '2026-08-21T08:39:45.087Z',
  NULL
);

-- Seed: orders
INSERT INTO public.orders (
  id, order_number, customer_name, email, phone, region, city, address, delivery_instructions, items, subtotal, delivery_fee, total, payment_status, order_status, payment_method, paystack_reference, created_at, updated_at
) VALUES (
  'ord-001',
  'PFY-000101',
  'Akosua Mensah',
  'akosua.m@gmail.com',
  '0244123890',
  'Greater Accra',
  'Accra',
  'House 14, Boundary Road, East Legon',
  'Near A&C Mall, gate is cream with black security door',
  '[{"id":"item-1","product_id":"prod-hair-set-small-acc","product_name":"Hair Set Small + Accessories","product_image":"https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80","price":295,"quantity":1,"total":295}]'::jsonb,
  295,
  20,
  315,
  'paid',
  'Processing',
  'paystack',
  'pstk_ref_982481029',
  '2026-09-07T06:39:45.087Z',
  NULL
);

INSERT INTO public.orders (
  id, order_number, customer_name, email, phone, region, city, address, delivery_instructions, items, subtotal, delivery_fee, total, payment_status, order_status, payment_method, paystack_reference, created_at, updated_at
) VALUES (
  'ord-002',
  'PFY-000102',
  'Efua Boateng',
  'efuab@yahoo.com',
  '0553987123',
  'Greater Accra',
  'Tema',
  'Community 11, Block C',
  'Call on arrival',
  '[{"id":"item-2","product_id":"prod-hair-oil-big","product_name":"Hair Oil Big (250ml)","product_image":"https://images.unsplash.com/photo-1608248597359-2572b834399b?auto=format&fit=crop&w=800&q=80","price":80,"quantity":1,"total":80},{"id":"item-3","product_id":"prod-hair-butter","product_name":"Moisture Rich Hair Butter","product_image":"https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80","price":60,"quantity":1,"total":60}]'::jsonb,
  140,
  30,
  170,
  'paid',
  'Paid',
  'paystack',
  'pstk_ref_441029182',
  '2026-09-07T02:39:45.087Z',
  NULL
);

INSERT INTO public.orders (
  id, order_number, customer_name, email, phone, region, city, address, delivery_instructions, items, subtotal, delivery_fee, total, payment_status, order_status, payment_method, paystack_reference, created_at, updated_at
) VALUES (
  'ord-003',
  'PFY-000103',
  'Ama Serwaa',
  'amaserwaa@gmail.com',
  '0208112233',
  'Ashanti Region',
  'Kumasi',
  'Plot 12, Ahodwo roundabout',
  'Opposite Shell filing station',
  '[{"id":"item-4","product_id":"prod-hair-set-big-acc","product_name":"Hair Set Big + Accessories","product_image":"https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80","price":330,"quantity":1,"total":330}]'::jsonb,
  330,
  35,
  365,
  'paid',
  'Delivered',
  'paystack',
  'pstk_ref_118273645',
  '2026-09-06T04:39:45.087Z',
  NULL
);

-- Seed: settings (single row)
INSERT INTO public.settings (id, data) VALUES ('default', '{"store_name":"Perfect For You","tagline":"Beauty. Confidence. Simplicity.","phone":"+233 54 459 0749","whatsapp":"233544590749","email":"hello@perfectforyou.com","address":"Shop 4, Lagos Avenue, East Legon, Accra, Ghana","currency":"GH₵","free_delivery_threshold":2,"delivery_zones":[{"id":"accra","name":"Greater Accra (Accra Central, East Legon, Airport, Osu)","fee":20,"eta":"Same day / 24 hours"},{"id":"tema","name":"Greater Accra (Tema, Spintex, Kasoa)","fee":30,"eta":"1-2 business days"},{"id":"kumasi","name":"Ashanti Region (Kumasi & environs)","fee":35,"eta":"2-3 business days"},{"id":"takoradi","name":"Western Region (Sekondi-Takoradi)","fee":40,"eta":"2-3 business days"},{"id":"other","name":"Other Regions across Ghana","fee":50,"eta":"3-4 business days"}],"paystack_public_key":"pk_test_pfy_mock_public_key","paystack_test_mode":true,"social_links":{"instagram":"https://instagram.com/perfectforyou_gh","tiktok":"https://tiktok.com/@perfectforyou_gh","facebook":"https://facebook.com/perfectforyou.gh","snapchat":"https://www.snapchat.com/t/vjlTm2Px"}}'::jsonb);

-- Seed: reviews
INSERT INTO public.reviews (id, product_id, product_name, author, location, rating, comment, date, verified_purchase) VALUES
  ('rev-1', 'prod-hair-set-small-acc', 'Hair Set Small + Accessories', 'Adwoa O.', 'Cantonments, Accra', 5, 'The herbal hair mask and oil have completely transformed my dry edges! My scalp feels so clean and soothed. I got my order in East Legon within 4 hours. 10/10 recommend.', '3 days ago', true),
  ('rev-2', 'prod-hair-oil-big', 'Hair Oil Big (250ml)', 'Naa Dromo', 'Tema', 5, 'Smells so natural and herbal, not like synthetic perfumes. I use it daily to seal in moisture before putting on my bonnet. Visible growth in just 3 weeks.', '1 week ago', true),
  ('rev-3', 'prod-bag-totebag', 'Everyday Structured Canvas & Leather Tote', 'Selorm K.', 'Airport Residential', 5, 'The quality of this tote is unmatched! The dark forest green leather details look super chic with all my work outfits and it comfortably holds my laptop.', '2 weeks ago', true);
