"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Settings,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on admin login page, render clean standalone view
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-ivory/50 flex flex-col justify-center">{children}</div>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products & Pricing", href: "/admin/products", icon: Package },
    { label: "Orders & Fulfilment", href: "/admin/orders", icon: ShoppingBag },
    { label: "Suppliers & Resale", href: "/admin/suppliers", icon: Truck },
    { label: "Store Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col font-sans">
      
      {/* Admin Top Header */}
      <header className="bg-charcoal text-ivory h-16 border-b border-charcoal-light flex items-center justify-between px-4 sm:px-8 z-30">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 text-ivory hover:text-champagne"
            aria-label="Toggle admin sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-serif text-xl sm:text-2xl tracking-wide text-ivory">
              Petal &amp; Pearl
            </span>
            <span className="text-[10px] uppercase tracking-widest bg-champagne text-charcoal px-2 py-0.5 font-medium">
              Admin Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-champagne hover:text-white transition-colors"
          >
            <span>View Live Boutique</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-rose-300 hover:text-rose-100 transition-colors border-l border-charcoal-light pl-4 py-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-[#EBE3D8] p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#EBE3D8]">
              <span className="text-[10px] uppercase tracking-widest text-taupe font-medium block">
                Store Operations
              </span>
              <p className="font-serif text-base text-charcoal mt-0.5">Management Suite</p>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-sans tracking-wide transition-all ${
                      active
                        ? "bg-charcoal text-ivory font-medium shadow-sm"
                        : "text-charcoal/70 hover:bg-ivory hover:text-charcoal"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-champagne" : "text-taupe"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Pricing Rule Reminder Badge */}
          <div className="bg-ivory/60 border border-champagne p-3.5 space-y-1 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-taupe-dark font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-champagne-dark" /> Dynamic Pricing Engine
            </span>
            <p className="text-[11px] text-charcoal/80 font-light">
              Selling Price = Supplier Cost + Configurable Markup (Active Default: ₹100)
            </p>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10">
          <div className="max-w-6xl mx-auto space-y-8">{children}</div>
        </main>

      </div>

    </div>
  );
}
