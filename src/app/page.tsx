import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Gem, Gift, Heart, Shield } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getPublicProducts } from "@/lib/public-catalog";
import { CATEGORIES_DATA } from "@/data/seed-data";

export default function HomePage() {
  const allProducts = getPublicProducts();
  const featured = allProducts.filter((p) => p.is_featured).slice(0, 4);
  const bestsellers = allProducts.filter((p) => p.is_bestseller).slice(0, 4);
  const newArrivals = allProducts.filter((p) => p.is_new).slice(0, 4);

  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[82vh] flex items-center justify-center bg-[#F7F3EE] overflow-hidden">
        {/* Soft atmospheric gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/80 via-[#FAF6F0] to-cream pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 border border-champagne text-charcoal text-[11px] uppercase tracking-widest font-sans rounded-none shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-taupe-dark" />
              <span>Spring / Summer 2026 Collection</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.08] text-charcoal font-normal">
              Gentle adornments for <span className="italic font-light text-taupe-dark">everyday grace.</span>
            </h1>

            <p className="text-sm sm:text-base text-charcoal/80 max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed font-light">
              Petal &amp; Pearl creates mindful accessories — organic freshwater baroque pearls, double-faced French silk bows, and keepsakes crafted with exquisite softness.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/shop" className="btn-boutique-primary w-full sm:w-auto px-8 py-4">
                Explore The Collection
              </Link>
              <Link href="/category/jewellery" className="btn-boutique-secondary w-full sm:w-auto px-8 py-4">
                View Baroque Pearls
              </Link>
            </div>

            {/* Quick micro-trust indicators */}
            <div className="pt-6 border-t border-[#EBE3D8]/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[11px] uppercase tracking-wider text-taupe-dark font-sans">
              <span className="flex items-center gap-1.5">
                <Gem className="w-3.5 h-3.5 text-champagne-dark" /> Hand-Selected Pearls
              </span>
              <span className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-champagne-dark" /> Keepsake Packaging
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-champagne-dark" /> Prepaid Express Delivery
              </span>
            </div>
          </div>

          {/* Hero Imagery Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] max-w-md mx-auto shadow-2xl border-8 border-white overflow-hidden bg-ivory">
              <Image
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85"
                alt="Petal & Pearl Baroque Jewelry editorial portrait"
                fill
                priority
                className="object-cover object-center scale-[1.02] hover:scale-105 transition-transform duration-1000"
              />
            </div>

            {/* Secondary Floating Floating Card */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 border border-champagne shadow-lg max-w-[210px]">
              <span className="text-[9px] uppercase tracking-widest text-taupe font-sans block mb-1">
                Boutique Signature
              </span>
              <p className="font-serif text-sm text-charcoal leading-snug">
                Baroque Pearl Drop Earrings
              </p>
              <span className="text-xs font-medium text-charcoal block mt-1">₹350</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block mb-2">
            Curated Categories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
            Treasures for Every Aesthetic
          </h2>
          <div className="w-12 h-px bg-champagne mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-ivory border border-[#EBE3D8] flex flex-col justify-end p-6"
            >
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent transition-opacity group-hover:from-charcoal/85" />
              
              <div className="relative z-10 text-white space-y-1">
                <h3 className="font-serif text-2xl tracking-wide group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </h3>
                <span className="text-[11px] uppercase tracking-widest text-champagne-light font-sans flex items-center gap-1">
                  Discover <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-[#EBE3D8]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-taupe font-sans block mb-1">
              Curated Selection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
              Featured Boutique Keepsakes
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest font-sans text-charcoal hover:text-taupe flex items-center gap-1.5 mt-3 sm:mt-0 transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. BRAND STORY HIGHLIGHT */}
      <section className="bg-ivory border-y border-champagne/40 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] text-taupe font-sans block">
            The Petal &amp; Pearl Philosophy
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl text-charcoal font-normal max-w-3xl mx-auto leading-tight">
            &ldquo;We believe quiet elegance should be an everyday luxury, not an occasional indulgence.&rdquo;
          </h2>

          <p className="text-sm sm:text-base text-charcoal/80 font-sans max-w-2xl mx-auto font-light leading-relaxed">
            Founded with a reverence for organic shapes and natural textures, Petal &amp; Pearl bridges delicate Parisian romance with effortless daily wear. From baroque freshwater pearls formed uniquely by water to double-faced silk ribbons woven for graceful movement, we celebrate beauty in every little detail.
          </p>

          <div className="pt-4">
            <Link href="/about" className="btn-boutique-secondary">
              Read Our Full Story
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-[#EBE3D8]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-taupe font-sans block mb-1">
              Most Loved Pieces
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
              Boutique Bestsellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest font-sans text-charcoal hover:text-taupe flex items-center gap-1.5 mt-3 sm:mt-0 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-[#EBE3D8]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-taupe font-sans block mb-1">
              Fresh Off The Bench
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
              New Season Arrivals
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest font-sans text-charcoal hover:text-taupe flex items-center gap-1.5 mt-3 sm:mt-0 transition-colors"
          >
            <span>See New In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. UNBOXING EXPERIENCE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#EBE3D8] p-8 sm:p-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-xs uppercase tracking-widest text-taupe font-sans block">
              The Unboxing Ritual
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
              Every parcel is treated as a gift to yourself.
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/70 font-sans leading-relaxed">
              We never pack your orders in plain plastic mailers. Every single Petal &amp; Pearl creation is cushioned inside an embossed rigid box, enveloped in botanical tissue, and tied with a champagne grosgrain bow. Complete with care guidance and a handwritten thank you card.
            </p>
            <div className="pt-2">
              <Link href="/category/gifts" className="btn-boutique-primary">
                Explore Gift Sets
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 relative aspect-[4/3] overflow-hidden border border-champagne shadow-sm bg-white">
            <Image
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"
              alt="Petal & Pearl gift packaging presentation"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
