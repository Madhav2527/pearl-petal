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
  const [sortBy, setSortBy] = useState<string>("featured");

  const filtered = useMemo(() => {
    let result = [...allProducts];
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
      case "newest":
        result.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }
    return result;
  }, [allProducts, selectedSub, sortBy]);

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
            onClick={() => setSelectedSub("all")}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-sans transition-all ${
              selectedSub === "all"
                ? "bg-charcoal text-white font-medium"
                : "bg-white border border-[#EBE3D8] text-charcoal/70 hover:border-champagne hover:text-charcoal"
            }`}
          >
            All {categoryMeta.name}
          </button>
          {categoryMeta.subcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSub(sub.id)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-sans transition-all ${
                selectedSub === sub.id
                  ? "bg-charcoal text-white font-medium"
                  : "bg-white border border-[#EBE3D8] text-charcoal/70 hover:border-champagne hover:text-charcoal"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-xs font-sans text-charcoal/80">
          <ArrowUpDown className="w-3.5 h-3.5 text-taupe" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-charcoal text-xs uppercase tracking-wider focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="newest">New Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
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
