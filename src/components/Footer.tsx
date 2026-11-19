"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ShieldCheck, HeartHandshake, Sparkles, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isAdminPage = pathname?.startsWith("/admin");
  if (isAdminPage) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing! Your 10% welcome code is WELCOME10.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not connect. Please try again.");
    }
  };

  return (
    <footer className="bg-ivory border-t border-champagne/40 pt-16 pb-12 text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Boutique Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-14 border-b border-champagne/40 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm border border-champagne/30">
              <Sparkles className="w-5 h-5 text-taupe-dark" />
            </div>
            <h4 className="font-serif text-lg font-medium">Conscious Craftsmanship</h4>
            <p className="text-xs text-charcoal/70 mt-1 max-w-xs font-sans">
              Hand-selected natural freshwater baroque pearls, hypoallergenic finishes, and artisanal quality.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm border border-champagne/30">
              <HeartHandshake className="w-5 h-5 text-taupe-dark" />
            </div>
            <h4 className="font-serif text-lg font-medium">Boutique Unboxing</h4>
            <p className="text-xs text-charcoal/70 mt-1 max-w-xs font-sans">
              Every piece arrives in our signature keepsake jewelry box with custom tissue and satin ribbon.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm border border-champagne/30">
              <ShieldCheck className="w-5 h-5 text-taupe-dark" />
            </div>
            <h4 className="font-serif text-lg font-medium">Prepaid Express Care</h4>
            <p className="text-xs text-charcoal/70 mt-1 max-w-xs font-sans">
              Dedicated express dispatch across India with encrypted 256-bit bank and UPI payments.
            </p>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-14 border-b border-champagne/40">
          
          {/* Brand & Newsletter Column */}
          <div className="md:col-span-5 space-y-4">
            <span className="font-serif text-2xl tracking-wider text-charcoal block">
              Petal &amp; Pearl
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-taupe font-sans -mt-2">
              Beauty in Every Little Detail
            </p>
            <p className="text-xs text-charcoal/80 leading-relaxed font-sans max-w-sm pt-2">
              An online sanctuary for fine accessories, baroque pearl keepsakes, and feminine daily adornments. Thoughtfully designed to make every morning ritual memorable.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-3">
              <h5 className="text-xs uppercase tracking-widest font-sans font-medium text-charcoal mb-2">
                Join The Petal Circle
              </h5>
              <p className="text-xs text-charcoal/70 mb-3 font-sans">
                Receive private boutique preview access and ₹100 off your first keepsake order.
              </p>
              
              <form onSubmit={handleSubscribe} className="flex max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="bg-white border border-champagne px-4 py-2.5 text-xs text-charcoal placeholder:text-taupe focus:outline-none focus:border-charcoal flex-1 font-sans rounded-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-charcoal text-ivory px-4 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-taupe-dark transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  {status === "loading" ? "..." : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {status === "success" && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 mt-2 font-sans">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
              {status === "error" && (
                <p className="text-xs text-rose-700 mt-2 font-sans">{message}</p>
              )}
            </div>
          </div>

          {/* Catalog Links */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs uppercase tracking-widest font-sans font-semibold text-charcoal">
              Collections
            </h5>
            <ul className="space-y-2 text-xs font-sans text-charcoal/80">
              <li><Link href="/shop" className="hover:text-taupe transition-colors">Shop All</Link></li>
              <li><Link href="/category/press-on-nails" className="hover:text-taupe transition-colors">Press-On Nails</Link></li>
              <li><Link href="/category/jewellery" className="hover:text-taupe transition-colors">Jewellery</Link></li>
              <li><Link href="/category/hair-accessories" className="hover:text-taupe transition-colors">Hair Accessories</Link></li>
              <li><Link href="/category/everyday-essentials" className="hover:text-taupe transition-colors">Everyday Essentials</Link></li>
              <li><Link href="/category/gifts" className="hover:text-taupe transition-colors">Gift Sets</Link></li>
            </ul>
          </div>

          {/* Boutique Service Links */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs uppercase tracking-widest font-sans font-semibold text-charcoal">
              Boutique Care
            </h5>
            <ul className="space-y-2 text-xs font-sans text-charcoal/80">
              <li><Link href="/track-order" className="hover:text-taupe transition-colors">Track Order</Link></li>
              <li><Link href="/about" className="hover:text-taupe transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-taupe transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-taupe transition-colors">FAQ &amp; Care</Link></li>
              <li><Link href="/cart" className="hover:text-taupe transition-colors">Shopping Bag</Link></li>
            </ul>
          </div>

          {/* Policies & Legal */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs uppercase tracking-widest font-sans font-semibold text-charcoal">
              Policies &amp; Trust
            </h5>
            <ul className="space-y-2 text-xs font-sans text-charcoal/80">
              <li><Link href="/shipping-policy" className="hover:text-taupe transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns-policy" className="hover:text-taupe transition-colors">Returns &amp; Refund Policy</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-taupe transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-taupe transition-colors">Terms &amp; Conditions</Link></li>
              <li className="pt-2 text-[11px] text-taupe font-sans">
                Official Domain: <span className="text-charcoal font-medium">thepearlpetals.in</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal/60 font-sans gap-4">
          <p>
            &copy; {new Date().getFullYear()} Petal &amp; Pearl. All rights reserved.
          </p>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>100% Secure Prepaid UPI &amp; Cards</span>
            <span>&bull;</span>
            <Link href="/admin/login" className="hover:text-charcoal transition-colors underline underline-offset-2">
              Staff Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
