import Link from "next/link";
import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Title */}
      <div className="border-b border-[#EBE3D8] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block mb-1">
          Boutique Operations
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-xs text-taupe font-sans mt-2">
          Effective Date: February 2026 &bull; Domain: thepearlpetals.in
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-charcoal/80 font-sans font-light leading-relaxed space-y-8">
        
        {/* Key Highlights Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose bg-ivory/50 border border-champagne p-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-charcoal flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-taupe-dark" /> Dispatch SLA
            </span>
            <p className="text-xs text-charcoal/70">
              Orders dispatched within 24–48 business hours from order verification.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-charcoal flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-taupe-dark" /> Express Couriers
            </span>
            <p className="text-xs text-charcoal/70">
              Handed over to BlueDart Express or Delhivery with insured parcel tracking.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-charcoal flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-taupe-dark" /> Prepaid Model
            </span>
            <p className="text-xs text-charcoal/70">
              100% Prepaid orders only to ensure tamper-evident luxury unboxing.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">1. Geographic Coverage</h2>
          <p>
            Petal &amp; Pearl currently accepts orders and delivers exclusively within the Republic of India. We ship to over 19,000 serviceable Indian PIN codes across all States and Union Territories. International shipping is currently disabled while cross-border customs and legal requirements are being reviewed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">2. Shipping Fees &amp; Complimentary Threshold</h2>
          <p>
            We believe in honest, transparent pricing without hidden checkout surcharges:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>
              <strong>Orders totaling ₹999 and above:</strong> Complimentary Express Shipping across India.
            </li>
            <li>
              <strong>Orders below ₹999:</strong> A nominal flat shipping charge of ₹99 is applied to cover specialized express logistics and insured handling.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">3. Estimated Delivery Timelines</h2>
          <p>
            Once dispatched from our studio, the typical transit times are as follows:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Metro Cities (Mumbai, Delhi NCR, Bengaluru, Chennai, Kolkata, Hyderabad, Pune):</strong> 3–5 business days.</li>
            <li><strong>Tier 2 and Tier 3 Cities:</strong> 4–6 business days.</li>
            <li><strong>Northeast and Remote Regional Hubs:</strong> 6–8 business days.</li>
          </ul>
          <p className="text-xs text-taupe">
            *Please note that adverse weather conditions, national holidays, or regional logistical restrictions may occasionally extend transit times.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">4. Shipment Tracking &amp; Notifications</h2>
          <p>
            As soon as your parcel is manifested and picked up by our courier partner, you will receive an email and SMS containing your live Tracking AWB Number and a direct tracking URL. You can also monitor your journey anytime on our dedicated <Link href="/track-order" className="underline text-charcoal hover:text-taupe">Track Order</Link> page.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">5. Tamper-Evident Packaging &amp; Damaged Delivery</h2>
          <p>
            Every Petal &amp; Pearl piece is placed into our rigid boutique box, wrapped in custom tissue, and sealed in an outer protective security mailer. If you notice that the outer parcel is torn, unsealed, or visibly crushed upon delivery, please refuse the delivery or take an unboxing video and immediately notify our concierge team at <a href="mailto:hello@thepearlpetals.in" className="underline text-charcoal">hello@thepearlpetals.in</a>.
          </p>
        </section>

      </div>

    </div>
  );
}
