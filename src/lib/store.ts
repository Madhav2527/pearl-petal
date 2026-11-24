// ==============================================================================
// PETAL & PEARL — CENTRAL DATA STORE & REPOSITORY
// Domain: https://thepearlpetals.in
// Handles dynamic CRUD, public sanitization, order tracking & admin metrics
// ==============================================================================

import fs from "fs";
import path from "path";
import { Product, PublicProduct, Order, OrderItem, Supplier, OrderStatus } from "./types";
import { SEED_PRODUCTS, SEED_SUPPLIERS } from "../data/seed-data";
import { calculateSellingPrice, sanitizePublicProduct, DEFAULT_PRICING_SETTINGS, PricingSettings } from "./pricing-engine";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SUPPLIERS_FILE = path.join(DATA_DIR, "suppliers.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");
const TMP_ORDERS_FILE = path.join("/tmp", "petal_pearl_orders.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // fallback in restricted env
    }
  }
}

// In-memory cache with fallback to disk persistence
let memoryProducts: Product[] = [...SEED_PRODUCTS];
let memorySuppliers: Supplier[] = [...SEED_SUPPLIERS];
let memoryOrders: Order[] = [];
let memorySettings: PricingSettings = { ...DEFAULT_PRICING_SETTINGS };
let memorySubscribers: Array<{ email: string; created_at: string; code: string }> = [];

// Helper to save to disk safely
function saveToFile(filePath: string, data: unknown) {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // If running in readonly context, memory state suffices
  }
}

export function saveOrdersToStorage() {
  saveToFile(ORDERS_FILE, memoryOrders);
  try {
    fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(memoryOrders, null, 2), "utf8");
  } catch {
    // ignore in environments without /tmp
  }
}

// Initialize from file if exists
function loadInitialState() {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      memoryProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
    }
    if (fs.existsSync(ORDERS_FILE)) {
      memoryOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
    }
    // Also load and merge any orders from /tmp (e.g. Vercel serverless warm instances)
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      try {
        const tmpOrders: Order[] = JSON.parse(fs.readFileSync(TMP_ORDERS_FILE, "utf8"));
        for (const to of tmpOrders) {
          if (!memoryOrders.some((o) => o.order_number === to.order_number)) {
            memoryOrders.unshift(to);
          }
        }
      } catch {
        // ignore
      }
    }
    if (fs.existsSync(SUPPLIERS_FILE)) {
      memorySuppliers = JSON.parse(fs.readFileSync(SUPPLIERS_FILE, "utf8"));
    }
    if (fs.existsSync(SETTINGS_FILE)) {
      memorySettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
    }
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      memorySubscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf8"));
    }
  } catch {
    // continue with memory defaults
  }
}

loadInitialState();

// ==============================================================================
// PUBLIC FACING DATA ACCESS (SUPPLIER COSTS STRIPPED)
// ==============================================================================

export function getPublicProducts(filters?: {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  bestseller?: boolean;
  search?: string;
}): PublicProduct[] {
  let list = memoryProducts.filter((p) => p.is_visible);

  if (filters?.category) {
    list = list.filter((p) => p.category === filters.category);
  }
  if (filters?.subcategory) {
    list = list.filter((p) => p.subcategory === filters.subcategory);
  }
  if (filters?.featured) {
    list = list.filter((p) => p.is_featured);
  }
  if (filters?.bestseller) {
    list = list.filter((p) => p.is_bestseller);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return list.map(sanitizePublicProduct);
}

export function getPublicProductBySlug(slug: string): PublicProduct | null {
  const p = memoryProducts.find((item) => item.slug === slug && item.is_visible);
  if (!p) return null;
  return sanitizePublicProduct(p);
}

export function getPublicProductById(id: string): PublicProduct | null {
  const p = memoryProducts.find((item) => item.id === id && item.is_visible);
  if (!p) return null;
  return sanitizePublicProduct(p);
}

// ==============================================================================
// ORDER & TRACKING REPOSITORY
// ==============================================================================

export function createOrder(orderData: Omit<Order, "id" | "order_number" | "created_at" | "updated_at">): Order {
  const count = memoryOrders.length + 1001;
  const orderNumber = `PP-2026-${count}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
  };

  memoryOrders.unshift(newOrder);
  saveOrdersToStorage();
  return newOrder;
}

export function getOrderByNumber(orderNumber: string): Order | null {
  return memoryOrders.find((o) => o.order_number.toUpperCase() === orderNumber.trim().toUpperCase()) || null;
}

export async function syncOrderFromRazorpay(orderNumber: string): Promise<Order | null> {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpayKeyId || !razorpaySecret) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Razorpay = require("razorpay");
    const rzp = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpaySecret });
    const res = await rzp.orders.all({ count: 50 });
    const cleanNum = orderNumber.trim().toUpperCase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzpOrder = res.items?.find((o: any) =>
      (o.receipt && o.receipt.trim().toUpperCase() === cleanNum) ||
      (o.notes && o.notes.orderNumber && o.notes.orderNumber.trim().toUpperCase() === cleanNum)
    );

    if (!rzpOrder) return null;

    let customerEmail = rzpOrder.notes?.customerEmail || "";
    let customerPhone = rzpOrder.notes?.customerPhone || "";
    const customerName = rzpOrder.notes?.customerName || "Boutique Customer";
    let paymentId = "";

    try {
      const paymentsRes = await rzp.orders.fetchPayments(rzpOrder.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paidPayment = paymentsRes.items?.find((p: any) => p.status === "captured") || paymentsRes.items?.[0];
      if (paidPayment) {
        customerEmail = customerEmail || paidPayment.email || "";
        customerPhone = customerPhone || paidPayment.contact || "";
        paymentId = paidPayment.id;
      }
    } catch {
      // ignore
    }

    const existing = memoryOrders.find((o) => o.order_number.toUpperCase() === cleanNum);
    if (existing) {
      if (rzpOrder.status === "paid") {
        existing.status = "paid";
        existing.payment_status = "paid";
      }
      if (paymentId) existing.razorpay_payment_id = paymentId;
      existing.razorpay_order_id = rzpOrder.id;
      saveOrdersToStorage();
      return existing;
    }

    const totalPayable = rzpOrder.amount / 100;
    const notes = rzpOrder.notes || {};
    let items: OrderItem[] = [];

    if (notes.itemsJson) {
      try {
        items = JSON.parse(notes.itemsJson);
      } catch {
        // fallback
      }
    }

    if (items.length === 0) {
      items = [
        {
          id: `item-${rzpOrder.id}`,
          product_id: "prod-curated",
          product_name: notes.itemsSummary || "Heart Comb",
          sku: "PP-HAIR-1022",
          unit_selling_price: totalPayable > 99 ? totalPayable - 99 : totalPayable,
          unit_supplier_cost: Math.round(totalPayable * 0.7),
          quantity: 1,
          total_price: totalPayable > 99 ? totalPayable - 99 : totalPayable,
          total_cost: Math.round(totalPayable * 0.7),
          image_url: "https://img101.mfrcdn.com/goods-pic/91aed1f747fc456fb5f13de43730f21c_w1440_q90.webp",
        },
      ];
    }

    const reconstructedOrder: Order = {
      id: `ord-${rzpOrder.id}`,
      order_number: cleanNum,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        house: notes.customerHouse || "501",
        street: notes.customerStreet || "l road",
        city: notes.customerCity || "bengaluru",
        state: notes.customerState || "Karnataka",
        pincode: notes.customerPincode || "421301",
        country: "India",
      },
      items,
      status: rzpOrder.status === "paid" ? "paid" : "pending_payment",
      payment_status: rzpOrder.status === "paid" ? "paid" : "unpaid",
      subtotal: totalPayable > 99 ? totalPayable - 99 : totalPayable,
      shipping_fee: totalPayable >= 999 ? 0 : 99,
      discount_amount: 0,
      total_payable: totalPayable,
      total_supplier_cost: Math.round(totalPayable * 0.7),
      total_contribution: 48.64,
      razorpay_order_id: rzpOrder.id,
      razorpay_payment_id: paymentId,
      created_at: new Date(rzpOrder.created_at * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryOrders.unshift(reconstructedOrder);
    saveOrdersToStorage();
    return reconstructedOrder;
  } catch (err) {
    console.error("Razorpay order sync error:", err);
    return null;
  }
}

export async function getOrderByNumberAsync(orderNumber: string): Promise<Order | null> {
  const local = getOrderByNumber(orderNumber);
  if (local) return local;
  return await syncOrderFromRazorpay(orderNumber);
}

export function trackOrder(orderNumber: string, emailOrPhone: string): Order | null {
  const cleanNum = orderNumber.trim().toUpperCase();
  const cleanContact = emailOrPhone.trim().toLowerCase();

  const order = memoryOrders.find(
    (o) =>
      o.order_number.toUpperCase() === cleanNum &&
      (o.customer.email.toLowerCase() === cleanContact ||
        o.customer.phone.replace(/\s+/g, "").includes(cleanContact.replace(/\s+/g, "")))
  );

  return order || null;
}

// ==============================================================================
// ADMIN STORE REPOSITORY (FULL ACCESS)
// ==============================================================================

export function getAllProductsAdmin(): Product[] {
  return memoryProducts;
}

export function getProductByIdAdmin(id: string): Product | null {
  return memoryProducts.find((p) => p.id === id) || null;
}

export function saveProductAdmin(productData: Partial<Product> & { name: string; category: Product["category"]; subcategory: Product["subcategory"]; supplier_cost: number }): Product {
  const isUpdate = Boolean(productData.id);
  const now = new Date().toISOString();
  const markup = productData.custom_markup !== undefined ? productData.custom_markup : memorySettings.defaultMarkup;
  const sellingPrice = calculateSellingPrice(productData.supplier_cost, markup);

  if (isUpdate && productData.id) {
    const idx = memoryProducts.findIndex((p) => p.id === productData.id);
    if (idx !== -1) {
      memoryProducts[idx] = {
        ...memoryProducts[idx],
        ...productData,
        selling_price: sellingPrice,
        updated_at: now,
      };
      saveToFile(PRODUCTS_FILE, memoryProducts);
      return memoryProducts[idx];
    }
  }

  // Create new
  const id = `prod-${Date.now()}`;
  const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const sku = productData.sku || `PP-${productData.category.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const newProduct: Product = {
    id,
    sku,
    name: productData.name,
    slug,
    category: productData.category,
    subcategory: productData.subcategory,
    description: productData.description || "",
    supplier_cost: Number(productData.supplier_cost),
    selling_price: sellingPrice,
    custom_markup: productData.custom_markup,
    stock: productData.stock || 0,
    is_featured: productData.is_featured || false,
    is_bestseller: productData.is_bestseller || false,
    is_new: productData.is_new !== undefined ? productData.is_new : true,
    is_visible: productData.is_visible !== undefined ? productData.is_visible : true,
    tags: productData.tags || [],
    product_link: productData.product_link || productData.source_url,
    source_url: productData.source_url || productData.product_link,
    images: productData.images || [
      {
        id: `img-${Date.now()}`,
        image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
        alt_text: productData.name,
        display_order: 1,
        is_primary: true,
      },
    ],
    variants: productData.variants || [
      { id: `var-${Date.now()}`, title: "Default Style", sku: `${sku}-DEF`, stock: productData.stock || 0, attributes: {} },
    ],
    created_at: now,
    updated_at: now,
  };

  memoryProducts.unshift(newProduct);
  saveToFile(PRODUCTS_FILE, memoryProducts);
  return newProduct;
}

export function updateDefaultMarkupAdmin(newMarkup: number): { updatedCount: number; newMarkup: number } {
  memorySettings.defaultMarkup = Number(newMarkup);
  saveToFile(SETTINGS_FILE, memorySettings);

  // Recalculate selling price for all products that don't have a custom override
  let updatedCount = 0;
  memoryProducts = memoryProducts.map((p) => {
    if (p.custom_markup === null || p.custom_markup === undefined) {
      updatedCount++;
      return {
        ...p,
        selling_price: calculateSellingPrice(p.supplier_cost, memorySettings.defaultMarkup),
        updated_at: new Date().toISOString(),
      };
    }
    return p;
  });

  saveToFile(PRODUCTS_FILE, memoryProducts);
  return { updatedCount, newMarkup: memorySettings.defaultMarkup };
}

export function deleteProductAdmin(id: string): boolean {
  const initLen = memoryProducts.length;
  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  if (memoryProducts.length !== initLen) {
    saveToFile(PRODUCTS_FILE, memoryProducts);
    return true;
  }
  return false;
}

export function getAllOrdersAdmin(): Order[] {
  return memoryOrders;
}

export async function getAllOrdersAdminAsync(): Promise<Order[]> {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpayKeyId || !razorpaySecret) return memoryOrders;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Razorpay = require("razorpay");
    const rzp = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpaySecret });
    const res = await rzp.orders.all({ count: 50 });
    for (const rzpOrder of res.items || []) {
      const orderNum = rzpOrder.receipt || rzpOrder.notes?.orderNumber;
      if (orderNum && !memoryOrders.some((o) => o.order_number.toUpperCase() === String(orderNum).toUpperCase())) {
        await syncOrderFromRazorpay(String(orderNum));
      }
    }
  } catch (e) {
    console.error("Admin orders sync error:", e);
  }
  return memoryOrders;
}

export function updateOrderStatusAdmin(params: {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus?: "unpaid" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
  supplierOrderRef?: string;
  trackingNumber?: string;
  courierPartner?: string;
  actualShippingCost?: number;
}): Order | null {
  const idx = memoryOrders.findIndex((o) => o.order_number === params.orderNumber);
  if (idx === -1) return null;

  const current = memoryOrders[idx];
  const newPaymentStatus =
    params.paymentStatus || (params.status === "paid" ? "paid" : current.payment_status);

  const updated: Order = {
    ...current,
    status: params.status,
    payment_status: newPaymentStatus,
    razorpay_order_id:
      params.razorpayOrderId !== undefined ? params.razorpayOrderId : current.razorpay_order_id,
    razorpay_payment_id:
      params.razorpayPaymentId !== undefined ? params.razorpayPaymentId : current.razorpay_payment_id,
    razorpay_signature:
      params.razorpaySignature !== undefined ? params.razorpaySignature : current.razorpay_signature,
    payment_method:
      params.paymentMethod !== undefined ? params.paymentMethod : current.payment_method,
    supplier_order_ref:
      params.supplierOrderRef !== undefined ? params.supplierOrderRef : current.supplier_order_ref,
    tracking_number:
      params.trackingNumber !== undefined ? params.trackingNumber : current.tracking_number,
    courier_partner:
      params.courierPartner !== undefined ? params.courierPartner : current.courier_partner,
    actual_shipping_cost:
      params.actualShippingCost !== undefined ? params.actualShippingCost : current.actual_shipping_cost,
    tracking_url: params.trackingNumber
      ? `https://track.thepearlpetals.in/${params.trackingNumber}`
      : current.tracking_url,
    updated_at: new Date().toISOString(),
  };

  memoryOrders[idx] = updated;
  saveOrdersToStorage();
  return updated;
}

export function getAllSuppliersAdmin(): Supplier[] {
  return memorySuppliers;
}

export function saveSupplierAdmin(supplier: Omit<Supplier, "id" | "created_at"> & { id?: string }): Supplier {
  const isUpdate = Boolean(supplier.id);
  if (isUpdate && supplier.id) {
    const idx = memorySuppliers.findIndex((s) => s.id === supplier.id);
    if (idx !== -1) {
      memorySuppliers[idx] = {
        ...memorySuppliers[idx],
        ...supplier,
      };
      saveToFile(SUPPLIERS_FILE, memorySuppliers);
      return memorySuppliers[idx];
    }
  }

  const newSupplier: Supplier = {
    ...supplier,
    id: `sup-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  memorySuppliers.push(newSupplier);
  saveToFile(SUPPLIERS_FILE, memorySuppliers);
  return newSupplier;
}

export function addSubscriber(email: string): { success: boolean; code: string; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const exists = memorySubscribers.find((s) => s.email === cleanEmail);
  if (exists) {
    return { success: true, code: exists.code, message: "Welcome back! Your 10% welcome code is active." };
  }

  const code = "WELCOME10";
  memorySubscribers.push({
    email: cleanEmail,
    created_at: new Date().toISOString(),
    code,
  });
  saveToFile(SUBSCRIBERS_FILE, memorySubscribers);
  return { success: true, code, message: "Welcome to Petal & Pearl! Use code WELCOME10 for 10% off." };
}

export function getSubscribersAdmin() {
  return memorySubscribers;
}

export function getStoreSettings(): PricingSettings {
  return memorySettings;
}

export function getFinancialOverviewAdmin() {
  const totalOrders = memoryOrders.length;
  const paidOrders = memoryOrders.filter((o) => o.payment_status === "paid" || o.status !== "pending_payment");
  
  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total_payable, 0);
  const totalSupplierCost = paidOrders.reduce((acc, o) => acc + o.total_supplier_cost, 0);
  const totalCustomerShippingPaid = paidOrders.reduce((acc, o) => acc + o.shipping_fee, 0);
  
  // Expenses calculation
  const totalActualShippingExpenses = paidOrders.reduce((acc, o) => acc + (o.actual_shipping_cost || 65), 0);
  const totalGatewayCharges = Math.round(totalRevenue * 0.0236 * 100) / 100; // 2.36% (2% + 18% GST)
  const packagingExpenses = paidOrders.length * 25; // ₹25 per luxury boutique box
  
  const netContribution = Math.round(
    (totalRevenue - totalSupplierCost - totalActualShippingExpenses - totalGatewayCharges - packagingExpenses) * 100
  ) / 100;

  const contributionMarginPercent = totalRevenue > 0 
    ? Math.round((netContribution / totalRevenue) * 10000) / 100 
    : 0;

  return {
    totalOrders,
    paidOrdersCount: paidOrders.length,
    totalRevenue,
    totalSupplierCost,
    totalCustomerShippingPaid,
    totalActualShippingExpenses,
    totalGatewayCharges,
    packagingExpenses,
    netContribution,
    contributionMarginPercent,
    currentDefaultMarkup: memorySettings.defaultMarkup,
  };
}
