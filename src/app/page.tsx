"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Gem,
  Gift,
  Heart,
  Shield,
  Check,
  Droplets,
  Star,
  Instagram,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { PublicProduct } from "@/lib/types";

const VIBES = [
  {
    id: "clean-girl",
    title: "Clean Girl Minimalist",
    tag: "#CleanGirlAesthetic",
    categorySlug: "jewellery",
    description: "Dainty 18k gold vermeil, organic seed pearls, and everyday delicate chains you never have to take off.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    pill: "Waterproof Gold & Seed Pearls",
  },
  {
    id: "french-it-girl",
    title: "French It-Girl Hair",
    tag: "#FrenchItGirl",
    categorySlug: "hair-accessories",
    description: "Italian cellulose acetate claw clips & double-faced French velvet ribbons for the effortless off-duty updo.",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
    pill: "Cellulose Acetate & Silk",
  },
  {
    id: "baroque-pearl",
    title: "Baroque Pearl Romance",
    tag: "#ThatGirlEnergy",
    categorySlug: "jewellery",
    description: "Sculpted freshwater baroque drops where no two pearls are ever the same shape. Organic luxury.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    pill: "100% Real Freshwater Pearls",
  },
  {
    id: "lover-girl",
    title: "The Lover Girl Vault",
    tag: "#LoverGirlAesthetic",
    categorySlug: "gifts",
    description: "Embossed rigid keepsake drawer boxes, wax-sealed handwritten notes, and artisan phone charms.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    pill: "Signature Unboxing Keepsake",
  },
];

const FEED_POSTS = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    handle: "@aaradhya.vibe",
    caption: "The baroque drops are literally my personality now ✨",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80",
    handle: "@ria.pinterest",
    caption: "French claw clip that actually holds all my hair 🤌",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    handle: "@tara_cleanfit",
    caption: "Wore this necklace in the shower for 2 weeks. Zero tarnish 🤍",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    handle: "@itgirlunboxing",
    caption: "The unboxing ribbon and wax seal is everything 🎀",
  },
];

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<PublicProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // VIP Drop List Form State
  const [vipEmail, setVipEmail] = useState("");
  const [submittingVip, setSubmittingVip] = useState(false);
  const [vipMessage, setVipMessage] = useState("");
  const [vipSuccess, setVipSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipEmail || !vipEmail.includes("@")) return;

    setSubmittingVip(true);
    setVipMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: vipEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setVipSuccess(true);
        setVipMessage(data.message || "You are on the VIP Close Friends list! Welcome code WELCOME10 is saved.");
        setVipEmail("");
      } else {
        setVipMessage(data.error || "Could not register email. Please try again.");
      }
    } catch {
      setVipMessage("Network error. Please try again.");
    } finally {
      setSubmittingVip(false);
    }
  };

  // Exactly one standout hottest pick per category for the homepage
  const categoryHottestPicks = useMemo(() => {
    const categoryDefs = [
      { id: "jewellery", label: "✨ Jewellery & Pearls", icon: "✨" },
      { id: "press-on-nails", label: "💅 Press-On Nails", icon: "💅" },
      { id: "hair-accessories", label: "🎀 Hair Accessories", icon: "🎀" },
      { id: "everyday-essentials", label: "🤍 Everyday Essentials", icon: "🤍" },
    ];

    const picks: Array<{ categoryMeta: { id: string; label: string; icon: string }; product: PublicProduct }> = [];
    const seenCats = new Set<string>();

    for (const cat of categoryDefs) {
      const product =
        allProducts.find((p) => p.category === cat.id && p.is_bestseller) ||
        allProducts.find((p) => p.category === cat.id);
      if (product) {
        picks.push({ categoryMeta: cat, product });
        seenCats.add(cat.id);
      }
    }

    // Include 1 from any other category (e.g. gifts) if present
    for (const p of allProducts) {
      if (p.is_bestseller && !seenCats.has(p.category)) {
        picks.push({
          categoryMeta: {
            id: p.category,
            label: p.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            icon: "✦",
          },
          product: p,
        });
        seenCats.add(p.category);
      }
    }

    return picks;
  }, [allProducts]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* ========================================================================= */}
      {/* 1. CONTINUOUS AESTHETIC TICKER MARQUEE                                    */}
      {/* ========================================================================= */}
      <div className="bg-[#FAF7F2] border-y border-[#EBE3D8] py-2.5 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee flex items-center gap-8 text-[11px] uppercase tracking-[0.25em] text-charcoal/85 font-sans">
          <span>✦ THAT GIRL AESTHETIC</span>
          <span className="text-champagne-dark">•</span>
          <span>WATERPROOF &amp; TARNISH-FREE</span>
          <span className="text-champagne-dark">•</span>
          <span>100% ORGANIC FRESHWATER BAROQUE PEARLS</span>
          <span className="text-champagne-dark">•</span>
          <span>COMPLIMENTARY BOUTIQUE PACKAGING</span>
          <span className="text-champagne-dark">•</span>
          <span>FREE SHIPPING OVER ₹999</span>
          <span className="text-champagne-dark">•</span>
          <span>NO GREEN SKIN ERA</span>
          <span className="text-champagne-dark">•</span>
          <span>ITALIAN CELLULOSE CLAW CLIPS</span>
          <span className="text-champagne-dark">•</span>
          <span>FRENCH SILK RIBBONS</span>
          <span className="text-champagne-dark">•</span>
          {/* Duplicate set for endless smooth loop */}
          <span>✦ THAT GIRL AESTHETIC</span>
          <span className="text-champagne-dark">•</span>
          <span>WATERPROOF &amp; TARNISH-FREE</span>
          <span className="text-champagne-dark">•</span>
          <span>100% ORGANIC FRESHWATER BAROQUE PEARLS</span>
          <span className="text-champagne-dark">•</span>
          <span>COMPLIMENTARY BOUTIQUE PACKAGING</span>
          <span className="text-champagne-dark">•</span>
          <span>FREE SHIPPING OVER ₹999</span>
          <span className="text-champagne-dark">•</span>
          <span>NO GREEN SKIN ERA</span>
          <span className="text-champagne-dark">•</span>
          <span>ITALIAN CELLULOSE CLAW CLIPS</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GEN-Z EDITORIAL HERO SECTION                                           */}
      {/* ========================================================================= */}
      <section className="relative min-h-[84vh] flex items-center justify-center bg-[#F7F3EE] overflow-hidden">
        {/* Soft atmospheric radial gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/80 via-[#FAF6F0] to-cream pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Gen-Z Pill Tags */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-champagne text-charcoal text-[11px] uppercase tracking-widest font-sans shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-taupe-dark" />
              <span>The It-Girl Accessories Vault &bull; Drop 01</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.06] text-charcoal font-normal">
              Unapologetically feminine. <br />
              <span className="italic font-light text-taupe-dark">Curated for your feed.</span>
            </h1>

            <p className="text-sm sm:text-base text-charcoal/80 max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed font-light">
              Petal &amp; Pearl is the jewelry &amp; accessories sanctuary for the modern aesthetic girl. Organic freshwater baroque pearls, tarnish-free daily gold, and French atelier hair ribbons designed to make everyday a main character moment.
            </p>

            {/* Gen-Z Trending Hashtags / Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="px-3 py-1 bg-white/70 border border-[#EBE3D8] text-[10px] uppercase tracking-wider text-charcoal/80 font-sans">
                #CleanGirlAesthetic
              </span>
              <span className="px-3 py-1 bg-white/70 border border-[#EBE3D8] text-[10px] uppercase tracking-wider text-charcoal/80 font-sans">
                100% Water Resistant
              </span>
              <span className="px-3 py-1 bg-white/70 border border-[#EBE3D8] text-[10px] uppercase tracking-wider text-charcoal/80 font-sans">
                Tarnish-Free Era
              </span>
              <span className="px-3 py-1 bg-white/70 border border-[#EBE3D8] text-[10px] uppercase tracking-wider text-charcoal/80 font-sans">
                Real Baroque Pearls
              </span>
              <span className="px-3 py-1 bg-white/70 border border-[#EBE3D8] text-[10px] uppercase tracking-wider text-charcoal/80 font-sans">
                Zero Green Skin
              </span>
            </div>

            {/* CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/shop" className="btn-boutique-primary w-full sm:w-auto px-8 py-4 text-xs">
                Explore The Vault &rarr;
              </Link>
              <a href="#vibes" className="btn-boutique-secondary w-full sm:w-auto px-8 py-4 text-xs">
                Shop By Vibe
              </a>
            </div>

            {/* Micro-Trust Proof */}
            <div className="pt-6 border-t border-[#EBE3D8]/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[11px] uppercase tracking-wider text-taupe-dark font-sans">
              <span className="flex items-center gap-1.5">
                <Gem className="w-3.5 h-3.5 text-champagne-dark" /> Natural Baroque Pearls
              </span>
              <span className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-champagne-dark" /> Ribbon Keepsake Box
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-champagne-dark" /> Free Express Over ₹999
              </span>
            </div>
          </div>

          {/* Right Column: Pinterest Editorial Portrait with Floating Accents */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] max-w-md mx-auto shadow-2xl border-8 border-white overflow-hidden bg-ivory">
              <Image
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85"
                alt="Petal & Pearl Baroque Pearl Editorial"
                fill
                priority
                className="object-cover object-center scale-[1.02] hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Top-Right Aesthetic Sticker */}
            <div className="hidden sm:block absolute -top-4 -right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 border border-champagne shadow-md text-center">
              <span className="text-[9px] uppercase tracking-widest text-charcoal font-semibold font-sans flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-champagne-dark" /> DROP 01 LIVE
              </span>
            </div>

            {/* Floating Bottom-Left Customer Review Card */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 border border-champagne shadow-lg max-w-[230px]">
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="font-serif text-xs text-charcoal italic leading-snug">
                &ldquo;Literal Pinterest board IRL. Never taking these pearls off.&rdquo;
              </p>
              <span className="text-[10px] text-taupe font-sans block mt-1.5 uppercase tracking-wider">
                &bull; @aaradhya.vibe
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SHOP BY VIBE (THE 4 GEN-Z AESTHETIC ERAS)                              */}
      {/* ========================================================================= */}
      <section id="vibes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block mb-2">
            Curate Your Era
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-charcoal">
            Shop By Vibe
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/70 font-sans mt-2 font-light">
            Because jewelry is the punctuation mark of every fit.
          </p>
          <div className="w-12 h-px bg-champagne mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VIBES.map((vibe) => (
            <Link
              key={vibe.id}
              href={`/category/${vibe.categorySlug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-ivory border border-[#EBE3D8] flex flex-col justify-end p-6 hover:border-champagne transition-all"
            >
              <Image
                src={vibe.image}
                alt={vibe.title}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent transition-opacity group-hover:from-charcoal/90" />
              
              <div className="relative z-10 text-white space-y-2">
                <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md text-[9px] uppercase tracking-widest text-white font-sans">
                  {vibe.tag}
                </span>
                <h3 className="font-serif text-2xl tracking-wide group-hover:translate-x-1 transition-transform leading-tight">
                  {vibe.title}
                </h3>
                <p className="text-[11px] text-white/80 font-sans line-clamp-2 font-light">
                  {vibe.description}
                </p>
                <span className="text-[10px] uppercase tracking-widest text-champagne-light font-sans flex items-center gap-1 pt-1">
                  Explore Vibe <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE VIRAL EDIT: 1 HOTTEST PICK PER CATEGORY                            */}
      {/* ========================================================================= */}
      {categoryHottestPicks.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-[#EBE3D8]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[#C2714F] font-sans font-medium mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C2714F]" />
                <span>The Viral Edit &bull; One Standout Pick Per Department</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
                Hottest Picks of the Season
              </h2>
              <p className="text-xs sm:text-sm text-charcoal/70 font-sans font-light mt-1">
                Our single most viral hero piece from each category, curated for your feed.
              </p>
            </div>
            <Link
              href="/shop?filter=hottest"
              className="text-xs uppercase tracking-widest font-sans text-charcoal hover:text-taupe flex items-center gap-2 mt-4 sm:mt-0 transition-colors border-b border-charcoal/30 pb-0.5 hover:border-charcoal"
            >
              <span>View All Hottest Picks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {categoryHottestPicks.map(({ categoryMeta, product }) => (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-taupe-dark font-sans px-1">
                  <span>{categoryMeta.label}</span>
                  <span className="text-[10px] text-[#C2714F] font-medium">★ Top Pick</span>
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Explore full boutique vault CTA */}
          <div className="pt-6 text-center border-t border-[#EBE3D8]">
            <Link
              href="/shop"
              className="btn-boutique-primary inline-flex items-center gap-2 px-8 py-4 text-xs tracking-widest uppercase font-sans shadow-sm"
            >
              <span>Explore The Full Boutique Vault ({allProducts.length}+ Pieces)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      ) : (
        /* Empty Product Slate: Gen-Z Drop 01 Incoming Vault Showcase */
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#FAF7F2] via-white to-ivory border border-champagne p-8 sm:p-14 shadow-sm relative overflow-hidden">
            
            <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-champagne text-[11px] uppercase tracking-widest text-charcoal font-sans shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-taupe-dark" />
                <span>The Vault Is Stocking &bull; Drop 01 Incoming</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl text-charcoal leading-tight">
                Curating Drop 01 for your feed.
              </h2>

              <p className="text-xs sm:text-sm text-charcoal/75 font-sans leading-relaxed max-w-xl mx-auto font-light">
                Our founders are hand-selecting real freshwater baroque pearls, tarnish-free gold chains, and French silk ribbons. Add your email to get 1-hour VIP early access before it drops on Instagram.
              </p>

              {/* VIP Early Access Form */}
              <form onSubmit={handleVipSubmit} className="max-w-md mx-auto pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={vipEmail}
                    onChange={(e) => setVipEmail(e.target.value)}
                    placeholder="Enter your email for VIP early access..."
                    className="flex-1 bg-white border border-champagne px-4 py-3.5 text-xs text-charcoal placeholder:text-taupe focus:outline-none focus:border-charcoal font-sans"
                  />
                  <button
                    type="submit"
                    disabled={submittingVip}
                    className="btn-boutique-primary py-3.5 px-6 text-xs whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingVip ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Reserving...</span>
                      </>
                    ) : (
                      <>
                        <span>Get VIP Drop Link</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {vipMessage && (
                  <div
                    className={`p-3 text-xs font-sans flex items-center justify-center gap-2 ${
                      vipSuccess
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {vipSuccess && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    <span>{vipMessage}</span>
                  </div>
                )}
              </form>

              {/* 3 Drop Proof Pillars */}
              <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-[#EBE3D8] text-left">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-taupe font-sans font-semibold block">
                    01 &bull; 100% Water Resistant
                  </span>
                  <p className="text-xs text-charcoal/80 font-sans font-light">
                    Gym, shower, sleep without fear of green skin or discoloration.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-taupe font-sans font-semibold block">
                    02 &bull; Organic Baroque Pearls
                  </span>
                  <p className="text-xs text-charcoal/80 font-sans font-light">
                    Freshwater cultured pearls with bespoke natural contours. Never plastic.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-taupe font-sans font-semibold block">
                    03 &bull; Luxury Drawer Packaging
                  </span>
                  <p className="text-xs text-charcoal/80 font-sans font-light">
                    Signature rigid box, velvet pouch, satin ribbon and wax seal.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. THE VIBE CHECK (ANTI-FAST-FASHION PILLARS)                             */}
      {/* ========================================================================= */}
      <section className="bg-ivory border-y border-champagne/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
              The Quality Standard
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-charcoal">
              The Petal &amp; Pearl Vibe Check
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/70 font-sans font-light">
              Why thousands of girls are replacing fast-fashion jewelry with our keepsakes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white border border-[#EBE3D8] p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-taupe-dark">
                <Droplets className="w-5 h-5 text-taupe-dark" />
              </div>
              <h3 className="font-serif text-xl text-charcoal font-medium">
                No Green Skin, Ever
              </h3>
              <p className="text-xs text-charcoal/70 font-sans leading-relaxed font-light">
                Crafted over 316L waterproof stainless steel and heavy 18k gold vermeil. Wear it to your pilates class or in the shower without fading.
              </p>
            </div>

            <div className="bg-white border border-[#EBE3D8] p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-taupe-dark">
                <Gem className="w-5 h-5 text-taupe-dark" />
              </div>
              <h3 className="font-serif text-xl text-charcoal font-medium">
                Real Baroque Pearls
              </h3>
              <p className="text-xs text-charcoal/70 font-sans leading-relaxed font-light">
                We never use cheap coated plastic beads. Every single pearl is formed in clean freshwater with organic iridescent luster.
              </p>
            </div>

            <div className="bg-white border border-[#EBE3D8] p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-taupe-dark">
                <Gift className="w-5 h-5 text-taupe-dark" />
              </div>
              <h3 className="font-serif text-xl text-charcoal font-medium">
                Aesthetic Unboxing
              </h3>
              <p className="text-xs text-charcoal/70 font-sans leading-relaxed font-light">
                Every order is treated like a gift to yourself. Wrapped in botanical tissue, rigid embossed keepsake box, and champagne ribbon.
              </p>
            </div>

            <div className="bg-white border border-[#EBE3D8] p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-taupe-dark">
                <Sparkles className="w-5 h-5 text-taupe-dark" />
              </div>
              <h3 className="font-serif text-xl text-charcoal font-medium">
                Honest Atelier Pricing
              </h3>
              <p className="text-xs text-charcoal/70 font-sans leading-relaxed font-light">
                Direct from verified artisans with fixed, fair markups. Luxury quality without the 8x luxury department store tax.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. AS SEEN ON YOUR FEED (PINTEREST / INSTAGRAM MOSAIC)                     */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-[#EBE3D8]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-taupe font-sans block mb-1">
              Tagged On Instagram
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
              As Seen On Your Feed
            </h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-widest font-sans text-charcoal hover:text-taupe flex items-center gap-1.5 mt-3 sm:mt-0 transition-colors"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>@thepearlpetals.in</span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {FEED_POSTS.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square overflow-hidden bg-ivory border border-[#EBE3D8]"
            >
              <Image
                src={post.img}
                alt={post.caption}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-charcoal/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] uppercase tracking-wider text-champagne-light font-sans">
                  {post.handle}
                </span>
                <p className="font-serif text-xs italic mt-1 line-clamp-2">
                  &ldquo;{post.caption}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. UNBOXING RITUAL SHOWCASE BANNER                                        */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border border-[#EBE3D8] p-8 sm:p-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-xs uppercase tracking-widest text-taupe font-sans block">
              The Unboxing Ritual
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
              Every parcel is treated as a gift to yourself.
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/70 font-sans leading-relaxed font-light">
              We never pack your orders in plain plastic mailers. Every single Petal &amp; Pearl creation is cushioned inside an embossed rigid drawer box, enveloped in botanical tissue, and tied with a champagne grosgrain bow. Complete with care guidance and a handwritten thank you card.
            </p>
            <div className="pt-2">
              <Link href="/category/gifts" className="btn-boutique-primary text-xs">
                Explore Gift Sets &rarr;
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
