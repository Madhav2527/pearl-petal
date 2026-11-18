"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart-context";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    shippingFee,
    amountNeededForFreeShipping,
    freeShippingThreshold,
    totalPayable,
  } = useCart();

  if (!isOpen) return null;

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#EBE3D8] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-[#EBE3D8] flex items-center justify-between bg-ivory/40">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-taupe-dark" />
              <h2 className="font-serif text-xl tracking-wide text-charcoal">
                Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-charcoal/70 hover:text-charcoal transition-colors"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-ivory/60 px-6 py-3.5 border-b border-[#EBE3D8]">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-xs text-charcoal/80 font-sans">
                Add <span className="font-semibold text-charcoal">₹{amountNeededForFreeShipping}</span> more to unlock <span className="font-semibold text-charcoal">FREE Express Shipping</span>!
              </p>
            ) : (
              <p className="text-xs text-emerald-800 font-sans font-medium flex items-center gap-1.5">
                <span>✨ You have unlocked Complimentary Express Shipping!</span>
              </p>
            )}
            <div className="w-full bg-[#E3D9CC] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-taupe h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-ivory flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-taupe" />
                </div>
                <h3 className="font-serif text-xl text-charcoal mb-1">Your bag is empty</h3>
                <p className="text-xs text-charcoal/60 max-w-xs mb-6 font-sans">
                  Discover our delicate freshwater pearl jewelry and handmade accessories.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="btn-boutique-primary"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const img = item.product.images[0]?.image_url || "";
                const unitPrice = item.variant?.price_override ?? item.product.selling_price;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id || "default"}`}
                    className="flex gap-4 pb-6 border-b border-[#EBE3D8]/70"
                  >
                    <div className="relative w-20 h-24 bg-ivory/40 border border-[#EBE3D8] shrink-0 overflow-hidden">
                      {img && (
                        <Image
                          src={img}
                          alt={item.product.name}
                          fill
                          className="object-cover object-center"
                        />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/product/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-serif text-base text-charcoal hover:text-taupe transition-colors leading-snug line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id, item.variant?.id)}
                            className="text-taupe hover:text-rose-700 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.variant && (
                          <span className="text-[11px] text-taupe block mt-0.5 font-sans">
                            {item.variant.title}
                          </span>
                        )}

                        <span className="text-xs font-medium text-charcoal block mt-1 font-sans">
                          ₹{unitPrice}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-champagne bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)
                            }
                            className="p-1.5 text-charcoal hover:bg-ivory transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-sans font-medium text-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)
                            }
                            className="p-1.5 text-charcoal hover:bg-ivory transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-medium text-charcoal font-sans">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#EBE3D8] bg-ivory/30 space-y-4">
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between text-charcoal/80">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-charcoal/80">
                  <span>Shipping (India)</span>
                  <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-charcoal pt-2 border-t border-[#EBE3D8]">
                  <span>Total Payable</span>
                  <span>₹{totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-boutique-primary w-full text-center flex items-center justify-center gap-2 py-4"
                >
                  <span>Proceed to Prepaid Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="btn-boutique-secondary w-full text-center py-2.5 text-[11px]"
                >
                  View Full Bag
                </Link>
              </div>

              <p className="text-[10px] text-center text-taupe font-sans">
                Prepaid orders only &bull; BlueDart / Delhivery insured dispatch
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
