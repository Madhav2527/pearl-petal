"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, ProductCategory, ProductSubcategory } from "@/lib/types";
import { Plus, Edit2, Trash2, Eye, EyeOff, Sparkles, Check, AlertCircle } from "lucide-react";
import { calculateSellingPrice } from "@/lib/pricing-engine";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
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
    <div className="space-y-6">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3D8] pb-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
            Inventory &amp; Pricing
          </span>
          <h1 className="font-serif text-3xl text-charcoal">
            Product Catalogue ({products.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn-boutique-primary py-3 px-5 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#EBE3D8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-ivory/60 border-b border-[#EBE3D8] text-taupe-dark uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Supplier Cost</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D8]/60 text-charcoal">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-taupe">
                    Loading catalogue...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-taupe">
                    No products found. Add your first piece above.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
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
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-serif text-sm text-charcoal font-medium line-clamp-1">
                            {p.name}
                          </p>
                          <span className="text-[10px] text-taupe font-mono">
                            SKU: {p.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="capitalize">{p.category.replace("-", " ")}</span>
                      <span className="text-[10px] text-taupe block capitalize">
                        {p.subcategory.replace("-", " ")}
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

      {/* ADD / EDIT PRODUCT MODAL */}
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
                    Primary Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Boutique Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe materials, freshwater pearls, silk finish, and styling notes..."
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
                    placeholder="pearl, choker, gold, bridal"
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  />
                </div>

                {/* Toggles */}
                <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2 border-t border-[#EBE3D8]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>Publish &amp; Visible to Customers</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>Featured on Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_bestseller}
                      onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                      className="accent-charcoal"
                    />
                    <span>Bestseller Badge</span>
                  </label>
                </div>

              </div>

              <div className="pt-4 border-t border-[#EBE3D8] flex items-center justify-end gap-3">
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
                  <Check className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Product"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
