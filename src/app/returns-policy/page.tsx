import Link from "next/link";
import { ShieldAlert, RotateCcw, CheckCircle2, Clock } from "lucide-react";

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Title */}
      <div className="border-b border-[#EBE3D8] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block mb-1">
          Boutique Assurance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal">
          Returns &amp; Refund Policy
        </h1>
        <p className="text-xs text-taupe font-sans mt-2">
          Effective Date: February 2026 &bull; Petal &amp; Pearl (thepearlpetals.in)
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-charcoal/80 font-sans font-light leading-relaxed space-y-8">
        
        {/* Important Hygiene Notice */}
        <div className="bg-amber-50/70 border border-amber-200 p-6 space-y-2 not-prose">
          <div className="flex items-center gap-2 text-amber-900 font-medium text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Important Notice Concerning Hygiene &amp; Personal Adornment</span>
          </div>
          <p className="text-xs text-amber-900/80 leading-relaxed font-sans">
            In compliance with Indian public health and sanitary standards, earrings, piercings, and personal hair accessories are classified as personal hygiene products. Once their protective packaging seal is broken, they cannot be returned for change of mind. We gladly replace any piece that arrives damaged or with a defect.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">1. 7-Day Replacement Guarantee</h2>
          <p>
            We take tremendous care in packing our delicate baroque pearls and accessories. However, if your order arrives damaged, defective, or incorrect, you are entitled to a complimentary replacement under our 7-Day Replacement Guarantee.
          </p>
          <p>
            <strong>Eligibility Criteria:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>The issue must be reported to <a href="mailto:hello@thepearlpetals.in" className="underline text-charcoal">hello@thepearlpetals.in</a> within 7 calendar days of delivery.</li>
            <li>The item must be in its original condition, unworn, with all tags intact, and housed in its original Petal &amp; Pearl keepsake box.</li>
            <li>A clear unboxing photograph or short video showing the damage, defective clasp, or incorrect item must be provided.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">2. How to Request a Replacement</h2>
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
            <li>Email our concierge at <a href="mailto:hello@thepearlpetals.in" className="underline text-charcoal font-medium">hello@thepearlpetals.in</a> with the subject line <code>Replacement Request - [Your Order Number]</code>.</li>
            <li>Attach photos/video highlighting the defect along with a brief description.</li>
            <li>Our quality assessment team will review your request within 24 business hours.</li>
            <li>Upon approval, we will schedule a reverse pickup through BlueDart/Delhivery or dispatch a brand-new replacement immediately at zero extra charge.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">3. Refund Processing &amp; Timelines</h2>
          <p>
            If a replacement cannot be provided due to batch stock unavailability or permanent discontinuation of the piece, a full refund will be issued:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>
              <strong>Source Account Refund:</strong> The refund is credited directly to the original payment source (UPI account, Credit/Debit Card, or Bank Account used at checkout).
            </li>
            <li>
              <strong>Settlement Timeline:</strong> Refunds are initiated by our finance desk within 48 hours of approval. Depending on your bank or card network, the funds will reflect in your account within <strong>5–7 business days</strong>.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">4. Non-Returnable Scenarios</h2>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Items returned without original packaging, tags, or evidence of having been worn.</li>
            <li>Products damaged due to misuse, contact with chemical perfumes/hair dyes, or improper storage outside our care guidelines.</li>
            <li>Requests initiated after the expiry of the 7-day delivery window.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-[#EBE3D8] pt-6">
          <h2 className="font-serif text-xl text-charcoal font-normal">Need Guidance?</h2>
          <p className="text-xs text-charcoal/70">
            For any queries regarding replacement status or product care, write to us anytime at{" "}
            <a href="mailto:hello@thepearlpetals.in" className="underline text-charcoal font-medium">hello@thepearlpetals.in</a>.
          </p>
        </section>

      </div>

    </div>
  );
}
