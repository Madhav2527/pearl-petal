"use client";

import { useState } from "react";
import { Mail, Clock, MessageSquare, CheckCircle2, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    subject: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
          Concierge &bull; Customer Care
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal">
          We&apos;re Here to Help
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70 font-sans font-light leading-relaxed">
          Have an inquiry regarding your order, styling advice, or custom bridal gift sets? Our boutique concierge is delighted to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Direct Info */}
        <div className="lg:col-span-5 space-y-8 bg-ivory/50 border border-champagne p-6 sm:p-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-taupe font-sans block mb-1">
              Direct Contact
            </span>
            <h2 className="font-serif text-2xl text-charcoal">Get in Touch</h2>
          </div>

          <div className="space-y-6 text-xs font-sans">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-taupe-dark shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Email Inquiries</p>
                <a
                  href="mailto:hello@thepearlpetals.in"
                  className="text-taupe-dark underline underline-offset-4 hover:text-charcoal transition-colors font-medium mt-0.5 block"
                >
                  hello@thepearlpetals.in
                </a>
                <p className="text-charcoal/60 text-[11px] mt-1 font-light">
                  Average response time: within 24 business hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-taupe-dark shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Concierge Hours</p>
                <p className="text-charcoal/80 mt-0.5">Monday to Saturday</p>
                <p className="text-charcoal/80">10:00 AM – 6:00 PM IST</p>
                <p className="text-charcoal/60 text-[11px] mt-1 font-light">
                  Closed on Sundays and National Gazetted Holidays.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-taupe-dark shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Order &amp; Tracking Queries</p>
                <p className="text-charcoal/70 mt-0.5 leading-relaxed font-light">
                  Please keep your 10-digit order reference (e.g. #PP-2026-1001) handy when messaging us for expedited service.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-champagne/60 text-[11px] text-taupe font-sans leading-relaxed">
            <p>
              Petal &amp; Pearl operates as a digital-first boutique based in India, shipping insured orders nationwide through BlueDart and Delhivery.
            </p>
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="lg:col-span-7 bg-white border border-[#EBE3D8] p-6 sm:p-8 space-y-6 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal">Inquiry Received</h3>
              <p className="text-xs text-charcoal/70 font-sans max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out to Petal &amp; Pearl. Our boutique concierge will respond to {formData.email} within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn-boutique-secondary mt-2"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-serif text-xl text-charcoal border-b border-[#EBE3D8] pb-3">
                Send Us a Note
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. priya@example.com"
                    className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    placeholder="e.g. PP-2026-1001"
                    className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-charcoal font-medium uppercase tracking-wider">
                    Inquiry Topic *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal cursor-pointer"
                  >
                    <option value="order">Order Tracking &amp; Delivery</option>
                    <option value="replacement">Transit Damage / Replacement</option>
                    <option value="gifting">Bridal &amp; Custom Gift Sets</option>
                    <option value="general">Product Care &amp; General Inquiries</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-xs font-sans">
                <label className="block text-charcoal font-medium uppercase tracking-wider">
                  How can we assist you? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share the details of your inquiry..."
                  className="w-full bg-ivory/30 border border-champagne p-3 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                />
              </div>

              <button type="submit" className="btn-boutique-primary w-full py-3.5">
                Submit Inquiry
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
