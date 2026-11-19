"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductCategory, ProductSubcategory } from "@/lib/types";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { calculateSellingPrice } from "@/lib/pricing-engine";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Link Importer State
  const [linkUrl, setLinkUrl] = useState("");
  const [directImageUrl, setDirectImageUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [quickCost, setQuickCost] = useState<number>(250);
  const [quickPrice, setQuickPrice] = useState<number>(350); // Auto +₹100
  const [quickHottest, setQuickHottest] = useState<boolean>(false);
  const [adminTableFilter, setAdminTableFilter] = useState<string>("all");
  const [extractedData, setExtractedData] = useState<{
    name: string;
    description: string;
    image_url: string;
    category: ProductCategory;
    subcategory: ProductSubcategory;
    isExtracted: boolean;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedItem, setPublishedItem] = useState<{
    name: string;
    slug: string;
    price: number;
  } | null>(null);

  // Manual Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "jewellery" as ProductCategory,
    subcategory: "earrings" as ProductSubcategory,
    description: "",
    supplier_cost: 250,
    custom_markup: null as number | null,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    is_featured: false,
    is_bestseller: false,
    is_new: true,
    is_visible: true,
    tags: "pearl, earrings, handcrafted",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Update quick price automatically when supplier cost changes (+₹100 rule)
  const handleCostChange = (newCost: number) => {
    setQuickCost(newCost);
    setQuickPrice(newCost + 100);
  };

  // Handle URL Link Extraction
  const handleExtractLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkUrl.trim()) {
      setExtractError("Please paste a valid product link or URL.");
      return;
    }

    setExtracting(true);
    setExtractError("");
    setPublishedItem(null);

    try {
      const res = await fetch("/api/admin/extract-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: linkUrl.trim(),
          directImageUrl: directImageUrl.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setExtractedData({
          name: json.data.name,
          description: json.data.description,
          image_url: json.data.image_url,
          category: json.data.category,
          subcategory: json.data.subcategory,
          isExtracted: json.isExtracted,
        });
      } else {
        setExtractError(json.error || "Could not read link. You can still enter details manually.");
      }
    } catch {
      setExtractError("Network error while inspecting link.");
    } finally {
      setExtracting(false);
    }
  };

  // Publish extracted product immediately live to storefront
  const handlePublishFromLink = async () => {
    if (!extractedData) return;
    if (!extractedData.name.trim()) {
      setExtractError("Product name cannot be empty.");
      return;
    }

    setPublishing(true);
    setExtractError("");

    try {
      const customMarkup = quickPrice - quickCost;
      const payload = {
        name: extractedData.name.trim(),
        category: extractedData.category,
        subcategory: extractedData.subcategory,
        description: extractedData.description,
        supplier_cost: Number(quickCost),
        custom_markup: customMarkup !== 100 ? customMarkup : null,
        stock: 25,
        is_featured: true,
        is_bestseller: quickHottest,
        is_new: true,
        is_visible: true,
        product_link: linkUrl.trim() || undefined,
        source_url: linkUrl.trim() || undefined,
        tags: [extractedData.category, extractedData.subcategory, "new arrival", "link imported"],
        images: [
          {
            id: `img-${Date.now()}`,
            image_url: extractedData.image_url,
            alt_text: extractedData.name,
            display_order: 1,
            is_primary: true,
          },
        ],
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.product) {
        setPublishedItem({
          name: data.product.name,
          slug: data.product.slug,
          price: data.product.selling_price,
        });
        setExtractedData(null);
        setLinkUrl("");
        setDirectImageUrl("");
        setQuickHottest(false);
        loadProducts();
      } else {
        setExtractError(data.error || "Failed to publish product.");
      }
    } catch {
      setExtractError("Network error while publishing product.");
    } finally {
      setPublishing(false);
    }
  };

  const handleToggleHottest = async (product: Product) => {
    try {
      const updated = {
        ...product,
        is_bestseller: !product.is_bestseller,
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_bestseller: !p.is_bestseller } : p))
        );
      }
    } catch {
      alert("Failed to update product.");
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "jewellery",
      subcategory: "earrings",
      description: "",
      supplier_cost: 250,
      custom_markup: null,
      stock: 20,
      image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      is_featured: false,
      is_bestseller: false,
      is_new: true,
      is_visible: true,
      tags: "pearl, handcrafted, boutique",
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      description: p.description,
      supplier_cost: p.supplier_cost,
      custom_markup: p.custom_markup ?? null,
      stock: p.stock,
      image_url: p.images[0]?.image_url || "",
      is_featured: p.is_featured,
      is_bestseller: p.is_bestseller,
      is_new: p.is_new,
      is_visible: p.is_visible,
      tags: p.tags.join(", "),
    });
    setModalOpen(true);
  };

  const calculatedSellingPrice = calculateSellingPrice(
    formData.supplier_cost,
    formData.custom_markup
  );

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        id: editingProduct?.id,
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        supplier_cost: Number(formData.supplier_cost),
        custom_markup: formData.custom_markup !== null ? Number(formData.custom_markup) : null,
        stock: Number(formData.stock),
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        is_new: formData.is_new,
        is_visible: formData.is_visible,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: [
          {
            id: `img-${Date.now()}`,
            image_url: formData.image_url,
            alt_text: formData.name,
            display_order: 1,
            is_primary: true,
          },
        ],
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        loadProducts();
      } else {
        setMessage(data.error || "Failed to save product.");
      }
    } catch {
      setMessage("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3D8] pb-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
            Inventory &amp; Pricing Automation
          </span>
          <h1 className="font-serif text-3xl text-charcoal">
            Product Catalogue ({products.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn-boutique-secondary py-2.5 px-4 flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Add</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ⚡ FEATURE: QUICK ADD BY PRODUCT LINK (AUTO +₹100 & INSTANT PUBLISH)       */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-white via-ivory/30 to-[#FAF6F0] border-2 border-champagne p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-champagne/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-champagne/40 flex items-center justify-center text-taupe-dark">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-charcoal">
                Quick Add by Product Link
              </h2>
              <p className="text-xs text-charcoal/70 font-sans">
                Paste any external product link, set your supplier cost, and publish live to the storefront in one click.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Dynamic +₹100 Markup Engine Active
          </span>
        </div>

        {/* Success Alert when product is published */}
        {publishedItem && (
          <div className="bg-emerald-50 border border-emerald-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans text-emerald-900 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-950">
                  ✨ &quot;{publishedItem.name}&quot; is now LIVE on your website!
                </p>
                <p className="text-[11px] text-emerald-800">
                  Published at <strong>₹{publishedItem.price}</strong> across Homepage, Shop, Category, and Search.
                </p>
              </div>
            </div>

            <Link
              href={`/product/${publishedItem.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white hover:bg-emerald-900 transition-colors text-xs font-medium shrink-0"
            >
              <span>View Live Product</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Error Alert */}
        {extractError && (
          <div className="bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2 font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{extractError}</span>
          </div>
        )}

        {/* Link Input Row */}
        <form onSubmit={handleExtractLink} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6 space-y-1">
              <label className="block text-[11px] uppercase tracking-wider text-charcoal font-semibold font-sans">
                Product Link / URL *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-taupe">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Paste link (e.g. Nykaa, Myntra, Amazon, supplier URL)..."
                  className="w-full bg-white border border-champagne pl-9 pr-3 py-3 text-xs text-charcoal placeholder:text-taupe focus:outline-none focus:border-charcoal font-sans"
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-[11px] uppercase tracking-wider text-charcoal font-semibold font-sans">
                Product Image Link (Optional)
              </label>
              <input
                type="url"
                value={directImageUrl}
                onChange={(e) => setDirectImageUrl(e.target.value)}
                placeholder="Paste direct image link if you copied it..."
                className="w-full bg-white border border-champagne px-3 py-3 text-xs text-charcoal placeholder:text-taupe focus:outline-none focus:border-charcoal font-sans"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={extracting || !linkUrl.trim()}
                className="btn-boutique-primary w-full py-3 px-3 flex items-center justify-center gap-1.5 text-xs font-sans disabled:opacity-50"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Reading...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Add by Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Interactive Editor Card after link inspection */}
        {extractedData && (
          <div className="bg-white border border-champagne p-5 sm:p-6 space-y-6 shadow-sm font-sans animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#EBE3D8] pb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-charcoal flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {extractedData.isExtracted
                  ? "Product Information & Image Ready"
                  : "Link Detected — Review & Set Price"}
              </span>

              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="text-xs text-taupe hover:text-charcoal uppercase"
              >
                Discard
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Image Preview & URL */}
              <div className="md:col-span-4 space-y-3">
                <div className="relative aspect-[3/4] bg-ivory border border-[#EBE3D8] overflow-hidden group">
                  {extractedData.image_url ? (
                    <Image
                      src={extractedData.image_url}
                      alt={extractedData.name || "Preview"}
                      fill
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-taupe text-xs">
                      No Image URL
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-charcoal font-medium">
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    value={extractedData.image_url}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, image_url: e.target.value })
                    }
                    className="w-full bg-ivory/30 border border-champagne p-2 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                    placeholder="https://..."
                  />
                </div>

                {/* Quick Studio Photo Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase tracking-wider text-taupe font-sans font-medium block">
                    Or Pick Studio Aesthetic Photo:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-sans">
                    <button
                      type="button"
                      onClick={() => setExtractedData({ ...extractedData, image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80" })}
                      className="p-1.5 border border-champagne bg-ivory/40 hover:bg-white text-charcoal text-left truncate"
                    >
                      ✦ Baroque Drops
                    </button>
                    <button
                      type="button"
                      onClick={() => setExtractedData({ ...extractedData, image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80" })}
                      className="p-1.5 border border-champagne bg-ivory/40 hover:bg-white text-charcoal text-left truncate"
                    >
                      ✦ Pearl Choker
                    </button>
                    <button
                      type="button"
                      onClick={() => setExtractedData({ ...extractedData, image_url: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80" })}
                      className="p-1.5 border border-champagne bg-ivory/40 hover:bg-white text-charcoal text-left truncate"
                    >
                      ✦ Claw Clip
                    </button>
                    <button
                      type="button"
                      onClick={() => setExtractedData({ ...extractedData, image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80" })}
                      className="p-1.5 border border-champagne bg-ivory/40 hover:bg-white text-charcoal text-left truncate"
                    >
                      ✦ Velvet Bow
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Category, Pricing Rule & Publish */}
              <div className="md:col-span-8 space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-wider text-charcoal font-semibold">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={extractedData.name}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, name: e.target.value })
                    }
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal font-serif text-base focus:outline-none focus:border-charcoal"
                  />
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-charcoal font-medium">
                      Category
                    </label>
                    <select
                      value={extractedData.category}
                      onChange={(e) =>
                        setExtractedData({
                          ...extractedData,
                          category: e.target.value as ProductCategory,
                        })
                      }
                      className="w-full bg-ivory/30 border border-champagne p-2 text-xs text-charcoal focus:outline-none cursor-pointer"
                    >
                      <option value="jewellery">Jewellery</option>
                      <option value="hair-accessories">Hair Accessories</option>
                      <option value="everyday-essentials">Everyday Essentials</option>
                      <option value="gifts">Gifts</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-charcoal font-medium">
                      Subcategory
                    </label>
                    <select
                      value={extractedData.subcategory}
                      onChange={(e) =>
                        setExtractedData({
                          ...extractedData,
                          subcategory: e.target.value as ProductSubcategory,
                        })
                      }
                      className="w-full bg-ivory/30 border border-champagne p-2 text-xs text-charcoal focus:outline-none cursor-pointer"
                    >
                      <option value="claw-clips">Claw Clips (Hair Clips)</option>
                      <option value="hair-bows">Hair Bows &amp; Ribbons</option>
                      <option value="scrunchies">Silk Scrunchies</option>
                      <option value="earrings">Earrings</option>
                      <option value="necklaces">Necklaces &amp; Chokers</option>
                      <option value="bracelets">Bracelets &amp; Bangles</option>
                      <option value="rings">Rings</option>
                      <option value="phone-charms">Phone Charms &amp; Straps</option>
                      <option value="pouches">Pouches &amp; Bags</option>
                      <option value="gift-sets">Gift Sets</option>
                    </select>
                  </div>
                </div>

                {/* Hottest Pick Toggle in Quick Add */}
                <div className="bg-white/80 border border-champagne p-3">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={quickHottest}
                      onChange={(e) => setQuickHottest(e.target.checked)}
                      className="accent-charcoal rounded-none w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-charcoal font-medium font-sans flex items-center gap-1.5">
                      <span>🔥 Feature in &quot;Hottest Picks&quot; Collection</span>
                      <span className="text-[10px] text-taupe font-normal">(Displays in Hottest Picks section on Homepage &amp; Shop)</span>
                    </span>
                  </label>
                </div>

                {/* Dynamic Pricing Engine Calculation Card */}
                <div className="bg-[#FAF7F2] border border-champagne p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-charcoal flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-taupe-dark" />
                      Dynamic Pricing Engine: Selling Price = Cost + ₹100
                    </span>
                    <span className="text-[10px] text-emerald-800 font-mono font-medium">
                      Margin: ₹{quickPrice - quickCost}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-wider text-charcoal font-medium">
                        Supplier Cost (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={quickCost}
                        onChange={(e) => handleCostChange(Number(e.target.value) || 0)}
                        className="w-full bg-white border border-champagne p-2.5 text-xs text-charcoal font-mono focus:outline-none focus:border-charcoal"
                      />
                      <span className="text-[9px] text-taupe block">
                        Confidential &bull; Scrubbed from public views
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-wider text-charcoal font-medium">
                        Selling Price (₹) &bull; Live On Site
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={quickPrice}
                        onChange={(e) => setQuickPrice(Number(e.target.value) || 0)}
                        className="w-full bg-white border border-champagne p-2.5 text-sm font-semibold font-mono text-emerald-800 focus:outline-none focus:border-charcoal"
                      />
                      <span className="text-[9px] text-emerald-700 block">
                        Default: Cost (₹{quickCost}) + ₹100 = ₹{quickCost + 100}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-charcoal font-medium">
                    Product Description
                  </label>
                  <textarea
                    rows={3}
                    value={extractedData.description}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, description: e.target.value })
                    }
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal leading-relaxed"
                  />
                </div>

                {/* Action Button: Publish Live */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setExtractedData(null)}
                    className="btn-boutique-secondary py-3 px-5 text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={publishing}
                    onClick={handlePublishFromLink}
                    className="btn-boutique-primary py-3 px-6 text-xs flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing to Website...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Publish Live to Website Now &rarr;</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EXISTING PRODUCT CATALOGUE TABLE                                          */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#EBE3D8] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EBE3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg text-charcoal">
              All Storefront Products ({products.length})
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setAdminTableFilter("all")}
                className={`px-2.5 py-1 text-[11px] font-sans border transition-all ${
                  adminTableFilter === "all"
                    ? "bg-charcoal text-white border-charcoal font-medium shadow-xs"
                    : "bg-white text-charcoal/70 border-[#EBE3D8] hover:border-champagne"
                }`}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setAdminTableFilter("hottest")}
                className={`px-2.5 py-1 text-[11px] font-sans border transition-all flex items-center gap-1 ${
                  adminTableFilter === "hottest"
                    ? "bg-[#2D2A26] text-[#FAF8F5] border-[#2D2A26] font-medium shadow-xs"
                    : "bg-white text-[#C2714F] border-champagne hover:border-charcoal font-medium"
                }`}
              >
                <span>🔥 Hottest Picks</span>
                <span>({products.filter((p) => p.is_bestseller).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminTableFilter("hair-accessories")}
                className={`px-2.5 py-1 text-[11px] font-sans border transition-all ${
                  adminTableFilter === "hair-accessories"
                    ? "bg-charcoal text-white border-charcoal font-medium shadow-xs"
                    : "bg-white text-charcoal/70 border-[#EBE3D8] hover:border-champagne"
                }`}
              >
                Hair Clips ({products.filter((p) => p.category === "hair-accessories").length})
              </button>
              <button
                type="button"
                onClick={() => setAdminTableFilter("jewellery")}
                className={`px-2.5 py-1 text-[11px] font-sans border transition-all ${
                  adminTableFilter === "jewellery"
                    ? "bg-charcoal text-white border-charcoal font-medium shadow-xs"
                    : "bg-white text-charcoal/70 border-[#EBE3D8] hover:border-champagne"
                }`}
              >
                Jewellery ({products.filter((p) => p.category === "jewellery").length})
              </button>
              <button
                type="button"
                onClick={() => setAdminTableFilter("everyday-essentials")}
                className={`px-2.5 py-1 text-[11px] font-sans border transition-all ${
                  adminTableFilter === "everyday-essentials"
                    ? "bg-charcoal text-white border-charcoal font-medium shadow-xs"
                    : "bg-white text-charcoal/70 border-[#EBE3D8] hover:border-champagne"
                }`}
              >
                Everyday ({products.filter((p) => p.category === "everyday-essentials").length})
              </button>
              <button
                type="button"
                onClick={() => setAdminTableFilter("gifts")}
                className={`px-2.5 py-1 text-[11px] font-sans border transition-all ${
                  adminTableFilter === "gifts"
                    ? "bg-charcoal text-white border-charcoal font-medium shadow-xs"
                    : "bg-white text-charcoal/70 border-[#EBE3D8] hover:border-champagne"
                }`}
              >
                Gifts ({products.filter((p) => p.category === "gifts").length})
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={loadProducts}
            className="text-xs text-taupe hover:text-charcoal flex items-center gap-1 font-sans shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-ivory/60 border-b border-[#EBE3D8] text-taupe-dark uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Supplier Cost</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Hottest Pick</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D8]/60 text-charcoal">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-taupe">
                    Loading catalogue...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-taupe">
                    No products found. Add your first piece using the link importer above.
                  </td>
                </tr>
              ) : (
                products
                  .filter((p) => {
                    if (adminTableFilter === "hottest") return p.is_bestseller;
                    if (adminTableFilter !== "all") return p.category === adminTableFilter;
                    return true;
                  })
                  .map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    
                    {/* Item Image & Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-ivory border border-[#EBE3D8] shrink-0 overflow-hidden">
                          {p.images[0]?.image_url && (
                            <Image
                              src={p.images[0].image_url}
                              alt={p.name}
                              fill
                              unoptimized
                              referrerPolicy="no-referrer"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="font-serif text-sm text-charcoal font-medium hover:text-taupe-dark line-clamp-1 inline-flex items-center gap-1 group"
                          >
                            <span>{p.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-taupe" />
                          </Link>
                          <span className="text-[10px] text-taupe font-mono block">
                            SKU: {p.sku}
                          </span>
                          {(p.product_link || p.source_url) && (
                            <a
                              href={p.product_link || p.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-taupe hover:text-charcoal underline inline-flex items-center gap-0.5 mt-0.5 font-sans"
                            >
                              <span>Source Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="capitalize">{p.category.replace("-", " ")}</span>
                      <span className="text-[10px] text-taupe block capitalize">
                        {p.subcategory === "claw-clips" ? "Claw Clip (Hair Clip)" : p.subcategory.replace("-", " ")}
                      </span>
                    </td>

                    {/* Supplier Cost */}
                    <td className="p-4 font-mono">
                      ₹{p.supplier_cost}
                    </td>

                    {/* Selling Price */}
                    <td className="p-4 font-medium font-mono text-emerald-800">
                      ₹{p.selling_price}
                      <span className="text-[10px] text-taupe block font-sans">
                        Markup: +₹{p.selling_price - p.supplier_cost}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-medium ${
                          p.stock > 5
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.stock > 0
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {p.stock} in stock
                      </span>
                    </td>

                    {/* Hottest Pick 1-Click Toggle */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleHottest(p)}
                        className={`px-2.5 py-1 text-[11px] font-sans transition-all inline-flex items-center gap-1 border ${
                          p.is_bestseller
                            ? "bg-[#2D2A26] text-[#FAF8F5] border-[#2D2A26] font-medium shadow-xs"
                            : "bg-white text-taupe border-[#EBE3D8] hover:text-charcoal hover:border-champagne"
                        }`}
                        title={p.is_bestseller ? "Click to unmark from Hottest Picks" : "Click to mark as Hottest Pick"}
                      >
                        <span>🔥</span>
                        <span>{p.is_bestseller ? "Hottest" : "Standard"}</span>
                      </button>
                    </td>

                    {/* Visibility */}
                    <td className="p-4">
                      {p.is_visible ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px]">
                          <Eye className="w-3.5 h-3.5" /> Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 text-[11px]">
                          <EyeOff className="w-3.5 h-3.5" /> Hidden
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-charcoal/70 hover:text-charcoal transition-colors border border-[#EBE3D8] hover:border-champagne"
                        title="Edit piece"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 text-taupe hover:text-rose-700 transition-colors border border-[#EBE3D8] hover:border-rose-200"
                        title="Delete piece"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MANUAL ADD / EDIT MODAL                                                   */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3D8] w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#EBE3D8] pb-3">
              <h2 className="font-serif text-2xl text-charcoal">
                {editingProduct ? "Edit Product" : "Add New Boutique Product"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-taupe hover:text-charcoal text-xs uppercase"
              >
                Cancel
              </button>
            </div>

            {message && (
              <div className="bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Freshwater Baroque Pearl Choker"
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal cursor-pointer"
                  >
                    <option value="jewellery">Jewellery</option>
                    <option value="hair-accessories">Hair Accessories</option>
                    <option value="everyday-essentials">Everyday Essentials</option>
                    <option value="gifts">Gifts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Subcategory *
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value as ProductSubcategory })}
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal cursor-pointer"
                  >
                    <option value="earrings">Earrings</option>
                    <option value="necklaces">Necklaces</option>
                    <option value="bracelets">Bracelets</option>
                    <option value="rings">Rings</option>
                    <option value="claw-clips">Claw Clips</option>
                    <option value="scrunchies">Scrunchies</option>
                    <option value="hair-bows">Hair Bows</option>
                    <option value="phone-charms">Phone Charms</option>
                    <option value="pouches">Pouches</option>
                    <option value="gift-sets">Gift Sets</option>
                  </select>
                </div>

                {/* PRICING ENGINE CALCULATION BOX */}
                <div className="sm:col-span-2 bg-ivory/60 border border-champagne p-4 space-y-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-charcoal flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-taupe-dark" />
                    Automated Pricing Engine
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-charcoal font-medium uppercase tracking-wider">
                        Supplier Cost (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.supplier_cost}
                        onChange={(e) => setFormData({ ...formData, supplier_cost: Number(e.target.value) })}
                        className="w-full bg-white border border-champagne p-2.5 text-xs text-charcoal font-mono focus:outline-none focus:border-charcoal"
                      />
                      <span className="text-[10px] text-taupe block">
                        Confidential &bull; Never visible to customer
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-charcoal font-medium uppercase tracking-wider">
                        Calculated Selling Price (₹)
                      </label>
                      <div className="w-full bg-white border border-champagne p-2.5 text-sm font-semibold font-mono text-emerald-800 flex items-center justify-between">
                        <span>₹{calculatedSellingPrice}</span>
                        <span className="text-[10px] font-sans font-normal text-taupe">
                          (Cost + ₹{calculatedSellingPrice - formData.supplier_cost} Markup)
                        </span>
                      </div>
                      <span className="text-[10px] text-taupe block">
                        Customer sees this exact price
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal leading-relaxed"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>Featured Piece</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_bestseller}
                      onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>Bestseller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_new}
                      onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>Visible in Store</span>
                  </label>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBE3D8]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-boutique-secondary py-2.5 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-boutique-primary py-2.5 px-6 text-xs flex items-center gap-2"
                >
                  {saving ? "Saving Piece..." : editingProduct ? "Update Piece" : "Add to Boutique"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
