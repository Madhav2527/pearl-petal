-- ==============================================================================
-- PETAL & PEARL — PRODUCTION SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY
-- Domain: https://thepearlpetals.in
-- Brand: Petal & Pearl
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STORE SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    default_markup NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    free_shipping_threshold NUMERIC(10, 2) NOT NULL DEFAULT 999.00,
    flat_shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 99.00,
    announcement_bar_text TEXT NOT NULL DEFAULT 'Complimentary boutique packaging on all prepaid orders | Free shipping over ₹999',
    is_live_payments_enabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROFILES (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ADMIN USERS (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'fulfilment_manager')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CATEGORIES & SUBCATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

-- 6. SUPPLIERS (With Resale Authorization Tracking)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    resale_permission_status TEXT NOT NULL DEFAULT 'pending_agreement' 
        CHECK (resale_permission_status IN ('verified_wholesale', 'pending_agreement', 'not_authorized')),
    agreement_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRODUCTS (Dynamic Pricing Engine)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    supplier_cost NUMERIC(10, 2) NOT NULL CHECK (supplier_cost >= 0),
    selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= supplier_cost),
    custom_markup NUMERIC(10, 2) DEFAULT NULL,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_bestseller BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    price_override NUMERIC(10, 2) DEFAULT NULL,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SUPPLIER PRODUCTS (Internal Catalogue Tracking)
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_sku TEXT,
    supplier_product_url TEXT,
    supplier_quoted_price NUMERIC(10, 2) NOT NULL,
    lead_time_days INT DEFAULT 3,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    current_stock INT NOT NULL DEFAULT 0,
    reserved_stock INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    reorder_status TEXT DEFAULT 'normal' CHECK (reorder_status IN ('normal', 'low', 'reorder_placed')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CARTS & CART ITEMS
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_addition NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_house TEXT NOT NULL,
    shipping_street TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    shipping_country TEXT NOT NULL DEFAULT 'India',
    status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
        status IN (
            'pending_payment',
            'paid',
            'processing',
            'supplier_order_placed',
            'shipped',
            'delivered',
            'cancelled',
            'refund_pending',
            'refunded'
        )
    ),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (
        payment_status IN ('unpaid', 'paid', 'failed', 'refunded')
    ),
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_payable NUMERIC(10, 2) NOT NULL,
    total_supplier_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_contribution NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    customer_notes TEXT,
    internal_admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_title TEXT,
    sku TEXT NOT NULL,
    unit_selling_price NUMERIC(10, 2) NOT NULL,
    unit_supplier_cost NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. PAYMENTS (Razorpay Signature Verification Tracking)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL DEFAULT 'razorpay',
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    error_reason TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. SHIPMENTS (Fulfilment & Tracking)
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    courier_partner TEXT NOT NULL DEFAULT 'BlueDart/Delhivery',
    tracking_number TEXT,
    tracking_url TEXT,
    dispatch_date TIMESTAMPTZ,
    estimated_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    shipping_cost_incurred NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'manifested' CHECK (status IN ('manifested', 'in_transit', 'out_for_delivery', 'delivered', 'returned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. REFUNDS
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    refund_amount NUMERIC(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    gateway_refund_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    initiated_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. EXPENSES (Actual Fulfilment Expenses for Profit Auditing)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    expense_type TEXT NOT NULL CHECK (
        expense_type IN ('supplier_cost', 'packaging', 'courier_shipping', 'payment_gateway_fee', 'gst_tax', 'refund', 'other')
    ),
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
    source TEXT DEFAULT 'homepage_footer',
    discount_code_issued TEXT DEFAULT 'WELCOME10',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);

-- ==============================================================================
-- PUBLIC SECURE VIEW (OMITTING SUPPLIER COSTS TO THE PUBLIC)
-- ==============================================================================
CREATE OR REPLACE VIEW public_products AS
SELECT
    id,
    sku,
    name,
    slug,
    category_id,
    subcategory_id,
    description,
    selling_price,
    stock,
    is_featured,
    is_bestseller,
    is_new,
    is_visible,
    tags,
    created_at,
    updated_at
FROM products
WHERE is_visible = true;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories & Subcategories: Public can read, Admins can write
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin());

CREATE POLICY "Public can view subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can manage subcategories" ON subcategories FOR ALL USING (is_admin());

-- Store Settings: Public can read, Admins can edit
CREATE POLICY "Public can view store settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update store settings" ON store_settings FOR ALL USING (is_admin());

-- Products & Product Images: Public can view visible, Admins can do all
CREATE POLICY "Public can view visible products" ON products FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin());

CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON product_images FOR ALL USING (is_admin());

CREATE POLICY "Public can view product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage product variants" ON product_variants FOR ALL USING (is_admin());

-- Admin-only tables: suppliers, supplier_products, inventory, expenses
CREATE POLICY "Admin only access suppliers" ON suppliers FOR ALL USING (is_admin());
CREATE POLICY "Admin only access supplier_products" ON supplier_products FOR ALL USING (is_admin());
CREATE POLICY "Admin only access inventory" ON inventory FOR ALL USING (is_admin());
CREATE POLICY "Admin only access expenses" ON expenses FOR ALL USING (is_admin());
CREATE POLICY "Admin only access admin_users" ON admin_users FOR ALL USING (is_admin());

-- Carts: Users or sessions manage their own cart
CREATE POLICY "Users can manage own cart" ON carts FOR ALL USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR (session_id IS NOT NULL)
);

CREATE POLICY "Users can manage own cart items" ON cart_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND (
            (auth.uid() IS NOT NULL AND auth.uid() = carts.user_id) OR (carts.session_id IS NOT NULL)
        )
    )
);

-- Orders: Customers read own orders, Admin can view/edit all
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR is_admin()
);
CREATE POLICY "Allow order creation during checkout" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin());

CREATE POLICY "Customers can view own order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (
            (auth.uid() IS NOT NULL AND auth.uid() = orders.user_id) OR is_admin()
        )
    )
);
CREATE POLICY "Allow order items creation during checkout" ON order_items FOR INSERT WITH CHECK (true);

-- Payments & Shipments: Customers view own, Admins manage
CREATE POLICY "View payments for own orders" ON payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders WHERE orders.id = payments.order_id AND (
            (auth.uid() IS NOT NULL AND auth.uid() = orders.user_id) OR is_admin()
        )
    )
);
CREATE POLICY "Admins manage payments" ON payments FOR ALL USING (is_admin());

CREATE POLICY "View shipments for own orders" ON shipments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders WHERE orders.id = shipments.order_id AND (
            (auth.uid() IS NOT NULL AND auth.uid() = orders.user_id) OR is_admin()
        )
    )
);
CREATE POLICY "Admins manage shipments" ON shipments FOR ALL USING (is_admin());

-- Newsletter: Anyone can subscribe, Admin can view
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view newsletter subscribers" ON newsletter_subscribers FOR SELECT USING (is_admin());

-- ==============================================================================
-- INITIAL STORE SETTINGS ROW
-- ==============================================================================
INSERT INTO store_settings (default_markup, free_shipping_threshold, flat_shipping_fee, announcement_bar_text, is_live_payments_enabled)
VALUES (100.00, 999.00, 99.00, 'Complimentary boutique packaging on all prepaid orders | Free shipping over ₹999', false)
ON CONFLICT DO NOTHING;
