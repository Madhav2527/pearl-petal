"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Sparkles } from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    shippingFee,
    amountNeededForFreeShipping,
    freeShippingThreshold,
    totalPayable,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "WELCOME10") {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid code. Use WELCOME10 for 10% off your first order.");
    }
  };

  const discountAmount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const finalPayable = Math.max(0, totalPayable - discountAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-ivory flex items-center justify-center mx-auto border border-champagne">
          <Sparkles className="w-8 h-8 text-taupe-dark" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-charcoal/70 font-sans max-w-md mx-auto font-light">
          Your keepsake collection awaits. Explore our delicate pearls, silk bows, and everyday boutique treasures.
        </p>
        <div className="pt-2">
          <Link href="/shop" className="btn-boutique-primary">
            Explore The Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      
      {/* Page Title */}
      <div className="border-b border-[#EBE3D8] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block mb-1">
          Review Your Selection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
          Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Free Shipping Alert Bar */}
          <div className="bg-ivory/60 border border-champagne/60 p-4">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-xs text-charcoal/80 font-sans">
                Add <span className="font-semibold text-charcoal">₹{amountNeededForFreeShipping}</span> more to unlock <span className="font-semibold text-charcoal">FREE Express Shipping</span> across India.
              </p>
            ) : (
              <p className="text-xs text-emerald-800 font-sans font-medium">
                ✨ Complimentary Boutique Express Shipping Unlocked!
              </p>
            )}
            <div className="w-full bg-[#E3D9CC] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-taupe h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%` }}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-6">
            {items.map((item) => {
              const img = item.product.images[0]?.image_url || "";
              const unitPrice = item.variant?.price_override ?? item.product.selling_price;
              const lineTotal = unitPrice * item.quantity;

              return (
                <div
                  key={`${item.product.id}-${item.variant?.id || "default"}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 bg-white border border-[#EBE3D8] hover:border-champagne transition-all"
                >
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-24 bg-ivory shrink-0 border border-[#EBE3D8] overflow-hidden">
                      {img && (
                        <Image
                          src={img}
                          alt={item.product.name}
                          fill
                          className="object-cover object-center"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-taupe font-sans block">
                        {item.product.category.replace("-", " ")}
                      </span>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-serif text-lg text-charcoal hover:text-taupe transition-colors leading-snug line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <span className="text-xs text-taupe block font-sans">
                          Option: {item.variant.title}
                        </span>
                      )}
                      <span className="text-xs font-medium text-charcoal font-sans block sm:hidden">
                        ₹{unitPrice}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EBE3D8]">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-champagne bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                        className="p-2 text-charcoal hover:bg-ivory transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-sans font-medium text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                        className="p-2 text-charcoal hover:bg-ivory transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="font-sans text-sm font-medium text-charcoal">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id, item.variant?.id)}
                      className="text-taupe hover:text-rose-700 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest font-sans text-charcoal hover:text-taupe underline underline-offset-4"
            >
              &larr; Continue Shopping
            </Link>
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 bg-white border border-[#EBE3D8] p-6 space-y-6">
          <h2 className="font-serif text-xl text-charcoal border-b border-[#EBE3D8] pb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs font-sans text-charcoal/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between">
              <span>Estimated Shipping (India)</span>
              <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
            </div>

            {promoApplied && (
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Welcome Discount (10%)</span>
                <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="border-t border-[#EBE3D8] pt-3 flex justify-between text-base font-medium text-charcoal">
              <span>Total Payable</span>
              <span>₹{finalPayable.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-[10px] text-taupe text-right">Includes all taxes</p>
          </div>

          {/* Promo code form */}
          <form onSubmit={handleApplyPromo} className="border-t border-[#EBE3D8] pt-4 space-y-2">
            <label className="text-xs uppercase tracking-wider font-sans text-charcoal block">
              Promotional Code
            </label>
            <div className="flex">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="e.g. WELCOME10"
                className="bg-ivory/50 border border-champagne px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-charcoal flex-1 uppercase"
              />
              <button
                type="submit"
                className="bg-charcoal text-white text-xs uppercase tracking-wider px-4 py-2 font-sans hover:bg-taupe-dark transition-colors"
              >
                Apply
              </button>
            </div>
            {promoApplied && (
              <p className="text-xs text-emerald-700">✓ 10% Welcome discount applied!</p>
            )}
            {promoError && (
              <p className="text-xs text-rose-700">{promoError}</p>
            )}
          </form>

          {/* Proceed Button */}
          <div className="space-y-3 pt-2">
            <Link
              href="/checkout"
              className="btn-boutique-primary w-full py-4 text-center flex items-center justify-center gap-2"
            >
              <span>Proceed to Prepaid Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-3 border-t border-[#EBE3D8] space-y-2 text-[11px] text-taupe font-sans">
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-taupe-dark shrink-0" />
                Prepaid only &bull; Secured with 256-bit encryption
              </p>
              <p className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-taupe-dark shrink-0" />
                Dispatched in tamper-evident boutique box
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
