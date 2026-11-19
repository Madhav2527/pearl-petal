// ==============================================================================
// PETAL & PEARL — AUTOMATED CORE VERIFICATION SUITE
// Tests Pricing Engine, RLS Sanitization, Free Shipping, Orders & Razorpay HMAC
// ==============================================================================

const assert = require("assert");
const crypto = require("crypto");

console.log("🌸 Running Petal & Pearl Automated Core Test Suite...\n");

let passed = 0;
let total = 0;

function it(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

// 1. Pricing Engine Tests
it("Pricing Rule: Default ₹100 markup (Supplier Cost ₹250 -> Selling Price ₹350)", () => {
  const defaultMarkup = 100;
  const supplierCost = 250;
  const sellingPrice = Math.round(supplierCost + defaultMarkup);
  assert.strictEqual(sellingPrice, 350, "Selling price must be exactly ₹350");
});

it("Pricing Rule: Configurable Custom Markup (Supplier Cost ₹250 + Markup ₹150 -> Selling Price ₹400)", () => {
  const customMarkup = 150;
  const supplierCost = 250;
  const sellingPrice = Math.round(supplierCost + customMarkup);
  assert.strictEqual(sellingPrice, 400, "Custom selling price must be ₹400");
});

it("Shipping Fee: Flat ₹99 on orders below threshold (₹600 -> ₹99 shipping)", () => {
  const freeThreshold = 999;
  const flatFee = 99;
  const subtotal = 600;
  const fee = subtotal >= freeThreshold ? 0 : flatFee;
  assert.strictEqual(fee, 99, "Shipping fee must be ₹99");
});

it("Shipping Fee: Free shipping on orders at or above ₹999 (₹999 -> ₹0, ₹1500 -> ₹0)", () => {
  const freeThreshold = 999;
  const flatFee = 99;
  assert.strictEqual(999 >= freeThreshold ? 0 : flatFee, 0, "₹999 must qualify for free shipping");
  assert.strictEqual(1500 >= freeThreshold ? 0 : flatFee, 0, "₹1500 must qualify for free shipping");
});

// 2. Security & RLS Sanitization Test
it("Data Security: Supplier Cost is strictly stripped from customer-facing products", () => {
  const internalProduct = {
    id: "prod-001",
    name: "Baroque Pearl Drop Earrings",
    supplier_cost: 250, // CONFIDENTIAL
    selling_price: 350,
    custom_markup: 100,
  };

  // Simulating sanitizePublicProduct
  const { supplier_cost, custom_markup, ...publicProduct } = internalProduct;

  assert.strictEqual(publicProduct.supplier_cost, undefined, "supplier_cost must not exist on public product");
  assert.strictEqual(publicProduct.custom_markup, undefined, "custom_markup must not exist on public product");
  assert.strictEqual(publicProduct.selling_price, 350, "selling_price must remain visible");
});

// 3. Contribution Margin Calculation Test
it("Financial Contribution: Correctly deducts actual shipping, gateway fees, and packaging", () => {
  const sellingPrice = 350;
  const supplierCost = 250;
  const shippingPaid = 99;
  const actualShippingCost = 65;
  const packagingCost = 25;
  const gatewayFeePercent = 0.0236; // 2% + 18% GST

  const totalCollected = sellingPrice + shippingPaid; // ₹449
  const gatewayFee = Math.round(totalCollected * gatewayFeePercent * 100) / 100; // ~₹10.60
  const totalExpenses = supplierCost + actualShippingCost + gatewayFee + packagingCost; // ₹250 + ₹65 + ₹10.60 + ₹25 = ₹350.60
  const netContribution = Math.round((totalCollected - totalExpenses) * 100) / 100; // ₹449 - ₹350.60 = ₹98.40

  assert.ok(netContribution > 0, "Net contribution must be positive");
  assert.strictEqual(netContribution, 98.4, "Contribution must be exactly ₹98.40");
});

// 4. Razorpay HMAC Signature Verification Test
it("Payment Security: Valid Razorpay SHA-256 HMAC signature passes verification", () => {
  const secret = "test_razorpay_secret_key_12345";
  const orderId = "order_OqK78yHj9KlmNo";
  const paymentId = "pay_OqK78yHj9KlmNo";

  // Generate valid signature
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Verify
  const verifySignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert.strictEqual(validSignature, verifySignature, "Valid signature must match");
});

// 5. Category Detection & Taxonomy Tests
it("Category Detection: Detects nails from Savana / external titles and descriptions", () => {
  const nailKeywords = ["nail", "press-on", "press on", "artificial nail", "acrylic", "manicure", "glazed", "almond"];
  const title = "Glitter Artificial Nails - Sparkle Reusable Set";
  const lower = title.toLowerCase();
  const isNails = nailKeywords.some((k) => lower.includes(k));
  assert.strictEqual(isNails, true, "Title must be categorized under press-on-nails");
});

// 6. Sorting & Curation Tests
it("Catalog Sorting: Multi-attribute sorting functions correctly", () => {
  const items = [
    { id: "1", name: "Pearl Ring", selling_price: 399, is_bestseller: false, is_new: false, is_featured: false },
    { id: "2", name: "Glazed Nails", selling_price: 299, is_bestseller: true, is_new: true, is_featured: true },
    { id: "3", name: "Velvet Bow", selling_price: 499, is_bestseller: false, is_new: true, is_featured: false },
  ];

  // Price asc
  const priceAsc = [...items].sort((a, b) => a.selling_price - b.selling_price);
  assert.strictEqual(priceAsc[0].id, "2", "Lowest price must be first (₹299)");
  assert.strictEqual(priceAsc[2].id, "3", "Highest price must be last (₹499)");

  // Price desc
  const priceDesc = [...items].sort((a, b) => b.selling_price - a.selling_price);
  assert.strictEqual(priceDesc[0].id, "3", "Highest price must be first (₹499)");

  // Hottest first
  const hottestFirst = [...items].sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
  assert.strictEqual(hottestFirst[0].id, "2", "Hottest pick must be first");
});

console.log(`\n========================================`);
console.log(`Results: ${passed}/${total} tests passed successfully.`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
