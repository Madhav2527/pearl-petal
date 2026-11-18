"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "orders" | "shipping" | "care" | "returns" | "gifting";
}

const FAQS: FAQItem[] = [
  {
    category: "orders",
    question: "Why does Petal & Pearl operate exclusively on prepaid orders?",
    answer: "We are an artisanal boutique. Every piece is curated, inspected, and packed in luxury keepsake packaging. Operating exclusively on prepaid transactions (UPI, Cards, NetBanking) allows us to dedicate resources to premium unboxing materials, avoid shipping wastage, and maintain fast, insured dispatch timelines.",
  },
  {
    category: "orders",
    question: "Which payment methods are accepted?",
    answer: "We support all major Indian digital payment modes via our 256-bit encrypted Razorpay gateway: Instant UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, MasterCard, RuPay), and Internet Banking from 50+ Indian banks.",
  },
  {
    category: "shipping",
    question: "What is your shipping timeline and which courier partners are used?",
    answer: "All in-stock orders are prepared and dispatched within 24–48 business hours from our studio. We partner with India's premier express couriers (BlueDart and Delhivery). Standard delivery across tier-1 and metro cities takes 3–5 business days, while other locations take 4–6 business days.",
  },
  {
    category: "shipping",
    question: "How do I qualify for complimentary shipping?",
    answer: "All orders totaling ₹999 or above automatically receive Free Express Delivery at checkout. For orders under ₹999, a flat shipping fee of ₹99 is charged to cover secure express courier handling.",
  },
  {
    category: "care",
    question: "Are your pearls natural freshwater baroque pearls?",
    answer: "Yes. We source genuine, ethically harvested freshwater baroque pearls. Because nature shapes them over months without artificial molds, each baroque pearl features its own unique organic form, subtle ridges, and natural iridescence. No two pairs are ever identical.",
  },
  {
    category: "care",
    question: "How should I care for my baroque pearl jewelry and silk hair accessories?",
    answer: "Pearls thrive on gentle care. As a golden rule: 'Last on, first off.' Put your pearls on after perfume, lotions, and hairspray have dried. To clean, gently wipe with a soft, damp cloth and store them in your Petal & Pearl velvet pouch away from abrasive metals. For silk accessories, spot clean with cold water and mild silk detergent.",
  },
  {
    category: "returns",
    question: "What is your policy if an item arrives damaged in transit?",
    answer: "We pack every order with thick cushioning inside rigid boxes. However, if your parcel arrives damaged or with a defect, contact us at hello@thepearlpetals.in within 7 days of delivery with an unboxing photo or video, and we will dispatch a brand-new replacement immediately at zero additional cost.",
  },
  {
    category: "returns",
    question: "Can I return earrings if I change my mind?",
    answer: "For hygiene and sanitation reasons in accordance with Indian consumer health standards, earrings cannot be returned or exchanged once their hygiene seal has been opened, unless there is a verifiable manufacturing defect or transit damage.",
  },
  {
    category: "gifting",
    question: "Can I send an order directly as a gift without pricing information inside?",
    answer: "Yes! All Petal & Pearl orders are packed in unbranded external mailers containing our signature embossed gift box, tissue, and champagne ribbon. We do not insert price tags inside the jewelry box. Tax invoices are sent exclusively to the purchaser's email address.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openIndices, setOpenIndices] = useState<number[]>([0, 2]); // First few open by default

  const toggleIndex = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const filteredFaqs = activeCategory === "all"
    ? FAQS
    : FAQS.filter((f) => f.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
          Knowledge Base &bull; Boutique Care
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70 font-sans max-w-md mx-auto font-light">
          Everything you need to know about our handcrafted pearls, prepaid checkout, unboxing care, and express dispatch.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#EBE3D8] pb-4">
        {[
          { label: "All Questions", value: "all" },
          { label: "Orders & Payments", value: "orders" },
          { label: "Shipping & Delivery", value: "shipping" },
          { label: "Jewelry Care", value: "care" },
          { label: "Returns & Replacements", value: "returns" },
          { label: "Gifting", value: "gifting" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveCategory(tab.value)}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-sans transition-all ${
              activeCategory === tab.value
                ? "bg-charcoal text-white font-medium"
                : "bg-white border border-[#EBE3D8] text-charcoal/70 hover:border-champagne hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion FAQ list */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={faq.question}
              className="bg-white border border-[#EBE3D8] transition-all hover:border-champagne"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <h3 className="font-serif text-lg sm:text-xl text-charcoal leading-snug">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-4 h-4 text-taupe shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-charcoal" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-charcoal/80 font-sans font-light leading-relaxed border-t border-[#EBE3D8]/50">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Help Banner */}
      <div className="bg-ivory/60 border border-champagne p-8 text-center space-y-3">
        <Sparkles className="w-5 h-5 text-taupe mx-auto" />
        <h3 className="font-serif text-xl text-charcoal">Have an unanswered question?</h3>
        <p className="text-xs text-charcoal/70 font-sans max-w-sm mx-auto font-light">
          Our boutique concierge team is always delighted to assist you directly.
        </p>
        <div className="pt-2">
          <Link href="/contact" className="btn-boutique-primary">
            Contact Concierge
          </Link>
        </div>
      </div>

    </div>
  );
}
