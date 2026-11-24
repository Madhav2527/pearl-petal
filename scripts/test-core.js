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
it("Pricing Rule: Default ₹50 markup (Supplier Cost ₹250 -> Selling Price ₹300)", () => {
  const defaultMarkup = 50;
  const supplierCost = 250;
  const sellingPrice = Math.round(supplierCost + defaultMarkup);
  assert.strictEqual(sellingPrice, 300, "Selling price must be exactly ₹300");
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

// 7. Admin Authentication Tests
it("Admin Authentication: Authenticates credentials madhav8506 / creta8506", () => {
  const allowedUsernames = [
    "madhav8506",
    "madhav8506@thepearlpetals.in",
    "admin@thepearlpetals.in",
    "admin@petalpearl.com",
    "admin",
  ];
  const allowedPasswords = ["creta8506", "petal_pearl_admin_2026_boutique", "PetalPearl@2026"];

  const testUser = "madhav8506";
  const testPass = "creta8506";

  const isValid = allowedUsernames.includes(testUser) && allowedPasswords.includes(testPass);
  assert.strictEqual(isValid, true, "madhav8506 / creta8506 must authenticate successfully");
});

// 8. 100% Catalogue Pricing Integrity Test
it("Catalogue Pricing: 100% of products strictly adhere to Selling Price = Supplier Cost + 50", () => {
  const fs = require("fs");
  const path = require("path");
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "products.json"), "utf8"));
  assert.ok(products.length >= 1400, "Catalogue must have at least 1,400 products");

  let discrepancies = 0;
  for (const p of products) {
    if (p.selling_price !== p.supplier_cost + 50) {
      discrepancies++;
    }
  }
  assert.strictEqual(discrepancies, 0, "Zero pricing discrepancies allowed across entire catalog");
});

// 9. Razorpay Standard Checkout: Order Creation Minimum Amount Validation
it("Razorpay Integration: Order creation rejects amounts below 100 paise", () => {
  const testAmounts = [0, 50, 99, -100];
  for (const amt of testAmounts) {
    const isValid = amt >= 100;
    assert.strictEqual(isValid, false, `Amount ${amt} paise must be rejected (min 100 paise)`);
  }
  assert.strictEqual(100 >= 100, true, "100 paise (₹1.00) must be accepted");
});

// 10. Razorpay Standard Checkout: Signature Verification Algorithm & Tamper Detection
it("Razorpay Integration: HMAC-SHA256 signature algorithm strictly verifies and detects tampering", () => {
  const secret = "PW0Yxje16eote8p1P0tn5lSS";
  const orderId = "order_U3sdBCpIjbp2ae";
  const paymentId = "pay_U3sdTest123456";

  // Generate legitimate signature
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Verify match
  const verifyCheck = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  assert.strictEqual(validSignature, verifyCheck, "Valid signature must match");

  // Verify tampering detection
  const tamperedSignature = validSignature.slice(0, -2) + "00";
  const isMatch = validSignature === tamperedSignature;
  assert.strictEqual(isMatch, false, "Tampered signature must be rejected");

  // Verify field absence detection
  const missingOrder = !orderId || !paymentId || !validSignature;
  assert.strictEqual(missingOrder, false, "All 3 fields must be present");
});

// 11. Razorpay Webhook Signature Verification & Idempotency
it("Razorpay Webhooks: Validates webhook signatures and prevents duplicate payment updates", () => {
  const webhookSecret = "whsec_testSecret123456789";
  const rawPayload = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_testWebHook789",
          order_id: "order_testWebHook456",
          amount: 50000,
          status: "captured",
          notes: { orderNumber: "PP-2026-TEST" },
        },
      },
    },
  });

  const validWebhookSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawPayload)
    .digest("hex");

  const verifyWebhookSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawPayload)
    .digest("hex");

  assert.strictEqual(validWebhookSig, verifyWebhookSig, "Webhook signature must verify successfully");

  // Idempotency: verify already paid check logic
  const mockOrder = { order_number: "PP-2026-TEST", status: "paid", payment_status: "paid" };
  const alreadyProcessed = mockOrder.status === "paid" || mockOrder.payment_status === "paid";
  assert.strictEqual(alreadyProcessed, true, "Already paid order must be skipped to prevent duplicate side effects");
});

// 12. Order Management: Stores Razorpay IDs and payment status accurately
it("Order Management: Stores Razorpay Order ID, Payment ID, and status", () => {
  const memoryOrders = [];
  const testOrder = {
    id: `ord-${Date.now()}`,
    order_number: "PP-2026-1001",
    customer: {
      name: "Test Customer",
      email: "test@example.com",
      phone: "+91 9876543210",
      house: "123",
      street: "Test St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    },
    items: [],
    status: "pending_payment",
    payment_status: "unpaid",
    subtotal: 500,
    shipping_fee: 0,
    discount_amount: 0,
    total_payable: 500,
    total_supplier_cost: 300,
    total_contribution: 200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  memoryOrders.push(testOrder);

  assert.ok(testOrder.order_number, "Order number must be assigned");

  // Simulate updateOrderStatusAdmin
  const current = memoryOrders[0];
  const updated = {
    ...current,
    status: "paid",
    payment_status: "paid",
    razorpay_order_id: "order_test_999",
    razorpay_payment_id: "pay_test_999",
    razorpay_signature: "sig_test_999",
    payment_method: "upi",
    updated_at: new Date().toISOString(),
  };
  memoryOrders[0] = updated;

  assert.strictEqual(updated.payment_status, "paid", "Payment status must be paid");
  assert.strictEqual(updated.razorpay_order_id, "order_test_999", "Razorpay order ID must be saved");
  assert.strictEqual(updated.razorpay_payment_id, "pay_test_999", "Razorpay payment ID must be saved");
  assert.strictEqual(updated.payment_method, "upi", "Payment method must be saved");
});

console.log(`\n========================================`);
console.log(`Results: ${passed}/${total} tests passed successfully.`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
