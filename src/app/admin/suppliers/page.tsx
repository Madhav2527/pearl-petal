"use client";

import { useState, useMemo } from "react";
import { Supplier } from "@/lib/types";
import { SEED_SUPPLIERS } from "@/data/seed-data";
import { ShieldCheck, AlertTriangle, ExternalLink, Plus, Check } from "lucide-react";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(SEED_SUPPLIERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    website_url: "",
    resale_permission_status: "verified_wholesale" as Supplier["resale_permission_status"],
    agreement_notes: "",
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: Supplier = {
      ...formData,
      id: `sup-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setSuppliers([...suppliers, newSup]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3D8] pb-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
            Vendor Relationships
          </span>
          <h1 className="font-serif text-3xl text-charcoal">
            Authorized Suppliers &amp; Resale Rights ({suppliers.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-boutique-primary py-2.5 px-4 text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Compliance Notice */}
      <div className="bg-ivory/60 border border-champagne p-4 text-xs font-sans text-charcoal space-y-1">
        <p className="font-medium flex items-center gap-1.5 text-charcoal">
          <ShieldCheck className="w-4 h-4 text-taupe-dark" />
          Mandatory Commercial Resale Policy
        </p>
        <p className="text-charcoal/70 leading-relaxed font-light">
          Petal &amp; Pearl strictly sells products from suppliers where explicit commercial resale authorization has been signed. We never scrape or dropship without consent from unauthorized consumer retail sites.
        </p>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white border border-[#EBE3D8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-ivory/60 border-b border-[#EBE3D8] text-taupe-dark uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Supplier Studio</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Resale Permission Status</th>
                <th className="p-4">Agreement Notes</th>
                <th className="p-4 text-right">Portal Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D8]/60 text-charcoal">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-taupe font-sans">
                    No suppliers added yet. Click &ldquo;+ Add Supplier&rdquo; to register your authorized wholesale partners.
                  </td>
                </tr>
              ) : (
                suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="p-4 font-medium text-charcoal font-serif text-sm">
                    {sup.name}
                  </td>

                  <td className="p-4 space-y-0.5">
                    <p>{sup.contact_email}</p>
                    <p className="text-taupe text-[10px]">{sup.contact_phone}</p>
                  </td>

                  <td className="p-4">
                    {sup.resale_permission_status === "verified_wholesale" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] uppercase tracking-wider font-medium">
                        <Check className="w-3 h-3" /> Verified Wholesale
                      </span>
                    ) : sup.resale_permission_status === "pending_agreement" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase tracking-wider font-medium">
                        Pending Contract
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] uppercase tracking-wider font-medium">
                        Not Authorized
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-charcoal/70 text-[11px] max-w-xs font-light">
                    {sup.agreement_notes}
                  </td>

                  <td className="p-4 text-right">
                    <a
                      href={sup.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-taupe hover:text-charcoal transition-colors underline"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3D8] w-full max-w-lg p-6 space-y-4 shadow-xl text-xs font-sans">
            <div className="flex justify-between items-center border-b border-[#EBE3D8] pb-3">
              <h3 className="font-serif text-xl text-charcoal">Add Verified Supplier</h3>
              <button onClick={() => setModalOpen(false)} className="text-taupe hover:text-charcoal uppercase">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-charcoal font-medium uppercase tracking-wider">
                  Supplier / Studio Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jaipur Gems Guild"
                  className="w-full bg-ivory/30 border border-champagne p-2.5 text-charcoal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-charcoal focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full bg-ivory/30 border border-champagne p-2.5 text-charcoal focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-charcoal font-medium uppercase tracking-wider">
                  Supplier Website URL
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-ivory/30 border border-champagne p-2.5 text-charcoal focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-charcoal font-medium uppercase tracking-wider">
                  Resale Permission Status *
                </label>
                <select
                  value={formData.resale_permission_status}
                  onChange={(e) => setFormData({ ...formData, resale_permission_status: e.target.value as Supplier["resale_permission_status"] })}
                  className="w-full bg-ivory/30 border border-champagne p-2.5 text-charcoal focus:outline-none"
                >
                  <option value="verified_wholesale">Verified Wholesale (Authorized)</option>
                  <option value="pending_agreement">Pending Agreement</option>
                  <option value="not_authorized">Not Authorized</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-charcoal font-medium uppercase tracking-wider">
                  Agreement Details &amp; Terms
                </label>
                <textarea
                  rows={2}
                  value={formData.agreement_notes}
                  onChange={(e) => setFormData({ ...formData, agreement_notes: e.target.value })}
                  placeholder="Notes on wholesale pricing agreement, MOQ, and packaging consent..."
                  className="w-full bg-ivory/30 border border-champagne p-2.5 text-charcoal focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-boutique-secondary py-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-boutique-primary py-2 px-5">
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
