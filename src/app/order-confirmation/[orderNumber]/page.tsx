"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, PackageCheck, Truck, Compass, ArrowRight, Loader2, Mail } from "lucide-react";
import { Order } from "@/lib/types";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try reading from localStorage first (immediate client-side availability)
    try {
      const localData =
        localStorage.getItem(`pp_order_${orderNumber}`) ||
        localStorage.getItem("pp_last_order");
      if (localData) {
        const parsed: Order = JSON.parse(localData);
        if (
          !orderNumber ||
          parsed.order_number?.toUpperCase() === orderNumber.toUpperCase() ||
          !parsed.order_number
        ) {
          setOrder(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore local storage error
    }

    // 2. Fetch from backend track-order API (which syncs with Razorpay Live API)
    fetch(`/api/track-order?orderNumber=${encodeURIComponent(orderNumber)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.order) {
          setOrder(data.order);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-taupe mx-auto" />
        <h2 className="font-serif text-2xl text-charcoal">Confirming Your Order...</h2>
        <p className="text-xs text-charcoal/70 font-sans">
          Fetching live payment verification for order #{orderNumber}.
        </p>
      </div>
    );
  }

  if (order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-12">
        {/* Success Badge & Headline */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
            Order Confirmed &bull; Payment Received
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal">
            Thank you, {order.customer?.name ? order.customer.name.split(" ")[0] : "Valued Guest"}!
          </h1>

          <p className="text-xs sm:text-sm text-charcoal/80 font-sans max-w-lg mx-auto font-light">
            Your order <span className="font-medium text-charcoal">#{order.order_number || orderNumber}</span> has been securely placed and paid. We have dispatched a confirmation receipt to{" "}
            <span className="font-medium text-charcoal">{order.customer?.email || "your email address"}</span>.
          </p>
        </div>

        {/* Fulfillment Status Card */}
        <div className="bg-ivory/50 border border-champagne p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl text-charcoal border-b border-champagne/60 pb-3 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-taupe-dark" />
            <span>Boutique Fulfillment Status</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
            <div className="space-y-1">
              <span className="text-taupe uppercase tracking-wider block">Order Status</span>
              <span className="font-medium text-charcoal capitalize px-2 py-0.5 bg-white border border-champagne inline-block">
                {(order.status || "paid").replace("_", " ")}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-taupe uppercase tracking-wider block">Payment Verification</span>
              <span className="font-medium text-emerald-800">
                Verified &amp; Paid (Online Prepaid)
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-taupe uppercase tracking-wider block">Estimated Dispatch</span>
              <span className="font-medium text-charcoal">Within 24-48 business hours</span>
            </div>
          </div>

          <div className="bg-white p-4 border border-[#EBE3D8] text-xs font-sans text-charcoal/80 space-y-2">
            <p className="flex items-center gap-2 font-medium text-charcoal">
              <Truck className="w-4 h-4 text-taupe-dark" />
              What happens next?
            </p>
            <p className="text-[11px] leading-relaxed text-charcoal/70">
              Our boutique artisans are now assembling your order with gentle care. Each piece is checked for luster and structural integrity, placed into our rigid keepsake packaging, and handed over to express delivery.
            </p>
          </div>
        </div>

        {/* Order Itemized Summary */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white border border-[#EBE3D8] p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl text-charcoal border-b border-[#EBE3D8] pb-3">
              Items in this Parcel
            </h2>

            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between gap-4 pb-4 border-b border-[#EBE3D8]/60 text-xs font-sans"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-20 bg-ivory border border-[#EBE3D8] shrink-0 overflow-hidden">
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.product_name || "Adornment"}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif text-base text-charcoal">{item.product_name}</h3>
                      {item.variant_title && <p className="text-taupe">{item.variant_title}</p>}
                      <p className="text-taupe">Quantity: {item.quantity}</p>
                    </div>
                  </div>

                  <span className="font-medium text-charcoal text-sm">
                    ₹{item.total_price.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing totals */}
            <div className="space-y-2 text-xs font-sans pt-2 max-w-xs ml-auto">
              <div className="flex justify-between text-charcoal/70">
                <span>Subtotal:</span>
                <span>₹{(order.subtotal || order.total_payable).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span>Shipping:</span>
                <span>{order.shipping_fee === 0 ? "FREE" : `₹${order.shipping_fee || 99}`}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-charcoal pt-2 border-t border-[#EBE3D8]">
                <span>Total Paid:</span>
                <span>₹{order.total_payable.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Delivery Address */}
            {order.customer && (
              <div className="border-t border-[#EBE3D8] pt-6 text-xs font-sans space-y-1">
                <span className="text-taupe uppercase tracking-wider block font-medium">
                  Delivery Address:
                </span>
                <p className="text-charcoal font-medium">{order.customer.name}</p>
                <p className="text-charcoal/80">
                  {order.customer.house}, {order.customer.street}
                </p>
                <p className="text-charcoal/80">
                  {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                </p>
                <p className="text-charcoal/80">Phone: {order.customer.phone}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={`/track-order?orderNumber=${order.order_number || orderNumber}`}
            className="btn-boutique-secondary w-full sm:w-auto px-6 py-3.5 flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-taupe" />
            <span>Track Live Status</span>
          </Link>
          <Link
            href="/shop"
            className="btn-boutique-primary w-full sm:w-auto px-6 py-3.5 flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Fallback state if order lookup takes longer
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
        Payment Received &bull; Order Logged
      </span>

      <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
        Thank you for your order!
      </h1>

      <p className="text-xs sm:text-sm text-charcoal/80 font-sans max-w-md mx-auto">
        Your order <span className="font-medium text-charcoal">#{orderNumber}</span> has been confirmed. Our boutique concierge is preparing your shipment.
      </p>

      <div className="p-4 bg-ivory/60 border border-champagne text-xs font-sans text-charcoal/70 flex items-center justify-center gap-2 max-w-md mx-auto">
        <Mail className="w-4 h-4 text-taupe" />
        <span>Questions about your parcel? Email us at hello@thepearlpetals.in</span>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <Link href={`/track-order?orderNumber=${orderNumber}`} className="btn-boutique-secondary">
          Track Order
        </Link>
        <Link href="/shop" className="btn-boutique-primary">
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
