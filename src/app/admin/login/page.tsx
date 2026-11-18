"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@thepearlpetals.in");
  const [password, setPassword] = useState("PetalPearl@2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin");
      } else {
        setError(data.error || "Invalid administrator credentials.");
      }
    } catch {
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-12">
      <div className="bg-white border border-[#EBE3D8] p-8 sm:p-10 shadow-xl space-y-6">
        
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-ivory border border-champagne flex items-center justify-center mx-auto text-charcoal">
            <Lock className="w-5 h-5 text-taupe-dark" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal">
            Petal &amp; Pearl
          </h1>
          <span className="text-[10px] uppercase tracking-[0.25em] text-taupe font-sans block">
            Authorized Administrator Access
          </span>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-sans flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="block text-charcoal font-medium uppercase tracking-wider">
              Administrator Email
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@thepearlpetals.in"
              className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-charcoal font-medium uppercase tracking-wider">
              Secret Key / Master Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-boutique-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Access Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#EBE3D8] text-[11px] text-taupe font-sans space-y-2">
          <p className="flex items-center gap-1.5 text-charcoal/80 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-taupe-dark" />
            Security &amp; RBAC Notice
          </p>
          <p className="leading-relaxed">
            Supplier costs, gross contribution margins, and customer shipping addresses are protected under strict administrative Row Level Security.
          </p>
          <p className="pt-2 text-center">
            <Link href="/" className="text-charcoal hover:underline">
              &larr; Return to Customer Storefront
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
