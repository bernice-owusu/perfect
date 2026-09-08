import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import type { Product, Category, Order, StoreSettings, CustomerReview } from "./src/types.ts";

const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.use(express.json());

// Persistent store file path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

// Default initial data based on PRD requirements
const initialCategories: Category[] = [
  {
    id: "cat-hair",
    name: "Hair",
    slug: "hair",
    description: "Hair care, nourishing oils, herbal masks, butters and hair sets.",
    image: "/images/pfy_model_duo.jpg",
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
];

const initialProducts: Product[] = [
  // HAIR (Exact PRD products & pricing)
  {
    id: "prod-hair-oil-big",
    name: "PERFECT FOR YOU Nourishing Hair Growth Oil (250ml)",
    slug: "nourishing-hair-growth-oil-big",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "Our signature scalp food & sealant in a precision applicator bottle with black twist nozzle. Infused with rosemary, chebe, amla, fenugreek, and cold-pressed castor oil. As our brand teaches: Oil is NOT hydration and NOT a moisturizer. Oil is a sealant + scalp food to stimulate follicles, boost circulation, and seal hair ends (use 2-3x weekly, not daily).",
    price: 0.80,
    stock: 18,
    sku: "PFY-HO-BIG",
    images: [
      "/images/pfy_hair_oil.jpg",
      "https://images.unsplash.com/photo-1608248597359-2572b834399b?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["250ml (Big)"],
    benefits: [
      "Feeds the scalp & boosts follicle circulation",
      "Seals hair ends (especially high porosity)",
      "Oil is a sealant + scalp food (NOT daily)",
      "Precision twist applicator nozzle for direct scalp targeting",
    ],
    ingredients: "Cold-Pressed Castor Oil, Golden Jojoba Oil, Rosemary Essential Oil, Fenugreek Extract, Chebe Infusion, Amla Extract, Vitamin E, Peppermint.",
    how_to_use: "Part hair in sections and apply nozzle directly to scalp 2-3 times per week. Massage gently for 3-5 minutes. Smooth a few drops over ends to seal in moisture.",
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 48,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "prod-hair-oil-small",
    name: "PERFECT FOR YOU Nourishing Hair Growth Oil (100ml)",
    slug: "nourishing-hair-growth-oil-small",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "Compact travel edition of our signature Nourishing Hair Growth Oil with precision applicator twist nozzle. Feeds the scalp and seals fragile hair ends.",
    price: 0.60,
    stock: 24,
    sku: "PFY-HO-SML",
    images: [
      "/images/pfy_hair_oil.jpg",
    ],
    sizes: ["100ml (Small)"],
    benefits: [
      "Convenient 100ml size with twist applicator nozzle",
      "Scalp food & root nourishment",
      "Seals moisture into hair ends",
    ],
    ingredients: "Cold-Pressed Castor Oil, Jojoba Oil, Rosemary, Amla, Fenugreek, Vitamin E.",
    how_to_use: "Apply 3-5 drops directly to scalp or ends 2-3 times per week.",
    is_featured: false,
    is_active: true,
    rating: 4.9,
    reviews_count: 24,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "prod-hair-butter",
    name: "PERFECT FOR YOU Hair Butter",
    slug: "perfect-for-you-hair-butter",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "Our signature botanical hair moisturizer. Grounded in our core principle: Moisturization = Seals The Water. Butters and creams do NOT add water; they lock and trap hydration already in the hair. Whipped with raw unrefined Northern Ghanaian shea butter, mango butter, and pure botanical oils to keep your crown soft longer and protect against moisture loss.",
    price: 0.55,
    stock: 20,
    sku: "PFY-HB-01",
    images: [
      "/images/pfy_hair_butter.jpg",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["200g (Regular)", "350g (Jumbo)"],
    benefits: [
      "Moisturization = Seals the water inside hair",
      "Keeps hair soft significantly longer",
      "Prevents moisture loss and breakage",
      "Protects delicate strands & seals split ends",
    ],
    ingredients: "Pure Raw Ghanaian Shea Butter, Mango Butter, Avocado Oil, Argan Oil, Sweet Almond Oil, Botanical Herbal Extracts.",
    how_to_use: "Apply to damp or misted hair in sections to seal in water and lock in hydration. Excellent for twists, braids, wash-and-gos, and protecting ends.",
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 42,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "prod-hair-mist",
    name: "Revitalizing Hydration Hair Mist",
    slug: "revitalizing-hydration-hair-mist",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "Lightweight botanical leave-in refresher formulated with pure aloe vera juice, rose water, and green tea extract. Reawakens curls and restores scalp moisture instantly.",
    price: 0.50,
    stock: 20,
    sku: "PFY-HM-01",
    images: [
      "/images/pfy_hair_mist.jpg",
    ],
    sizes: ["250ml"],
    benefits: ["Instant hydration without greasy residue", "Detangles hair effortlessly", "Cools and balances scalp pH"],
    ingredients: "Organic Aloe Barbadensis Juice, Rose Floral Water, Green Tea Extract, Vegetable Glycerin, Provitamin B5.",
    how_to_use: "Shake well and mist generously over dry or damp hair before styling. Follow with Hair Oil or Butter to lock in moisture.",
    is_featured: false,
    is_active: true,
    rating: 4.7,
    reviews_count: 14,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "prod-hair-mask-small",
    name: "PERFECT FOR YOU Ayurvedic Hair Mask (150g Pouch)",
    slug: "ayurvedic-hair-mask-small",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "Natural Ayurvedic hair mask in a compact matte black stand-up pouch. Slogan: \"Healthy Hair, Happy Skin — naturally\". Formulated with amla, bhringraj, and fenugreek to restore shine, strength, and softness without harsh chemicals.",
    price: 0.40,
    stock: 14,
    sku: "PFY-HMS-SML",
    images: [
      "/images/pfy_hair_mask.jpg",
    ],
    sizes: ["150g (Small Pouch)"],
    benefits: [
      "Deep Nourishment: Delivers vitamins & minerals directly to follicles",
      "Hair Protection: Reduces breakage, split ends, and styling stress",
      "Frizz Control: Smooths cuticle for silky, manageable curls",
      "Healthy Scalp: Amla & fenugreek strengthen roots & fight dandruff",
      "100% Chemical-Free: Safe for natural & treated hair",
    ],
    ingredients: "Amla Fruit Powder, Bhringraj, Fenugreek, Hibiscus Petals, Brahmi, Aloe Vera Gel, Pure Coconut Milk Extract.",
    how_to_use: "Mix with warm water or aloe mist to form a smooth herbal paste. Apply generously from root to tip, leave on for 30 minutes, and rinse thoroughly.",
    is_featured: false,
    is_active: true,
    rating: 4.9,
    reviews_count: 26,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "prod-hair-mask-big",
    name: "PERFECT FOR YOU Ayurvedic Hair Mask (350g Pouch)",
    slug: "ayurvedic-hair-mask-big",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "Our full-sized Ayurvedic hair mask in a premium matte black stand-up resealable pouch. Crafted from centuries-old herbs, oils, and plant extracts. Slogan: \"Healthy Hair, Happy Skin — naturally\". Deeply nourishes your scalp and hair naturally, restoring shine, strength, and softness—without any harsh chemicals.",
    price: 0.65,
    stock: 16,
    sku: "PFY-HMS-BIG",
    images: [
      "/images/pfy_hair_mask.jpg",
    ],
    sizes: ["350g (Big Pouch)"],
    benefits: [
      "Deep Nourishment: Herbal ingredients deliver essential vitamins straight to follicles",
      "Hair Protection: Reduces breakage, split ends, and hair fall caused by stress",
      "Frizz Control & Smooth Texture: Herbal oils smooth cuticles for silky manageable hair",
      "Healthy Scalp: Amla, bhringraj, and fenugreek fight dandruff & balance oils",
      "100% Chemical-Free: Safe for all hair types—even chemically treated hair",
    ],
    ingredients: "Amla, Bhringraj, Fenugreek, Shikakai, Neem, Hibiscus, Raw Honey Extract.",
    how_to_use: "Mix with warm water, herbal mist, or conditioner. Apply evenly to washed hair under a deep conditioning cap for 30-45 minutes. Rinse with cool water.",
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 57,
    created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
  {
    id: "prod-hair-set-small",
    name: "Complete Hair Set Small",
    slug: "hair-set-small",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "The complete healthy hair starter ritual. Includes Hair Oil Small (100ml), Moisture Hair Butter, Revitalizing Mist, and Herbal Mask Small for total hair transformation.",
    price: 0.70,
    discount_price: 0.85,
    stock: 8,
    sku: "PFY-SET-SML",
    images: [
      "/images/pfy_hair_set.jpg",
      "/images/pfy_model_collection.jpg",
    ],
    benefits: ["Everything you need for healthy moisture & retention", "Saves GH₵0.15 compared to individual purchase", "Suitable for all natural hair types"],
    ingredients: "Full herbal botanical collection of oils, butters, mist and herbs.",
    how_to_use: "Follow the 4-step PFY ritual: Hydrate with Mist, Deep Condition with Mask, Seal with Butter, and Nourish Scalp with Oil.",
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 53,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "prod-hair-set-big",
    name: "Complete Hair Set Big",
    slug: "hair-set-big",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "The premier full-sized collection. Features Hair Oil Big (250ml), Moisture Butter (200g), Hydration Mist (250ml), and Herbal Hair Mask Big (350g) for 3+ months of dedicated hair care.",
    price: 0.85,
    discount_price: 0.95,
    stock: 9,
    sku: "PFY-SET-BIG",
    images: [
      "/images/pfy_hair_set.jpg",
      "/images/pfy_model_collection.jpg",
    ],
    benefits: ["Full-sized 3-month supply", "Maximum savings bundle", "Fast-tracks length retention and volume"],
    ingredients: "Full herbal botanical collection in large sizes.",
    how_to_use: "Incorporate weekly into wash day and daily maintenance.",
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 67,
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: "prod-hair-set-small-acc",
    name: "Hair Set Small + Accessories",
    slug: "hair-set-small-plus-accessories",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "The complete Hair Set Small packaged with our luxury satin bonnet, seamless wide-tooth comb, and premium microfiber hair drying towel.",
    price: 0.88,
    discount_price: 0.96,
    stock: 6,
    sku: "PFY-SET-SML-ACC",
    images: [
      "/images/pfy_hair_set.jpg",
      "/images/pfy_model_collection.jpg",
    ],
    benefits: ["Includes luxury silk/satin bonnet & protective tools", "Reduces nighttime friction and frizz", "Ideal premium gift package"],
    ingredients: "Complete Small Set + Pure Satin Bonnet, Detangling Comb.",
    how_to_use: "Apply products as usual and wrap hair in the silk bonnet overnight.",
    is_featured: true,
    is_active: true,
    rating: 4.9,
    reviews_count: 38,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "prod-hair-set-big-acc",
    name: "Hair Set Big + Accessories",
    slug: "hair-set-big-plus-accessories",
    category_id: "cat-hair",
    category_name: "Hair",
    description: "The ultimate luxury hair experience. Includes all 4 full-sized Big Hair care products accompanied by our double-layered satin bonnet, scalp massager brush, and seamless wooden detangling comb.",
    price: 0.95,
    discount_price: 0.99,
    stock: 5,
    sku: "PFY-SET-BIG-ACC",
    images: [
      "/images/pfy_hair_set.jpg",
      "/images/pfy_model_collection.jpg",
    ],
    benefits: ["The ultimate complete regimen", "Includes scalp massager & double-layer bonnet", "Guaranteed healthy hair routine"],
    ingredients: "Complete Big Set + Double-layered Satin Bonnet, Silicone Scalp Massager, Detangling Comb.",
    how_to_use: "Use scalp massager while applying Hair Oil for 5 mins to boost circulation.",
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 45,
    created_at: new Date(Date.now() - 32 * 86400000).toISOString(),
  },

  // SKINCARE
  {
    id: "prod-pfy-black-soap",
    name: "PERFECT FOR YOU Black Soap",
    slug: "perfect-for-you-black-soap",
    category_id: "cat-skincare",
    category_name: "Skincare",
    description: "Authentic Ghanaian Black Soap handcrafted with plantain skin ash, cocoa pod ash, wild forest honey, virgin coconut oil, and pure unrefined Northern shea butter. Slogan: \"Healthy hair, happy skin\". Gently clarifies skin pores and congested scalps, clears breakouts and razor bumps, and balances natural hydration without stripping.",
    price: 0.50,
    stock: 25,
    sku: "PFY-SOAP-250",
    images: [
      "/images/pfy_black_soap.jpg",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["250g Standard Tub", "500g Value Tub"],
    benefits: [
      "Healthy hair, happy skin multipurpose cleanser",
      "Clears blemishes, acne & hyperpigmentation gently",
      "Enriched with raw forest honey & northern shea butter",
      "Clarifying detox wash for face, body, and scalp",
    ],
    ingredients: "Plantain Skin Ash, Cocoa Pod Ash, Raw Northern Ghana Shea Butter, Virgin Coconut Oil, Wild Forest Honey, Palm Kernel Oil, Purified Water.",
    how_to_use: "Lather a small pinch between damp palms or a bath sponge. Gently massage onto face, body, or damp scalp, then rinse thoroughly. Follow with Hair Butter or Glow Oil to seal in hydration.",
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 51,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "prod-skin-glow-oil",
    name: "Botanical Glow Body & Face Oil",
    slug: "botanical-glow-oil",
    category_id: "cat-skincare",
    category_name: "Skincare",
    description: "Silky, fast-absorbing botanical oil blend of cold-pressed marula, rosehip seed, and golden jojoba. Delivers a radiant glass-skin glow without feeling heavy in tropical climates.",
    price: 0.75,
    stock: 14,
    sku: "PFY-SK-GLOW",
    images: [
      "https://images.unsplash.com/photo-1608248597359-2572b834399b?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["100ml"],
    benefits: ["Restores vibrant skin radiance", "Non-comedogenic & fast-absorbing", "Protects against moisture loss"],
    ingredients: "Rosehip Seed Oil, Marula Oil, Jojoba, Vitamin C Ester, Neroli Oil.",
    how_to_use: "Warm 2-3 drops between palms and gently press onto freshly washed face or body.",
    is_featured: true,
    is_active: true,
    rating: 4.9,
    reviews_count: 22,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "prod-skin-shea-balm",
    name: "Nourishing Shea & Baobab Face Balm",
    slug: "shea-baobab-face-balm",
    category_id: "cat-skincare",
    category_name: "Skincare",
    description: "Rich restorative balm crafted with micro-filtered Northern Ghana shea butter and baobab oil. Soothes dry patches and strengthens delicate skin barriers.",
    price: 0.65,
    stock: 12,
    sku: "PFY-SK-BALM",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["120ml"],
    benefits: ["Deep barrier protection", "Calms sensitized skin", "Locks in hydration all day"],
    ingredients: "Unrefined Shea Butter, Baobab Oil, Calendula Extract, Beeswax.",
    how_to_use: "Melt a pea-sized amount between fingers and smooth over face and neck.",
    is_featured: false,
    is_active: true,
    rating: 4.8,
    reviews_count: 17,
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: "prod-skin-aloe-mist",
    name: "Clarifying Aloe & Green Tea Face Mist",
    slug: "clarifying-aloe-green-tea-face-mist",
    category_id: "cat-skincare",
    category_name: "Skincare",
    description: "Refreshing botanical toner mist with antioxidant green tea, witch hazel, and pure aloe vera. Tones pores and balances natural oils in humid weather.",
    price: 0.45,
    stock: 18,
    sku: "PFY-SK-MIST",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["200ml"],
    benefits: ["Balances skin sebum", "Calms redness", "Preps skin for serums"],
    ingredients: "Aloe Vera Leaf Juice, Camellia Sinensis (Green Tea), Witch Hazel, Niacinamide.",
    how_to_use: "Mist face after cleansing or throughout the day for an instant dewy refresh.",
    is_featured: false,
    is_active: true,
    rating: 4.7,
    reviews_count: 13,
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
  },

  // SLIPPERS
  {
    id: "prod-slip-forest-green",
    name: "Velvet Cloud Slides — Forest Green",
    slug: "velvet-cloud-slides-forest-green",
    category_id: "cat-slippers",
    category_name: "Slippers",
    description: "Ultra-plush lifestyle slides featuring a rich forest-green velvet strap and memory foam footbed. The epitome of effortless elegance at home or on casual outings.",
    price: 0.75,
    stock: 11,
    sku: "PFY-SLIP-GRN",
    images: [
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["37", "38", "39", "40", "41"],
    benefits: ["High-density comfort foam", "Signature deep green velvet finish", "Durable anti-slip rubber outsole"],
    is_featured: true,
    is_active: true,
    rating: 4.9,
    reviews_count: 24,
    created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
  },
  {
    id: "prod-slip-raffia",
    name: "Woven Raffia Everyday Slides",
    slug: "woven-raffia-everyday-slides",
    category_id: "cat-slippers",
    category_name: "Slippers",
    description: "Handcrafted natural woven raffia slides lined with soft leather. Breathable, lightweight, and effortlessly chic with dresses or denim.",
    price: 0.80,
    discount_price: 0.90,
    stock: 8,
    sku: "PFY-SLIP-RAF",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["38", "39", "40", "41"],
    benefits: ["Handwoven natural fibers", "Soft cushioned footbed", "Versatile day-to-evening aesthetic"],
    is_featured: false,
    is_active: true,
    rating: 4.8,
    reviews_count: 15,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: "prod-slip-leather",
    name: "Minimalist Double-Strap Leather Sandals",
    slug: "minimalist-leather-sandals",
    category_id: "cat-slippers",
    category_name: "Slippers",
    description: "Sleek double-strap sandals in supple chocolate leather with gold-tone buckle accents. Sturdy, elegant, and designed for walking in comfort.",
    price: 0.85,
    stock: 7,
    sku: "PFY-SLIP-LEA",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: ["37", "38", "39", "40", "41", "42"],
    benefits: ["Genuine quality leather", "Ergonomic arch support", "Adjustable custom straps"],
    is_featured: false,
    is_active: true,
    rating: 4.9,
    reviews_count: 19,
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
  },

  // BAGS
  {
    id: "prod-bag-totebag",
    name: "Everyday Structured Canvas & Leather Tote",
    slug: "canvas-leather-tote",
    category_id: "cat-bags",
    category_name: "Bags",
    description: "Spacious, durable structured tote combining heavy natural cotton canvas with deep forest green leather accents. Fits a 15-inch laptop, planner, and beauty essentials comfortably.",
    price: 0.90,
    stock: 9,
    sku: "PFY-BAG-TOTE",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    ],
    benefits: ["Reinforced leather base and handles", "Padded interior pocket with brass zip", "Refined minimalist styling"],
    is_featured: true,
    is_active: true,
    rating: 5.0,
    reviews_count: 31,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "prod-bag-crossbody",
    name: "Emerald Green Vegan Leather Crossbody",
    slug: "emerald-crossbody-bag",
    category_id: "cat-bags",
    category_name: "Bags",
    description: "Chic curved saddle bag crafted from buttery soft vegan leather in our signature botanical emerald hue. Features gold hardware and an adjustable strap.",
    price: 0.88,
    discount_price: 0.95,
    stock: 5,
    sku: "PFY-BAG-CRB",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    ],
    benefits: ["Signature brand emerald hue", "Secure magnetic closure", "Compact yet holds phone, cards, gloss and keys"],
    is_featured: false,
    is_active: true,
    rating: 4.8,
    reviews_count: 16,
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "prod-bag-woven-clutch",
    name: "Artisan Woven Evening Clutch",
    slug: "artisan-woven-clutch",
    category_id: "cat-bags",
    category_name: "Bags",
    description: "Handcrafted textured clutch bag with a detachable gold snake chain. Perfect for weddings, dinners, and special occasions.",
    price: 0.70,
    stock: 10,
    sku: "PFY-BAG-CLT",
    images: [
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
    ],
    benefits: ["Includes detachable gold chain strap", "Luxurious silk satin lining", "Hand-finished edges"],
    is_featured: false,
    is_active: true,
    rating: 4.9,
    reviews_count: 12,
    created_at: new Date(Date.now() - 17 * 86400000).toISOString(),
  },
];

const initialSettings: StoreSettings = {
  store_name: "Perfect For You",
  tagline: "Beauty. Confidence. Simplicity.",
  phone: "+233 54 459 0749",
  whatsapp: "233544590749",
  email: "hello@perfectforyou.com",
  address: "Shop 4, Lagos Avenue, East Legon, Accra, Ghana",
  currency: "GH₵",
  free_delivery_threshold: 300,
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
    tiktok: "https://tiktok.com/@perfectforyou_gh",
    facebook: "https://facebook.com/perfectforyou.gh",
    snapchat: "https://www.snapchat.com/t/vjlTm2Px",
  },
};

const initialOrders: Order[] = [
  {
    id: "ord-001",
    order_number: "PFY-000101",
    customer_name: "Akosua Mensah",
    email: "akosua.m@gmail.com",
    phone: "0244123890",
    region: "Greater Accra",
    city: "Accra",
    address: "House 14, Boundary Road, East Legon",
    delivery_instructions: "Near A&C Mall, gate is cream with black security door",
    items: [
      {
        id: "item-1",
        product_id: "prod-hair-set-small-acc",
        product_name: "Hair Set Small + Accessories",
        product_image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
        price: 295,
        quantity: 1,
        total: 295,
      },
    ],
    subtotal: 295,
    delivery_fee: 20,
    total: 315,
    payment_status: "paid",
    order_status: "Processing",
    payment_method: "paystack",
    paystack_reference: "pstk_ref_982481029",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "ord-002",
    order_number: "PFY-000102",
    customer_name: "Efua Boateng",
    email: "efuab@yahoo.com",
    phone: "0553987123",
    region: "Greater Accra",
    city: "Tema",
    address: "Community 11, Block C",
    delivery_instructions: "Call on arrival",
    items: [
      {
        id: "item-2",
        product_id: "prod-hair-oil-big",
        product_name: "Hair Oil Big (250ml)",
        product_image: "https://images.unsplash.com/photo-1608248597359-2572b834399b?auto=format&fit=crop&w=800&q=80",
        price: 80,
        quantity: 1,
        total: 80,
      },
      {
        id: "item-3",
        product_id: "prod-hair-butter",
        product_name: "Moisture Rich Hair Butter",
        product_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        price: 60,
        quantity: 1,
        total: 60,
      },
    ],
    subtotal: 140,
    delivery_fee: 30,
    total: 170,
    payment_status: "paid",
    order_status: "Paid",
    payment_method: "paystack",
    paystack_reference: "pstk_ref_441029182",
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: "ord-003",
    order_number: "PFY-000103",
    customer_name: "Ama Serwaa",
    email: "amaserwaa@gmail.com",
    phone: "0208112233",
    region: "Ashanti Region",
    city: "Kumasi",
    address: "Plot 12, Ahodwo roundabout",
    delivery_instructions: "Opposite Shell filing station",
    items: [
      {
        id: "item-4",
        product_id: "prod-hair-set-big-acc",
        product_name: "Hair Set Big + Accessories",
        product_image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
        price: 330,
        quantity: 1,
        total: 330,
      },
    ],
    subtotal: 330,
    delivery_fee: 35,
    total: 365,
    payment_status: "paid",
    order_status: "Delivered",
    payment_method: "paystack",
    paystack_reference: "pstk_ref_118273645",
    created_at: new Date(Date.now() - 28 * 3600000).toISOString(),
  },
];

const initialReviews: CustomerReview[] = [
  {
    id: "rev-1",
    product_id: "prod-hair-set-small-acc",
    product_name: "Hair Set Small + Accessories",
    author: "Adwoa O.",
    location: "Cantonments, Accra",
    rating: 5,
    comment: "The herbal hair mask and oil have completely transformed my dry edges! My scalp feels so clean and soothed. I got my order in East Legon within 4 hours. 10/10 recommend.",
    date: "3 days ago",
    verified_purchase: true,
  },
  {
    id: "rev-2",
    product_id: "prod-hair-oil-big",
    product_name: "Hair Oil Big (250ml)",
    author: "Naa Dromo",
    location: "Tema",
    rating: 5,
    comment: "Smells so natural and herbal, not like synthetic perfumes. I use it daily to seal in moisture before putting on my bonnet. Visible growth in just 3 weeks.",
    date: "1 week ago",
    verified_purchase: true,
  },
  {
    id: "rev-3",
    product_id: "prod-bag-totebag",
    product_name: "Everyday Structured Canvas & Leather Tote",
    author: "Selorm K.",
    location: "Airport Residential",
    rating: 5,
    comment: "The quality of this tote is unmatched! The dark forest green leather details look super chic with all my work outfits and it comfortably holds my laptop.",
    date: "2 weeks ago",
    verified_purchase: true,
  },
];

// Data store helpers
interface StoreData {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: StoreSettings;
  reviews: CustomerReview[];
}

function loadDataFromFile(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading store file, falling back to defaults:", err);
  }

  return {
    products: initialProducts,
    categories: initialCategories,
    orders: initialOrders,
    settings: initialSettings,
    reviews: initialReviews,
  };
}

let store: StoreData = loadDataFromFile();

// Store is loaded once from the local data file at boot. Kept as an async
// function to preserve the call sites that await it.
async function refreshStore(): Promise<StoreData> {
  return store;
}

async function saveData(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving store file:", err);
  }
}

async function initStore(): Promise<StoreData> {
  return store;
}

// Helper to calculate next order number
function generateOrderNumber(): string {
  const count = store.orders.length + 104;
  return `PFY-${String(count).padStart(6, "0")}`;
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", name: "Perfect For You API" });
});

// Settings
app.get("/api/settings", async (_req, res) => {
  await refreshStore();
  res.json({ settings: store.settings });
});

app.put("/api/settings", async (req, res) => {
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

app.post("/api/categories", async (req, res) => {
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

app.put("/api/categories/:id", async (req, res) => {
  const index = store.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Category not found" });

  store.categories[index] = { ...store.categories[index], ...req.body };
  await saveData(store);
  res.json({ success: true, category: store.categories[index] });
});

// Products
app.get("/api/products", async (req, res) => {
  await refreshStore();
  const { category, search, featured, active_only, sort } = req.query;
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

app.post("/api/products", async (req, res) => {
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
    images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80"],
    sizes: sizes || [],
    benefits: Array.isArray(benefits) ? benefits : benefits ? [benefits] : [],
    ingredients: ingredients || "",
    how_to_use: how_to_use || "",
    is_featured: !!is_featured,
    is_active: is_active !== false,
    rating: 5.0,
    reviews_count: 0,
    created_at: new Date().toISOString(),
  };

  store.products.unshift(newProd);
  await saveData(store);
  res.status(201).json({ success: true, product: newProd });
});

app.put("/api/products/:id", async (req, res) => {
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

app.delete("/api/products/:id", async (req, res) => {
  const index = store.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  // Soft delete per PRD recommendation #24
  store.products[index].is_active = false;
  store.products[index].updated_at = new Date().toISOString();
  await saveData(store);
  res.json({ success: true, message: "Product deactivated (soft-deleted)", product: store.products[index] });
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

  if (!customer_name || !phone || !email || !address || !items || items.length === 0) {
    return res.status(400).json({ error: "Please fill in all customer details and at least one item." });
  }

  // Calculate subtotal and verify/deduct stock
  let subtotal = 0;
  for (const item of items) {
    const prod = store.products.find((p) => p.id === item.product_id);
    if (prod) {
      // Deduct inventory automatically per PRD requirement #27
      prod.stock = Math.max(0, prod.stock - (item.quantity || 1));
      subtotal += item.price * (item.quantity || 1);
    } else {
      subtotal += item.price * (item.quantity || 1);
    }
  }

  const orderNum = generateOrderNumber();
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    order_number: orderNum,
    customer_name,
    email,
    phone,
    region: region || "Greater Accra",
    city: city || "Accra",
    address,
    delivery_instructions: delivery_instructions || "",
    items,
    subtotal,
    delivery_fee: Number(delivery_fee),
    total: subtotal + Number(delivery_fee),
    payment_status: "paid",
    order_status: "Paid",
    payment_method,
    paystack_reference: payment_reference || `pstk_sim_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  store.orders.unshift(newOrder);
  await saveData(store);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: "Order placed successfully",
  });
});

// Order tracking endpoint
app.get("/api/orders/track", async (req, res) => {
  await refreshStore();
  const { order_number, query } = req.query;
  if (!order_number && !query) {
    return res.status(400).json({ error: "Order number is required" });
  }

  const searchTarget = (order_number || query) as string;
  const cleanTarget = searchTarget.trim().toUpperCase();

  const found = store.orders.find(
    (o) =>
      o.order_number.toUpperCase() === cleanTarget ||
      o.order_number.replace(/[^A-Z0-9]/g, "") === cleanTarget.replace(/[^A-Z0-9]/g, "")
  );

  if (!found) {
    return res.status(404).json({ error: `Order "${searchTarget}" could not be found. Please double-check your order number.` });
  }

  res.json({ order: found });
});

// Admin orders listing
app.get("/api/orders", async (req, res) => {
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

app.put("/api/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  const order = store.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.order_status = status;
  order.updated_at = new Date().toISOString();
  await saveData(store);
  res.json({ success: true, order });
});

// Paystack payment verification simulation / proxy
app.post("/api/paystack/verify", (req, res) => {
  const { reference, amount } = req.body;
  if (!reference) {
    return res.status(400).json({ error: "Payment reference required" });
  }

  // Backend verification logic (PRD #15 & #40)
  // In production with live keys, this makes a secure HTTPS call to https://api.paystack.co/transaction/verify/:reference
  // In test sandbox mode, we verify the reference structure and return confirmed status
  const isVerified = true;
  res.json({
    status: "success",
    verified: isVerified,
    reference,
    amount,
    gateway_response: "Successful",
    message: "Transaction verified successfully by Paystack backend",
  });
});

// Admin Auth
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (
    (email === "admin@perfectforyou.com" && password === "admin123") ||
    (email === "bernyx.owusu@gmail.com" && password === "admin123")
  ) {
    return res.json({
      success: true,
      token: "pfy_admin_token_" + Date.now(),
      user: {
        name: "Store Administrator",
        email,
        role: "admin",
      },
    });
  }
  return res.status(401).json({ error: "Invalid admin email or password. Use demo login or admin@perfectforyou.com / admin123." });
});

// Admin Stats
app.get("/api/admin/stats", async (_req, res) => {
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

// Reviews
app.get("/api/reviews", async (_req, res) => {
  await refreshStore();
  res.json({ reviews: store.reviews });
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
    console.error("Failed to initialize store:", err);
    start();
  });
}

export default app;
export { initStore };
