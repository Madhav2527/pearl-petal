import Link from "next/link";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Title */}
      <div className="border-b border-[#EBE3D8] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block mb-1">
          Customer Privacy &bull; DPDP Compliance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal">
          Privacy Policy
        </h1>
        <p className="text-xs text-taupe font-sans mt-2">
          Effective Date: February 2026 &bull; Petal &amp; Pearl (https://thepearlpetals.in)
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-charcoal/80 font-sans font-light leading-relaxed space-y-8">
        
        <p className="text-sm leading-relaxed">
          At Petal &amp; Pearl (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), operating the boutique website <strong>https://thepearlpetals.in</strong>, we respect your personal data and are dedicated to upholding the highest standards of confidentiality in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable Indian information technology statutes.
        </p>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">1. Personal Information We Collect</h2>
          <p>
            We collect only the personal information essential to fulfilling your orders and delivering a seamless boutique shopping experience:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Contact Details:</strong> Full Name, Email Address, and 10-digit Indian Mobile Number.</li>
            <li><strong>Fulfillment &amp; Delivery Details:</strong> House/Flat/Building name, Street address, City, State, PIN code, and Country.</li>
            <li><strong>Transaction Identifiers:</strong> Razorpay Payment Reference ID, Order Number, and timestamps (we NEVER record or store your card numbers, CVVs, or bank netbanking passwords).</li>
            <li><strong>Technical Telemetry:</strong> Device type, browser user-agent, and anonymized cookies for shopping cart persistence.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">2. How We Use Your Information</h2>
          <p>Your personal data is processed strictly for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Generating your digital order confirmation and tax invoice.</li>
            <li>Transmitting shipping and dispatch details to verified logistics partners (BlueDart / Delhivery) for doorstep parcel delivery.</li>
            <li>Providing order tracking updates via SMS and email.</li>
            <li>Responding to your customer service notes and concierge inquiries.</li>
            <li>Sending occasional boutique product drops and editorial newsletters (only if you opted in via our newsletter form).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">3. Non-Disclosure &amp; Zero Resale Guarantee</h2>
          <div className="bg-ivory/60 border border-champagne p-4 not-prose text-xs text-charcoal/80 space-y-1 font-sans">
            <span className="font-semibold text-charcoal flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-taupe-dark" /> We Do Not Sell or Monetize Your Personal Data
            </span>
            <p>
              We will never sell, rent, monetize, or license your contact details, purchase history, or personal profile to third-party advertising brokers, lead generation firms, or marketing agencies.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">4. Payment Information Security</h2>
          <p>
            All online prepaid transactions on Petal &amp; Pearl are routed through Razorpay, an RBI-authorized Payment Aggregator complying with PCI-DSS Level 1 specifications. Financial data is encrypted during transmission using TLS 1.3 / 256-bit encryption. Our servers never touch, view, or record your raw card digits or bank authentication passwords.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">5. Your Data Rights &amp; Grievance Officer</h2>
          <p>
            Under Indian data privacy regulations, you have the right to request access to the personal data we maintain about you, request corrections to erroneous address records, or request the deletion of your customer profile.
          </p>
          <p>
            For any privacy inquiries or to exercise your rights, please contact our designated Grievance Concierge at:
          </p>
          <div className="bg-white border border-[#EBE3D8] p-4 text-xs font-sans not-prose space-y-1">
            <p className="font-medium text-charcoal">Petal &amp; Pearl Grievance Desk</p>
            <p className="text-charcoal/80">Email: <a href="mailto:hello@thepearlpetals.in" className="underline font-medium">hello@thepearlpetals.in</a></p>
            <p className="text-charcoal/60 text-[11px]">Domain: thepearlpetals.in &bull; Republic of India</p>
          </div>
        </section>

      </div>

    </div>
  );
}
