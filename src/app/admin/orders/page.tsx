"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Order, OrderStatus } from "@/lib/types";
import { Search, Filter, Truck, Check, Eye, X, AlertCircle } from "lucide-react";

const ALL_STATUSES: { key: OrderStatus; label: string }[] = [
  { key: "pending_payment", label: "Pending Payment" },
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "supplier_order_placed", label: "Supplier Order Placed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "refund_pending", label: "Refund Pending" },
  { key: "refunded", label: "Refunded" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Form states for active order fulfillment update
  const [newStatus, setNewStatus] = useState<OrderStatus>("paid");
  const [supplierRef, setSupplierRef] = useState("");
  const [trackingNum, setTrackingNum] = useState("");
  const [courierPartner, setCourierPartner] = useState("BlueDart Express");
  const [actualShippingCost, setActualShippingCost] = useState(65);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openOrderDetail = (order: Order) => {
    setActiveOrder(order);
    setNewStatus(order.status);
    setSupplierRef(order.supplier_order_ref || "");
    setTrackingNum(order.tracking_number || "");
    setCourierPartner(order.courier_partner || "BlueDart Express");
    setActualShippingCost(order.actual_shipping_cost || 65);
    setMessage("");
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setUpdating(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: activeOrder.order_number,
          status: newStatus,
          supplierOrderRef: supplierRef,
          trackingNumber: trackingNum,
          courierPartner,
          actualShippingCost: Number(actualShippingCost),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveOrder(data.order);
        setOrders((prev) =>
          prev.map((o) => (o.order_number === data.order.order_number ? data.order : o))
        );
        setMessage("Order and fulfillment details updated successfully!");
      } else {
        setMessage(data.error || "Failed to update order.");
      }
    } catch {
      setMessage("Failed to connect to server.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== "all" && o.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3D8] pb-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
            Fulfillment &amp; Dispatch
          </span>
          <h1 className="font-serif text-3xl text-charcoal">
            Order Management ({orders.length})
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EBE3D8] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, email..."
            className="w-full bg-ivory/40 border border-champagne pl-9 pr-4 py-2 text-xs text-charcoal font-sans focus:outline-none focus:border-charcoal"
          />
          <Search className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-ivory/50 border border-champagne px-3 py-2 text-xs text-charcoal font-sans uppercase tracking-wider focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {ALL_STATUSES.map((st) => (
              <option key={st.key} value={st.key}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#EBE3D8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-ivory/60 border-b border-[#EBE3D8] text-taupe-dark uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Supplier Cost</th>
                <th className="p-4">Total Paid</th>
                <th className="p-4">Contribution</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D8]/60 text-charcoal">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-taupe">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-taupe">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F5] transition-colors">
                    
                    <td className="p-4 font-mono font-medium">
                      #{ord.order_number}
                    </td>

                    <td className="p-4 text-taupe">
                      {new Date(ord.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>

                    <td className="p-4">
                      <span className="font-medium block">{ord.customer.name}</span>
                      <span className="text-[10px] text-taupe">{ord.customer.city}, {ord.customer.state}</span>
                    </td>

                    <td className="p-4">
                      <span className="inline-block px-2.5 py-0.5 bg-ivory border border-champagne text-[10px] uppercase tracking-wider font-medium text-charcoal capitalize">
                        {ord.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-taupe">
                      ₹{ord.total_supplier_cost}
                    </td>

                    <td className="p-4 font-mono font-medium">
                      ₹{ord.total_payable}
                    </td>

                    <td className="p-4 font-mono text-emerald-800 font-medium">
                      +₹{ord.total_contribution}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrderDetail(ord)}
                        className="btn-boutique-secondary py-1 px-3 text-[11px]"
                      >
                        Manage &rarr;
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER FULFILLMENT SLIDE-OVER MODAL */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
            onClick={() => setActiveOrder(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white border-l border-[#EBE3D8] shadow-2xl flex flex-col">
              
              {/* Header */}
              <div className="p-6 border-b border-[#EBE3D8] flex items-center justify-between bg-ivory/50">
                <div>
                  <span className="text-xs uppercase tracking-widest text-taupe font-sans block">
                    Manage Order Details
                  </span>
                  <h2 className="font-serif text-2xl text-charcoal">
                    #{activeOrder.order_number}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-1.5 text-taupe hover:text-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans">
                
                {message && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {/* Customer Details Box */}
                <div className="bg-ivory/30 border border-[#EBE3D8] p-4 space-y-2">
                  <h3 className="font-serif text-base text-charcoal font-medium">
                    Customer Information
                  </h3>
                  <p className="font-medium text-charcoal">{activeOrder.customer.name}</p>
                  <p className="text-charcoal/70">Email: {activeOrder.customer.email}</p>
                  <p className="text-charcoal/70">Phone: {activeOrder.customer.phone}</p>
                  <p className="text-charcoal/70">
                    Address: {activeOrder.customer.house}, {activeOrder.customer.street},{" "}
                    {activeOrder.customer.city}, {activeOrder.customer.state} - {activeOrder.customer.pincode}
                  </p>
                </div>

                {/* Items in order */}
                <div className="space-y-3">
                  <h3 className="font-serif text-base text-charcoal font-medium">
                    Order Items ({activeOrder.items.length})
                  </h3>
                  <div className="space-y-2">
                    {activeOrder.items.map((i) => (
                      <div key={i.id} className="flex justify-between items-center p-3 bg-[#FAF8F5] border border-[#EBE3D8]">
                        <div>
                          <p className="font-medium text-charcoal">{i.product_name}</p>
                          {i.variant_title && <p className="text-taupe text-[10px]">{i.variant_title}</p>}
                          <p className="text-taupe text-[10px]">
                            Qty: {i.quantity} &bull; Selling Price: ₹{i.unit_selling_price} &bull; Supplier Cost: ₹{i.unit_supplier_cost}
                          </p>
                        </div>
                        <span className="font-medium text-charcoal font-mono">
                          ₹{i.total_price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MANUAL SUPPLIER FULFILMENT FORM */}
                <form onSubmit={handleUpdateOrder} className="bg-white border-2 border-champagne p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-champagne pb-2">
                    <Truck className="w-4 h-4 text-taupe-dark" />
                    <h3 className="font-serif text-base text-charcoal font-medium">
                      Manual Supplier Fulfilment Actions
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-charcoal font-medium uppercase tracking-wider">
                      Update Order Status *
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full bg-ivory/40 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal cursor-pointer capitalize"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st.key} value={st.key}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-charcoal font-medium uppercase tracking-wider">
                      Supplier Order Reference / PO #
                    </label>
                    <input
                      type="text"
                      value={supplierRef}
                      onChange={(e) => setSupplierRef(e.target.value)}
                      placeholder="e.g. SUP-AURA-98214"
                      className="w-full bg-ivory/40 border border-champagne p-2.5 text-xs text-charcoal font-mono focus:outline-none focus:border-charcoal"
                    />
                    <span className="text-[10px] text-taupe">
                      Reference number from the authorized supplier invoice/order
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-charcoal font-medium uppercase tracking-wider">
                        Courier Partner
                      </label>
                      <input
                        type="text"
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value)}
                        placeholder="BlueDart / Delhivery"
                        className="w-full bg-ivory/40 border border-champagne p-2.5 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-charcoal font-medium uppercase tracking-wider">
                        Tracking / AWB #
                      </label>
                      <input
                        type="text"
                        value={trackingNum}
                        onChange={(e) => setTrackingNum(e.target.value)}
                        placeholder="e.g. BD7788990021"
                        className="w-full bg-ivory/40 border border-champagne p-2.5 text-xs text-charcoal font-mono focus:outline-none focus:border-charcoal"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-charcoal font-medium uppercase tracking-wider">
                      Actual Shipping Cost Incurred (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={actualShippingCost}
                      onChange={(e) => setActualShippingCost(Number(e.target.value))}
                      className="w-full bg-ivory/40 border border-champagne p-2.5 text-xs text-charcoal font-mono focus:outline-none focus:border-charcoal"
                    />
                    <span className="text-[10px] text-taupe">
                      Used for accurate gross contribution calculations
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-boutique-primary w-full py-3"
                  >
                    {updating ? "Saving Changes..." : "Save Fulfilment & Update Status"}
                  </button>
                </form>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
