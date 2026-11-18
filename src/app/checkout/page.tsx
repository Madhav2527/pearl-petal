"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Lock, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, totalPayable, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    house: "",
    street: "",
    city: "",
    state: "Karnataka",
    pincode: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-3xl text-charcoal">Your bag is empty</h1>
        <p className="text-xs text-charcoal/70 font-sans">
          Please add items to your shopping bag before proceeding to checkout.
        </p>
        <Link href="/shop" className="btn-boutique-primary inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setDemoNotice(null);

    // Validate Indian PIN code (6 digits)
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setErrorMessage("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    // Validate phone number (10 digits)
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create order on server
      const payload = {
        customer: {
          ...formData,
          phone: `+91 ${cleanPhone.slice(-10)}`,
          country: "India" as const,
        },
        items: items.map((i) => ({
          productId: i.product.id,
          variantId: i.variant?.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initialize checkout.");
      }

      const { orderNumber, razorpayOrderId, isLivePayment } = orderData;

      // 2. Check if Live Razorpay is active
      if (isLivePayment && typeof window !== "undefined") {
        // Load Razorpay Standard Modal script dynamically if not present
        if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
          await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = resolve;
            document.body.appendChild(script);
          });
        }

        interface RzpResponse {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: "INR",
          name: "Petal & Pearl",
          description: `Order ${orderNumber} - Prepaid Boutique Adornments`,
          order_id: razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: cleanPhone,
          },
          theme: {
            color: "#39342F",
          },
          handler: async function (response: RzpResponse) {
            // Server verification
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderNumber,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              clearCart();
              router.push(`/order-confirmation/${orderNumber}`);
            } else {
              setErrorMessage("Payment verification failed. Please contact boutique support.");
              setIsLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
            },
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // 3. Staging / Test fallback mode with clear UI indicator
      setDemoNotice("Live payment gateway keys not configured in .env.local. Simulating authorized test verification...");
      
      const verifyRes = await fetch("/api/checkout/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          razorpayOrderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: "simulated_valid_test_signature",
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        setTimeout(() => {
          clearCart();
          router.push(`/order-confirmation/${orderNumber}`);
        }, 1500);
      } else {
        throw new Error("Simulation verification failed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong during checkout.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      <div className="flex items-center justify-between border-b border-[#EBE3D8] pb-5">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-sans text-taupe hover:text-charcoal mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Bag
          </Link>
          <h1 className="font-serif text-3xl text-charcoal">Prepaid Checkout</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-sans text-taupe bg-ivory px-3 py-1.5 border border-champagne">
          <Lock className="w-3.5 h-3.5 text-taupe-dark" />
          <span>256-bit Encrypted</span>
        </div>
      </div>

      {/* Mandatory Prepaid Notice */}
      <div className="bg-ivory/80 border border-champagne p-4 text-xs font-sans text-charcoal/90 space-y-1">
        <div className="flex items-center gap-2 font-medium text-charcoal">
          <ShieldCheck className="w-4 h-4 text-taupe-dark shrink-0" />
          <span>Prepaid Orders Only &bull; Cash on Delivery (COD) Unavailable</span>
        </div>
        <p className="text-charcoal/70 pl-6 leading-relaxed">
          To maintain handcrafted boutique standards and preserve the pristine condition of delicate baroque pearls and ribbons, we only accept prepaid orders (UPI, NetBanking, Cards). Every parcel is sealed in a tamper-evident boutique box.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 p-4 text-xs font-sans text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {demoNotice && (
        <div className="bg-amber-50 border border-amber-200 p-4 text-xs font-sans text-amber-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-700" />
          <span>{demoNotice}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Shipping Form (8 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#EBE3D8] p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl text-charcoal border-b border-[#EBE3D8] pb-3">
            1. Shipping &amp; Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-charcoal font-medium uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Radhika Sen"
                className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-charcoal font-medium uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="For tracking & receipt"
                className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-charcoal font-medium uppercase tracking-wider">
                Mobile Number (+91) *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile"
                className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-charcoal font-medium uppercase tracking-wider">
                Flat, House, Building / Apartment Details *
              </label>
              <input
                type="text"
                name="house"
                required
                value={formData.house}
                onChange={handleInputChange}
                placeholder="e.g. Flat 304, Aster Heights"
                className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-charcoal font-medium uppercase tracking-wider">
                Street Address, Colony / Landmark *
              </label>
              <input
                type="text"
                name="street"
                required
                value={formData.street}
                onChange={handleInputChange}
                placeholder="e.g. 5th Cross, Lavelle Road"
                className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-charcoal font-medium uppercase tracking-wider">
                City / District *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g. Bengaluru"
                className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-charcoal font-medium uppercase tracking-wider">
                PIN Code *
              </label>
              <input
                type="text"
                name="pincode"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="6-digit PIN code"
                className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-charcoal font-medium uppercase tracking-wider">
                State / Union Territory *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal cursor-pointer"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-charcoal font-medium uppercase tracking-wider">
                Country
              </label>
              <input
                type="text"
                disabled
                value="India (Domestic)"
                className="w-full bg-gray-100 border border-gray-300 p-3 text-xs text-charcoal/70 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#EBE3D8] space-y-2">
            <h2 className="font-serif text-xl text-charcoal">
              2. Payment Method
            </h2>
            <div className="border border-champagne bg-ivory/30 p-4 space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between font-medium text-charcoal">
                <span>Online Prepaid (Razorpay Secure Gateway)</span>
                <span className="text-[10px] bg-charcoal text-white px-2 py-0.5 uppercase tracking-widest">
                  Verified
                </span>
              </div>
              <p className="text-charcoal/70 leading-relaxed text-[11px]">
                Instant UPI (Google Pay, PhonePe, Paytm), All Major Debit/Credit Cards (Visa, MasterCard, RuPay), and NetBanking.
              </p>
            </div>
          </div>

        </div>

        {/* Order Summary & Pay Action (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#EBE3D8] p-6 space-y-6">
          <h2 className="font-serif text-xl text-charcoal border-b border-[#EBE3D8] pb-3">
            Order Review
          </h2>

          {/* Mini items list */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((i) => {
              const unitPrice = i.variant?.price_override ?? i.product.selling_price;
              const img = i.product.images[0]?.image_url || "";
              return (
                <div key={`${i.product.id}-${i.variant?.id}`} className="flex items-center gap-3 text-xs font-sans pb-3 border-b border-[#EBE3D8]/60">
                  <div className="relative w-12 h-14 bg-ivory border border-[#EBE3D8] shrink-0 overflow-hidden">
                    {img && <Image src={img} alt={i.product.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-sm text-charcoal line-clamp-1">{i.product.name}</p>
                    {i.variant && <span className="text-[10px] text-taupe">{i.variant.title}</span>}
                    <p className="text-taupe">Qty: {i.quantity}</p>
                  </div>
                  <span className="font-medium text-charcoal">₹{(unitPrice * i.quantity).toLocaleString("en-IN")}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 text-xs font-sans border-t border-[#EBE3D8] pt-4">
            <div className="flex justify-between text-charcoal/80">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-charcoal/80">
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-base font-medium text-charcoal pt-2 border-t border-[#EBE3D8]">
              <span>Total Payable</span>
              <span>₹{totalPayable.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-boutique-primary w-full py-4 text-center text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isLoading ? "Securing Payment Session..." : `Pay ₹${totalPayable.toLocaleString("en-IN")} & Confirm Order`}
          </button>

          <p className="text-[10px] text-center text-taupe font-sans leading-relaxed">
            By clicking Pay, you agree to Petal &amp; Pearl&apos;s Terms &amp; Conditions and Shipping Policy. All transactions are securely processed.
          </p>

        </div>

      </form>

    </div>
  );
}
