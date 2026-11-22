"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminSettingsPage() {
  const [markup, setMarkup] = useState(50);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [flatShippingFee, setFlatShippingFee] = useState(99);
  const [announcement, setAnnouncement] = useState(
    "Complimentary boutique packaging on all prepaid orders | Free shipping over ₹999"
  );
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.settings) {
        setMarkup(data.settings.defaultMarkup || 100);
        setFreeShippingThreshold(data.settings.freeShippingThreshold || 999);
        setFlatShippingFee(data.settings.flatShippingFee || 99);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdateMarkup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultMarkup: markup }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(
          `Success! Default markup updated to ₹${data.newMarkup}. Recalculated prices for ${data.updatedCount} products.`
        );
      } else {
        setError(data.error || "Failed to update markup settings.");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#EBE3D8] pb-4">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
          Configuration &amp; Pricing Rule
        </span>
        <h1 className="font-serif text-3xl text-charcoal">
          Global Boutique Settings
        </h1>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 text-xs font-sans text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 text-xs font-sans text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. DYNAMIC PRICING ENGINE CONFIGURATION */}
      <div className="bg-white border-2 border-champagne p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-champagne pb-4">
          <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-taupe-dark">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-charcoal">
              Automated Pricing Rule &amp; Default Markup
            </h2>
            <p className="text-xs text-charcoal/70 font-sans">
              Rule: <code className="bg-ivory px-1.5 py-0.5 font-mono text-charcoal font-semibold">Selling Price = Supplier Cost + Markup</code>
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateMarkup} className="space-y-4 text-xs font-sans">
          <div className="space-y-1.5">
            <label className="block text-charcoal font-medium uppercase tracking-wider">
              Default Markup Amount (₹)
            </label>
            <div className="flex max-w-xs">
              <span className="inline-flex items-center px-3 bg-ivory border border-r-0 border-champagne text-charcoal font-medium">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="5"
                required
                value={markup}
                onChange={(e) => setMarkup(Number(e.target.value))}
                className="w-full bg-ivory/30 border border-champagne p-3 text-sm font-semibold font-mono text-charcoal focus:outline-none focus:border-charcoal"
              />
            </div>
            <p className="text-[11px] text-taupe leading-relaxed pt-1 font-light">
              Modifying this value will instantly recalculate customer selling prices across the catalogue for all products that do not have custom price overrides. Supplier costs remain strictly confidential and hidden from customers.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-boutique-primary py-3 px-6 text-xs flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
              <span>{saving ? "Recalculating Catalogue..." : `Apply ₹${markup} Markup Globally`}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. SHIPPING & ANNOUNCEMENT SETTINGS */}
      <div className="bg-white border border-[#EBE3D8] p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="font-serif text-xl text-charcoal border-b border-[#EBE3D8] pb-3">
          Shipping &amp; Logistics Rules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="block text-charcoal font-medium uppercase tracking-wider">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
              className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal font-mono focus:outline-none"
            />
            <span className="text-[10px] text-taupe block">Orders at or above this amount receive free shipping</span>
          </div>

          <div className="space-y-1">
            <label className="block text-charcoal font-medium uppercase tracking-wider">
              Flat Shipping Fee (₹)
            </label>
            <input
              type="number"
              value={flatShippingFee}
              onChange={(e) => setFlatShippingFee(Number(e.target.value))}
              className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal font-mono focus:outline-none"
            />
            <span className="text-[10px] text-taupe block">Charged on domestic orders below threshold</span>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-charcoal font-medium uppercase tracking-wider">
              Announcement Bar Text
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setMessage("Shipping settings updated in session.")}
            className="btn-boutique-secondary py-2.5 px-5 text-xs"
          >
            Save Shipping Parameters
          </button>
        </div>
      </div>

    </div>
  );
}
