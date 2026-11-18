"use client";

import { useState, useMemo, useEffect } from "react";
import { Search as SearchIcon, X, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getPublicProducts } from "@/lib/public-catalog";

export default function SearchPage() {
  const [allProducts, setAllProducts] = useState(getPublicProducts());

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [allProducts, query]);

  const recommended = useMemo(
    () => allProducts.filter((p) => p.is_bestseller || p.is_featured).slice(0, 4),
    [allProducts]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      
      {/* Search Header & Input */}
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
          Boutique Discovery
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
          Find Your Next Keepsake
        </h1>

        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by pearl, choker, hair bow, phone charm, earrings..."
            autoFocus
            className="w-full bg-white border border-champagne px-5 py-4 pl-12 pr-12 text-sm text-charcoal placeholder:text-taupe focus:outline-none focus:border-charcoal shadow-sm font-sans"
          />
          <SearchIcon className="w-5 h-5 text-taupe absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Tag Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-sans text-taupe">
          <span>Popular searches:</span>
          {["Baroque Pearl", "Choker", "Claw Clip", "Silk Bow", "Gift Box", "Phone Charm"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="bg-white border border-[#EBE3D8] px-3 py-1 text-charcoal/80 hover:border-champagne hover:text-charcoal transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {query.trim() ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs font-sans text-taupe border-b border-[#EBE3D8] pb-3">
            <span>
              Showing {filtered.length} {filtered.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#EBE3D8] p-8 space-y-4">
              <Sparkles className="w-8 h-8 text-taupe mx-auto" />
              <h3 className="font-serif text-2xl text-charcoal">No exact matches found</h3>
              <p className="text-xs text-charcoal/70 font-sans max-w-sm mx-auto">
                We couldn&apos;t find any items matching &ldquo;{query}&rdquo;. Try another search or explore our most-loved pieces below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default State when no query is typed */
        <div className="space-y-8 pt-6">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-taupe font-sans block mb-1">
              Curated Recommendations
            </span>
            <h2 className="font-serif text-2xl text-charcoal">Trending in the Boutique</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
