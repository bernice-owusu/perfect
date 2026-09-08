export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  description: string;
  price: number;
  discount_price?: number;
  stock: number;
  sku: string;
  images: string[];
  sizes?: string[];
  variants?: ProductVariant[];
  benefits?: string[];
  ingredients?: string;
  how_to_use?: string;
  is_featured: boolean;
  is_active: boolean;
  rating?: number;
  reviews_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
  item_count?: number;
}

export interface CartItem {
  product_id: string;
  product: Product;
  selected_size?: string;
  selected_variant_id?: string;
  variant_name?: string;
  unit_price: number;
  quantity: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Paid'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  variant_name?: string;
  size?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  address: string;
  delivery_instructions?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  payment_method: 'paystack' | 'momo' | 'card';
  paystack_reference?: string;
  created_at: string;
  updated_at?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  eta: string;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  currency: string;
  announcement_bar?: string;
  free_delivery_threshold: number;
  delivery_zones: DeliveryZone[];
  paystack_public_key: string;
  paystack_test_mode: boolean;
  social_links: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    snapchat?: string;
  };
}

export interface CustomerReview {
  id: string;
  product_id: string;
  product_name?: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  verified_purchase: boolean;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrdersCount: number;
  recentOrders: Order[];
}
