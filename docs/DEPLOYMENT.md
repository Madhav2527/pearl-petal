# PETAL & PEARL — PRODUCTION DEPLOYMENT & SETUP GUIDE

> **Official Domain**: [https://thepearlpetals.in](https://thepearlpetals.in)  
> **Brand**: Petal & Pearl  
> **Tagline**: *Beauty in Every Little Detail*

---

## 1. Project Summary & Architecture

Petal & Pearl is built on a modern, production-grade e-commerce architecture:
- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom Pinterest-inspired boutique tokens (`#FFFFFF`, `#F1EAE0`, `#D8C5AB`, `#A18A70`, `#39342F`)
- **Typography**: `Cormorant Garamond` (Headings) & `DM Sans` (Body text)
- **Database & Auth**: Supabase PostgreSQL with 19 relational tables & Row Level Security (RLS)
- **Payment Gateway**: Razorpay (India Prepaid Payments: UPI, Cards, NetBanking)
- **Deployment Platform**: Vercel

---

## 2. Supabase Setup Instructions

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project named `petal-and-pearl`.
2. Choose the nearest region (e.g. `ap-south-1` Mumbai, India).
3. Note your **Project URL** and **API Keys** (`anon` public key and `service_role` secret key).

### Step 2: Apply Database Migration Script
1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Open and copy the entire contents of:
   `supabase/migrations/20261118000000_petal_and_pearl_schema.sql`
3. Paste it into the SQL Editor and click **Run**.
4. This will create all 19 relational tables, indexes, views, and strict Row Level Security (RLS) policies.

### Step 3: Configure Storage Bucket
1. Navigate to **Storage** in Supabase.
2. Create a public bucket named `product-images`.
3. Set public read access so product photography can be loaded efficiently via Next.js `<Image />`.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your production credentials:

```ini
# Site URL & Brand
NEXT_PUBLIC_SITE_URL=https://thepearlpetals.in
NEXT_PUBLIC_BRAND_NAME=Petal & Pearl
NEXT_PUBLIC_TAGLINE=Beauty in Every Little Detail
NEXT_PUBLIC_SUPPORT_EMAIL=hello@thepearlpetals.in

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Razorpay Live / Test Credentials
# Obtain from https://dashboard.razorpay.com/app/keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_key

# Admin Master Secret (Fallback authentication)
ADMIN_SECRET_KEY=your_secure_random_admin_password
```

---

## 4. Payment Gateway (Razorpay) Live Setup

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Submit your business KYC and activate your account.
3. Under **Settings &rarr; API Keys**, generate a **Key ID** and **Key Secret**.
4. Under **Settings &rarr; Webhooks**, add a webhook with URL:
   `https://thepearlpetals.in/api/webhooks/razorpay`
5. Select active events:
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
6. Copy the Webhook Secret and set it in `RAZORPAY_WEBHOOK_SECRET`.

> [!NOTE]
> When `RAZORPAY_KEY_ID` is left empty during local testing, Petal & Pearl safely operates in **Demo/Staging Mode** with a clear indicator banner on checkout, enabling end-to-end testing without real bank charges.

---

## 5. Vercel Deployment Instructions

1. Push your codebase to a private GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial production release of Petal & Pearl"
   git remote add origin https://github.com/yourusername/petal-and-pearl.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import the `petal-and-pearl` repository.
4. Framework Preset will auto-detect as **Next.js**.
5. In **Environment Variables**, paste the key-value pairs from your production `.env`.
6. Click **Deploy**.

---

## 6. GoDaddy DNS Configuration Instructions

> [!WARNING]
> Do not modify DNS records until Vercel prompts you with the exact values during domain verification.

Once your Vercel deployment completes:
1. In Vercel Project Settings, navigate to **Domains**.
2. Add your custom domain: `thepearlpetals.in` and `www.thepearlpetals.in`.
3. Vercel will present you with the required DNS records:
   - **Root Domain (`thepearlpetals.in`)**:
     - **Type**: `A`
     - **Name / Host**: `@`
     - **Value**: `76.76.21.21`
     - **TTL**: `600 seconds` (or Automatic)
   - **Subdomain (`www.thepearlpetals.in`)**:
     - **Type**: `CNAME`
     - **Name / Host**: `www`
     - **Value**: `cname.vercel-dns.com`
     - **TTL**: `600 seconds` (or Automatic)
4. Log in to **GoDaddy &rarr; Domain Control Center &rarr; thepearlpetals.in &rarr; Manage DNS**.
5. Add or update the exact `A` and `CNAME` records as specified above.
6. Allow 15–30 minutes for global DNS propagation. Vercel will automatically provision a free SSL certificate.

---

## 7. Manual Supplier Fulfilment SOP (Standard Operating Procedure)

1. **Order Alert**: When a customer places an order, payment is verified server-side.
2. **Review Order in Admin**: Open `/admin/orders` and view the pending order details.
3. **Verify Supplier Stock**: Confirm that the authorized wholesale supplier has stock at or below quoted cost.
4. **Place Supplier Purchase**: Manually place the order with the supplier and record the supplier PO reference (e.g. `SUP-AURA-98214`).
5. **Update Status to "Supplier Order Placed"**: Click **Manage** on `/admin/orders` and change status.
6. **Dispatch & Tracking**: Once the item is dispatched, record the courier partner (BlueDart/Delhivery) and AWB tracking number.
7. **Customer Tracking**: The order tracking status automatically updates on `/track-order`, providing transparency to the customer.
8. **Delivery Confirmation**: Once confirmed delivered by courier, mark status as `Delivered`.
