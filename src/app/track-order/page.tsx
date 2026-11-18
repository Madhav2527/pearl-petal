"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Order, OrderStatus } from "@/lib/types";
import { Compass, CheckCircle2, Clock, Truck, Package, AlertCircle } from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get("orderNumber") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setHasSearched(true);

    if (!orderNumber.trim()) {
      setError("Please provide an order number (e.g. PP-2026-1001).");
      return;
    }

    try {
      const res = await fetch(
        `/api/track-order?orderNumber=${encodeURIComponent(orderNumber.trim())}&contact=${encodeURIComponent(
          emailOrPhone.trim()
        )}`
      );
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setError("No matching order found. Please check your order number and contact detail.");
      }
    } catch {
      setError("Failed to fetch order tracking status.");
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch();
    }
  }, [initialOrderNumber]);

  // Order status chronological progression
  const STEPS: { key: OrderStatus; label: string; desc: string }[] = [
    { key: "paid", label: "Payment Verified", desc: "Order confirmed & reserved" },
    { key: "processing", label: "Artisan Quality Check", desc: "Pieces inspected & prepped" },
    { key: "supplier_order_placed", label: "Supplier Allocation", desc: "Handcrafted batch reserved" },
    { key: "shipped", label: "Dispatched", desc: "Handed to BlueDart/Delhivery" },
    { key: "delivered", label: "Delivered", desc: "Safely received at address" },
  ];

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const orderIndex = STEPS.findIndex((s) => s.key === currentStatus);
    const thisIndex = STEPS.findIndex((s) => s.key === stepKey);

    if (currentStatus === "cancelled" || currentStatus === "refunded") {
      return "inactive";
    }
    if (thisIndex <= orderIndex) {
      return "completed";
    }
    if (thisIndex === orderIndex + 1) {
      return "current";
    }
    return "upcoming";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Editorial Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
          Boutique Dispatch &amp; Tracking
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
          Track Your Keepsake Parcel
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70 font-sans max-w-md mx-auto font-light">
          Enter your order number and email or phone number to check current dispatch progress and live courier status.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearch} className="bg-white border border-[#EBE3D8] p-6 sm:p-8 space-y-4 max-w-xl mx-auto shadow-sm">
        <div className="space-y-1 text-xs font-sans">
          <label className="block text-charcoal font-medium uppercase tracking-wider">
            Order Number *
          </label>
          <input
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. PP-2026-1001"
            className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal uppercase focus:outline-none focus:border-charcoal"
          />
        </div>

        <div className="space-y-1 text-xs font-sans">
          <label className="block text-charcoal font-medium uppercase tracking-wider">
            Email or 10-Digit Mobile Number
          </label>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="e.g. customer@example.com or 9876543210"
            className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
          />
        </div>

        <button
          type="submit"
          className="btn-boutique-primary w-full py-3.5 flex items-center justify-center gap-2"
        >
          <Compass className="w-4 h-4 text-champagne" />
          <span>Track Parcel</span>
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto bg-rose-50 border border-rose-200 p-4 text-xs font-sans text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Tracking Progress Card */}
      {order && (
        <div className="bg-white border border-[#EBE3D8] p-6 sm:p-10 space-y-8 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3D8] pb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-taupe font-sans block">
                Order Reference
              </span>
              <h2 className="font-serif text-2xl text-charcoal font-medium">
                #{order.order_number}
              </h2>
              <span className="text-xs text-charcoal/70 font-sans mt-0.5 block">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-wider text-taupe font-sans block">Current Status</span>
              <span className="inline-block px-3 py-1 bg-ivory border border-champagne text-xs uppercase tracking-wider font-medium text-charcoal capitalize mt-1">
                {order.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Courier Dispatch Details */}
          {order.tracking_number && (
            <div className="bg-ivory/50 border border-champagne p-5 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans">
              <div className="space-y-1">
                <p className="font-medium text-charcoal flex items-center gap-2">
                  <Truck className="w-4 h-4 text-taupe-dark" />
                  Courier Partner: {order.courier_partner || "BlueDart Express"}
                </p>
                <p className="text-charcoal/70">
                  Tracking AWB: <span className="font-mono font-medium text-charcoal">{order.tracking_number}</span>
                </p>
              </div>

              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-boutique-primary py-2 px-4 text-[11px] shrink-0"
                >
                  Live Courier Tracking &rarr;
                </a>
              )}
            </div>
          )}

          {/* Step Timeline */}
          <div className="space-y-6 pt-2">
            <h3 className="font-serif text-lg text-charcoal">Fulfillment Journey</h3>

            <div className="relative border-l-2 border-champagne ml-4 pl-6 space-y-8">
              {STEPS.map((step) => {
                const stepState = getStepStatus(step.key, order.status);
                const isCompleted = stepState === "completed";
                const isCurrent = stepState === "current";

                return (
                  <div key={step.key} className="relative">
                    {/* Step Icon Indicator */}
                    <div
                      className={`absolute -left-[33px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-sans border-2 bg-white ${
                        isCompleted
                          ? "border-emerald-600 text-emerald-600"
                          : isCurrent
                          ? "border-charcoal text-charcoal ring-4 ring-ivory"
                          : "border-gray-300 text-gray-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <Clock className="w-3.5 h-3.5 text-taupe-dark" />
                      ) : (
                        <Package className="w-3 h-3" />
                      )}
                    </div>

                    <div>
                      <h4
                        className={`font-serif text-base ${
                          isCompleted || isCurrent ? "text-charcoal font-medium" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-xs text-charcoal/60 font-sans mt-0.5 font-light">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Recipient Snapshot */}
          <div className="border-t border-[#EBE3D8] pt-6 flex flex-col sm:flex-row justify-between gap-6 text-xs font-sans">
            <div>
              <span className="text-taupe uppercase tracking-wider block font-medium">Destination:</span>
              <p className="text-charcoal font-medium">{order.customer.name}</p>
              <p className="text-charcoal/70">{order.customer.city}, {order.customer.state} ({order.customer.pincode})</p>
            </div>

            <div>
              <span className="text-taupe uppercase tracking-wider block font-medium">Parcel Contents:</span>
              <p className="text-charcoal font-medium">{order.items.length} {order.items.length === 1 ? "keepsake" : "keepsakes"}</p>
              <p className="text-charcoal/70">Total value: ₹{order.total_payable.toLocaleString("en-IN")}</p>
            </div>
          </div>

        </div>
      )}

      {/* Support Helper */}
      <div className="text-center text-xs text-charcoal/70 font-sans space-y-1">
        <p>Need assistance with your dispatch or address adjustments?</p>
        <p>
          Write to our boutique concierge at{" "}
          <a href="mailto:hello@thepearlpetals.in" className="text-charcoal underline underline-offset-4 hover:text-taupe">
            hello@thepearlpetals.in
          </a>
        </p>
      </div>

    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-sans text-taupe">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
