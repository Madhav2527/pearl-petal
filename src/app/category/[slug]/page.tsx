"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getPublicProducts } from "@/lib/public-catalog";
import { CATEGORIES_DATA } from "@/data/seed-data";
import { ArrowLeft, ArrowUpDown } from "lucide-react";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const categoryMeta = CATEGORIES_DATA.find((c) => c.slug === slug);
  if (!categoryMeta) {
    notFound();
  }

  const [allProducts, setAllProducts] = useState(() => getPublicProducts({ category: slug }));

  useEffect(() => {
    fetch(`/api/products?category=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {});
  }, [slug]);

  const [selectedSub, setSelectedSub] = useState<string>("all");
  const [onlyHottest, setOnlyHottest] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("relevance");

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (onlyHottest) {
      result = result.filter((p) => p.is_bestseller);
    }
    if (selectedSub !== "all") {
      result = result.filter((p) => p.subcategory === selectedSub);
    }
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.selling_price - b.selling_price);
        break;
      case "price-desc":
        result.sort((a, b) => b.selling_price - a.selling_price);
        break;
      case "hottest":
        result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
      case "newest":
        result.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        break;
      case "alpha":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "relevance":
      default:
        result.sort((a, b) => {
          const scoreB = (b.is_bestseller ? 4 : 0) + (b.is_featured ? 2 : 0) + (b.is_new ? 1 : 0);
          const scoreA = (a.is_bestseller ? 4 : 0) + (a.is_featured ? 2 : 0) + (a.is_new ? 1 : 0);
          return scoreB - scoreA;
        });
        break;
    }
    return result;
  }, [allProducts, selectedSub, onlyHottest, sortBy]);

  const hottestCount = allProducts.filter((p) => p.is_bestseller).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-sans text-taupe">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-charcoal transition-colors">Collections</Link>
        <span>/</span>
        <span className="text-charcoal font-medium">{categoryMeta.name}</span>
      </div>

      {/* Editorial Category Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
          Boutique Department
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal">
          {categoryMeta.name}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70 font-sans font-light leading-relaxed">
          {categoryMeta.description}
        </p>
      </div>

      {/* Subcategory Pills & Controls */}
      <div className="border-y border-[#EBE3D8] py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Subcategories */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedSub("all");
              setOnlyHottest(false);
            }}
            className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-sans transition-all ${
              selectedSub === "all" && !onlyHottest
                ? "bg-charcoal text-white font-medium"
                : "bg-white border border-[#EBE3D8] text-charcoal/70 hover:border-champagne hover:text-charcoal"
            }`}
          >
            All {categoryMeta.name} ({allProducts.length})
          </button>

          {hottestCount > 0 && (
            <button
              type="button"
              onClick={() => setOnlyHottest(!onlyHottest)}
              className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-sans transition-all flex items-center gap-1 ${
                onlyHottest
                  ? "bg-[#2D2A26] text-[#FAF8F5] font-medium shadow-sm"
                  : "bg-[#FAF7F2] border border-champagne text-[#C2714F] hover:border-charcoal font-medium"
              }`}
            >
              <span>🔥 Hottest Picks</span>
              <span className="text-[10px] opacity-80">({hottestCount})</span>
            </button>
          )}

          {categoryMeta.subcategories.map((sub) => {
            const count = allProducts.filter((p) => p.subcategory === sub.id).length;
            const isSelected = selectedSub === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setSelectedSub(sub.id);
                  setOnlyHottest(false);
                }}
                className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-sans transition-all flex items-center gap-1 ${
                  isSelected
                    ? "bg-charcoal text-white font-medium"
                    : "bg-white border border-[#EBE3D8] text-charcoal/70 hover:border-champagne hover:text-charcoal"
                }`}
              >
                <span>{sub.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] ${isSelected ? "opacity-80" : "text-taupe"}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-xs font-sans text-charcoal/80">
          <ArrowUpDown className="w-3.5 h-3.5 text-taupe" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-charcoal text-xs uppercase tracking-wider focus:outline-none cursor-pointer"
          >
            <option value="relevance">Relevance &bull; Curated</option>
            <option value="price-asc">Price: Low to High (₹)</option>
            <option value="price-desc">Price: High to Low (₹)</option>
            <option value="hottest">🔥 Hottest Picks First</option>
            <option value="newest">New Arrivals</option>
            <option value="alpha">Alphabetical (A - Z)</option>
          </select>
        </div>

      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-ivory/60 border border-champagne p-8 sm:p-12 space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-champagne text-[10px] uppercase tracking-widest text-charcoal font-sans">
            ✦ DROP 01 IN PREPARATION
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-charcoal">
            {categoryMeta.name} Pieces Dropping Soon
          </h3>
          <p className="text-xs text-charcoal/70 font-sans leading-relaxed max-w-md mx-auto">
            Our atelier is stocking this collection with hand-selected pieces. Explore our other vibes or check back during the next drop.
          </p>
          <div className="pt-2">
            <Link href="/shop" className="btn-boutique-primary">
              View All Boutique Vibes
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Back to shop */}
      <div className="pt-8 text-center">
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-sans text-charcoal hover:text-taupe transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Explore All Categories</span>
        </Link>
      </div>

    </div>
  );
}
