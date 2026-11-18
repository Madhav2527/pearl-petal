import Image from "next/image";
import Link from "next/link";
import { Sparkles, Heart, Feather, Gem } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-12 sm:py-20">
      
      {/* Hero Narrative */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <span className="text-xs uppercase tracking-[0.3em] text-taupe font-sans block">
          Our Story &bull; Est. 2026
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-charcoal font-normal leading-tight">
          Beauty in Every Little Detail.
        </h1>
        <p className="text-base sm:text-lg text-charcoal/80 font-sans font-light max-w-2xl mx-auto leading-relaxed">
          Petal &amp; Pearl was born from a desire for quiet romance in a fast-paced world. We believe jewelry and hair adornments are not mere accessories — they are tiny daily rituals of joy.
        </p>
      </section>

      {/* Editorial Split Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-[4/5] bg-ivory border border-[#EBE3D8] overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85"
              alt="Freshwater baroque pearls resting on natural linen"
              fill
              className="object-cover object-center"
            />
          </div>

          <div className="lg:col-span-6 space-y-6 lg:pl-6">
            <span className="text-xs uppercase tracking-widest text-taupe font-sans block">
              Mindful Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
              Embracing Nature&apos;s Organic Imperfections
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-charcoal/80 font-sans font-light leading-relaxed">
              <p>
                In an era dominated by synthetic beads and factory uniformity, we choose the warmth of natural freshwater baroque pearls. Shaped naturally over months by fresh currents, each baroque pearl carries its own undulating silhouette, subtle ridges, and ethereal iridescence.
              </p>
              <p>
                When you slip on a Petal &amp; Pearl piece, you are adorning yourself with a singular creation that cannot be cloned. Paired with 18k gold vermeil and hypoallergenic titanium stud backings, our pieces are designed to become treasured favorites in your jewelry tray.
              </p>
            </div>
            
            <div className="pt-2">
              <Link href="/category/jewellery" className="btn-boutique-primary">
                Explore Pearl Keepsakes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Pillars */}
      <section className="bg-ivory border-y border-champagne/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
              Core Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
              What Defines Petal &amp; Pearl
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 border border-[#EBE3D8] space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center mx-auto text-taupe-dark border border-champagne">
                <Gem className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-charcoal">Artisanal Curation</h3>
              <p className="text-xs text-charcoal/70 font-sans leading-relaxed font-light">
                We work directly with certified guild artisans and authorized wholesale studios who take genuine pride in hand-strung knots, durable nylon wire, and hand-cut silk velvets.
              </p>
            </div>

            <div className="bg-white p-8 border border-[#EBE3D8] space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center mx-auto text-taupe-dark border border-champagne">
                <Feather className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-charcoal">Small Batch Restocks</h3>
              <p className="text-xs text-charcoal/70 font-sans leading-relaxed font-light">
                Rather than stockpiling mass-produced units in massive warehouses, we produce and curate in intentional, limited batches. Every drop is inspected by hand before shipping.
              </p>
            </div>

            <div className="bg-white p-8 border border-[#EBE3D8] space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center mx-auto text-taupe-dark border border-champagne">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-charcoal">Prepaid Care &amp; Trust</h3>
              <p className="text-xs text-charcoal/70 font-sans leading-relaxed font-light">
                By maintaining a prepaid-only boutique model, we can invest meaningfully in luxury embossed keepsake boxes, complimentary insured shipping, and personal unboxing experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Note Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <Sparkles className="w-6 h-6 text-taupe mx-auto" />
        <h2 className="font-serif text-3xl text-charcoal">A Note to Our Community</h2>
        <p className="text-xs sm:text-sm text-charcoal/80 font-sans font-light leading-relaxed italic">
          &ldquo;Whether you are clipping your hair up for a morning espresso, fastening a baroque pearl necklace for an intimate wedding, or gifting a velvet pouch to someone special — we hope your Petal &amp; Pearl pieces bring you a quiet moment of delight.&rdquo;
        </p>
        <div className="pt-2">
          <p className="font-serif text-lg text-charcoal">The Petal &amp; Pearl Team</p>
          <span className="text-[11px] text-taupe font-sans uppercase tracking-widest block">
            thepearlpetals.in &bull; India
          </span>
        </div>
      </section>

    </div>
  );
}
