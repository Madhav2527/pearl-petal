"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X, Compass } from "lucide-react";
import { useCart } from "@/context/cart-context";

export default function Navbar() {
  const pathname = usePathname();
  const { openCart, itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If inside /admin, suppress main customer navbar or provide simple link
  const isAdminPage = pathname?.startsWith("/admin");
  if (isAdminPage) {
    return null;
  }

  const navLinks = [
    { label: "Shop All", href: "/shop" },
    { label: "🔥 Hottest Picks", href: "/shop?filter=hottest" },
    { label: "Hair Clips", href: "/category/hair-accessories" },
    { label: "Jewellery", href: "/category/jewellery" },
    { label: "Everyday Essentials", href: "/category/everyday-essentials" },
    { label: "Gifts", href: "/category/gifts" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EBE3D8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal hover:text-taupe focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/search" className="p-2 text-charcoal hover:text-taupe ml-1" aria-label="Search Store">
              <Search className="w-5 h-5" />
            </Link>
          </div>

          {/* Desktop Left Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.slice(0, 3).map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase tracking-widest font-sans transition-colors py-1 relative ${
                    active ? "text-charcoal font-medium" : "text-charcoal/70 hover:text-charcoal"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-champagne" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Center Brand Identity */}
          <div className="flex flex-col items-center justify-center text-center">
            <Link href="/" className="group">
              <span className="font-serif text-2xl sm:text-3xl tracking-wider text-charcoal block transition-transform group-hover:scale-[1.01]">
                Petal &amp; Pearl
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-taupe block font-sans -mt-1 font-normal">
                Beauty in Every Little Detail
              </span>
            </Link>
          </div>

          {/* Desktop Right Nav & Actions */}
          <div className="flex items-center space-x-6">
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.slice(3).map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs uppercase tracking-widest font-sans transition-colors py-1 relative ${
                      active ? "text-charcoal font-medium" : "text-charcoal/70 hover:text-charcoal"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-champagne" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4 border-l border-[#EBE3D8] pl-6">
              <Link
                href="/search"
                className="hidden sm:inline-flex p-1.5 text-charcoal/80 hover:text-charcoal transition-colors"
                title="Search"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Link>

              <Link
                href="/track-order"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-sans text-charcoal/70 hover:text-charcoal transition-colors"
                title="Track Order"
              >
                <Compass className="w-4 h-4 text-taupe" />
                <span className="hidden md:inline">Track</span>
              </Link>

              {/* Shopping Bag Button */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-1.5 text-charcoal hover:text-taupe transition-colors flex items-center"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-charcoal text-ivory text-[10px] font-sans font-medium w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-cream border-t border-[#EBE3D8] px-6 py-8 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-serif tracking-wide text-charcoal hover:text-taupe py-1 border-b border-[#EBE3D8]/60"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#EBE3D8] flex flex-col space-y-3 text-xs uppercase tracking-widest font-sans text-taupe-dark">
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:text-charcoal"
            >
              <Compass className="w-4 h-4" />
              Track Your Order
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-charcoal"
            >
              About Petal &amp; Pearl
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-charcoal"
            >
              Customer Care &amp; Inquiries
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
