// ==============================================================================
// PETAL & PEARL — CORE APPLICATION TYPES
// ==============================================================================

export type ProductCategory = 
  | "jewellery" 
  | "hair-accessories" 
  | "everyday-essentials" 
  | "gifts";

export type ProductSubcategory = 
  | "earrings" 
  | "necklaces" 
  | "bracelets" 
  | "rings" 
  | "claw-clips" 
  | "scrunchies" 
  | "hair-bows" 
  | "phone-charms" 
  | "pouches" 
  | "gift-sets";

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price_override?: number;
  stock: number;
  attributes: Record<string, string>; // e.g. { color: "Champagne Gold", finish: "High Polish" }
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_primary?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  description: string;
  supplier_cost: number; // Confidential - excluded from public view
  selling_price: number;
  custom_markup?: number | null;
  stock: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_visible: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type PublicProduct = Omit<Product, "supplier_cost" | "custom_markup">;

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "supplier_order_placed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refund_pending"
  | "refunded";

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_title?: string;
  sku: string;
  unit_selling_price: number;
  unit_supplier_cost: number;
  quantity: number;
  total_price: number;
  total_cost: number;
  image_url?: string;
}

export interface CustomerAddress {
  name: string;
  email: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: "India";
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer: CustomerAddress;
  items: OrderItem[];
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_payable: number;
  total_supplier_cost: number;
  total_contribution: number;
  supplier_order_ref?: string;
  courier_partner?: string;
  tracking_number?: string;
  tracking_url?: string;
  actual_shipping_cost?: number;
  refund_status?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: PublicProduct;
  variant?: ProductVariant;
  quantity: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  resale_permission_status: "verified_wholesale" | "pending_agreement" | "not_authorized";
  agreement_notes: string;
  created_at: string;
}
