import Link from "next/link";
import {
  getFinancialOverviewAdmin,
  getAllOrdersAdmin,
  getAllProductsAdmin,
} from "@/lib/store";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Percent,
  Truck,
  ArrowRight,
  Package,
  Sparkles,
} from "lucide-react";

export default function AdminOverviewPage() {
  const financial = getFinancialOverviewAdmin();
  const allOrders = getAllOrdersAdmin();
  const allProducts = getAllProductsAdmin();

  const bestsellers = allProducts.filter((p) => p.is_bestseller).slice(0, 5);
  const recentOrders = allOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3D8] pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
            Executive Summary
          </span>
          <h1 className="font-serif text-3xl text-charcoal">
            Store Performance &amp; Contribution
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="btn-boutique-primary py-2.5 px-4 text-xs">
            + Add Product
          </Link>
          <Link href="/admin/settings" className="btn-boutique-secondary py-2.5 px-4 text-xs">
            Pricing Settings
          </Link>
        </div>
      </div>

      {/* 1. FINANCIAL METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Gross Revenue */}
        <div className="bg-white border border-[#EBE3D8] p-5 space-y-2">
          <div className="flex items-center justify-between text-taupe">
            <span className="text-[11px] uppercase tracking-wider font-sans font-medium">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-taupe-dark" />
          </div>
          <p className="font-serif text-2xl text-charcoal font-semibold">
            ₹{financial.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-charcoal/60 font-sans">
            From {financial.paidOrdersCount} paid boutique transactions
          </p>
        </div>

        {/* Total Supplier Costs */}
        <div className="bg-white border border-[#EBE3D8] p-5 space-y-2">
          <div className="flex items-center justify-between text-taupe">
            <span className="text-[11px] uppercase tracking-wider font-sans font-medium">Supplier Cost</span>
            <Package className="w-4 h-4 text-taupe-dark" />
          </div>
          <p className="font-serif text-2xl text-charcoal font-semibold">
            ₹{financial.totalSupplierCost.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-charcoal/60 font-sans">
            Strictly confidential &bull; Kept private via RLS
          </p>
        </div>

        {/* Total Fulfillment Expenses (Shipping + Gateway) */}
        <div className="bg-white border border-[#EBE3D8] p-5 space-y-2">
          <div className="flex items-center justify-between text-taupe">
            <span className="text-[11px] uppercase tracking-wider font-sans font-medium">Operating Expenses</span>
            <Truck className="w-4 h-4 text-taupe-dark" />
          </div>
          <p className="font-serif text-2xl text-charcoal font-semibold">
            ₹{(financial.totalActualShippingExpenses + financial.totalGatewayCharges + financial.packagingExpenses).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-charcoal/60 font-sans">
            Shipping (₹{financial.totalActualShippingExpenses}) + Gateway (₹{financial.totalGatewayCharges}) + Boxes (₹{financial.packagingExpenses})
          </p>
        </div>

        {/* Net Contribution Margin */}
        <div className="bg-ivory/60 border border-champagne p-5 space-y-2">
          <div className="flex items-center justify-between text-taupe-dark">
            <span className="text-[11px] uppercase tracking-wider font-sans font-medium">Net Contribution</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-serif text-2xl text-charcoal font-semibold">
            ₹{financial.netContribution.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-sans font-medium">
            <Percent className="w-3.5 h-3.5" />
            <span>Margin: {financial.contributionMarginPercent}%</span>
          </div>
        </div>

      </div>

      {/* 2. PRICING ENGINE LIVE RULE BANNER */}
      <div className="bg-white border border-champagne p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-taupe-dark shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-charcoal">
              Active Dynamic Pricing Engine Rule
            </h3>
            <p className="text-xs text-charcoal/70 font-sans">
              Default Markup: <strong className="text-charcoal font-semibold">₹{financial.currentDefaultMarkup}</strong> &bull; Selling Price = Verified Supplier Cost + ₹{financial.currentDefaultMarkup}.
            </p>
          </div>
        </div>

        <Link
          href="/admin/settings"
          className="btn-boutique-secondary py-2 px-4 text-xs font-sans whitespace-nowrap"
        >
          Adjust Markup Rule &rarr;
        </Link>
      </div>

      {/* 3. RECENT ORDERS & BESTSELLERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#EBE3D8] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE3D8] pb-3">
            <h2 className="font-serif text-xl text-charcoal">Recent Boutique Orders</h2>
            <Link href="/admin/orders" className="text-xs uppercase tracking-wider text-taupe hover:text-charcoal font-sans">
              View All ({allOrders.length})
            </Link>
          </div>

          <div className="divide-y divide-[#EBE3D8]/60 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-taupe text-xs font-sans">
                No customer orders placed yet. Live orders will appear here automatically when shoppers check out.
              </div>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-4 text-xs font-sans">
                  <div>
                    <span className="font-medium text-charcoal block">#{ord.order_number}</span>
                    <span className="text-charcoal/60">{ord.customer.name} &bull; {ord.customer.city}</span>
                  </div>

                  <div className="text-center">
                    <span className="inline-block px-2.5 py-0.5 bg-ivory border border-champagne text-[10px] uppercase tracking-wider text-charcoal font-medium">
                      {ord.status.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-taupe block mt-0.5">
                      {ord.payment_status === "paid" ? "Paid (Prepaid)" : "Pending"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-medium text-charcoal block">₹{ord.total_payable.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-emerald-800">
                      Profit: +₹{ord.total_contribution}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bestselling Products (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#EBE3D8] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE3D8] pb-3">
            <h2 className="font-serif text-xl text-charcoal">Bestselling Pieces</h2>
            <Link href="/admin/products" className="text-xs uppercase tracking-wider text-taupe hover:text-charcoal font-sans">
              Manage
            </Link>
          </div>

          <div className="divide-y divide-[#EBE3D8]/60">
            {bestsellers.length === 0 ? (
              <div className="py-8 text-center text-taupe text-xs font-sans space-y-2">
                <p>No products in catalogue yet.</p>
                <Link href="/admin/products" className="btn-boutique-primary py-1.5 px-3 text-[11px] inline-block">
                  ⚡ Quick Add by Link
                </Link>
              </div>
            ) : (
              bestsellers.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs font-sans">
                  <div>
                    <p className="font-serif text-sm text-charcoal line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-taupe uppercase tracking-wider">
                      {item.category} &bull; Stock: {item.stock}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-medium text-charcoal block">₹{item.selling_price}</span>
                    <span className="text-[10px] text-taupe block">
                      Cost: ₹{item.supplier_cost}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
