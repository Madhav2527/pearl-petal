import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Title */}
      <div className="border-b border-[#EBE3D8] pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block mb-1">
          Legal Agreement &bull; Boutique Terms
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-taupe font-sans mt-2">
          Effective Date: February 2026 &bull; Domain: thepearlpetals.in
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-charcoal/80 font-sans font-light leading-relaxed space-y-8">
        
        <p>
          Welcome to Petal &amp; Pearl. By accessing or purchasing from our boutique website at <strong>https://thepearlpetals.in</strong>, you agree to be bound by the following Terms and Conditions. Please review them mindfully before completing an order.
        </p>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">1. Brand Identity &amp; Authorized Use</h2>
          <p>
            &ldquo;Petal &amp; Pearl&rdquo; and the domain <code>thepearlpetals.in</code> operate as an independent boutique brand specializing in fine fashion jewelry, baroque pearls, and curated hair adornments. All editorial copywriting, photography, graphics, logos, and digital designs are the intellectual property of Petal &amp; Pearl and protected under Indian and international copyright laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">2. Organic Product Descriptions &amp; Natural Variations</h2>
          <p>
            We strive to display our products with the utmost visual fidelity. However, because our creations incorporate genuine natural freshwater baroque pearls, organic acetate, and hand-cut silk velvets, subtle variations in texture, iridescence, contour, and size are an intrinsic mark of natural beauty and authentic handcrafting. These natural nuances are not considered manufacturing defects.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">3. Pricing, Orders &amp; Prepaid Policy</h2>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>All prices listed on the website are in Indian Rupees (INR ₹) and are inclusive of applicable taxes.</li>
            <li>We do not offer Cash on Delivery (COD). Orders are only confirmed and fulfilled upon successful electronic payment authorization via our approved gateway.</li>
            <li>We reserve the right to decline or cancel orders in cases of pricing typographical errors or verifiable batch stock exhaustion. In such rare instances, any charged amount will be refunded in full immediately.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">4. Shipping &amp; Title Transfer</h2>
          <p>
            Orders are delivered to the recipient address provided during checkout. Risk of loss and title for all items pass to the customer upon delivery by our express courier partner (BlueDart / Delhivery). Detailed logistics timelines are governed by our <Link href="/shipping-policy" className="underline text-charcoal">Shipping Policy</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">5. Replacements &amp; Hygiene Standards</h2>
          <p>
            All replacement and refund inquiries are strictly subject to our <Link href="/returns-policy" className="underline text-charcoal">Returns &amp; Refund Policy</Link>. Specifically, earrings and pierced accessories are exempt from returns due to sanitary regulations once packaging seals are opened.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal font-normal">6. Governing Law &amp; Jurisdiction</h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with orders placed on <code>thepearlpetals.in</code> shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#EBE3D8] pt-6">
          <h2 className="font-serif text-xl text-charcoal font-normal">Contact Inquiries</h2>
          <p className="text-xs text-charcoal/70">
            For questions regarding these Terms, contact our boutique desk at{" "}
            <a href="mailto:hello@thepearlpetals.in" className="underline text-charcoal font-medium">hello@thepearlpetals.in</a>.
          </p>
        </section>

      </div>

    </div>
  );
}
