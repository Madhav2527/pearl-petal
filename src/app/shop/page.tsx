"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { PublicProduct } from "@/lib/types";
import { ArrowUpDown, Filter, Sparkles, X } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<PublicProduct[]>([]);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Sync initial query params
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");
    const sortParam = searchParams.get("sort");

    if (filterParam === "hottest") {
      setActiveFilter("hottest");
    } else if (subcategoryParam) {
      setActiveFilter(`sub:${subcategoryParam}`);
    } else if (categoryParam) {
      setActiveFilter(`cat:${categoryParam}`);
    }

    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  // Compute counts for pills
  const counts = useMemo(() => {
    return {
      all: allProducts.length,
      hottest: allProducts.filter((p) => p.is_bestseller).length,
      clawClips: allProducts.filter((p) => p.subcategory === "claw-clips").length,
      hairBows: allProducts.filter((p) => p.subcategory === "hair-bows").length,
      scrunchies: allProducts.filter((p) => p.subcategory === "scrunchies").length,
      earrings: allProducts.filter((p) => p.subcategory === "earrings").length,
      necklaces: allProducts.filter((p) => p.subcategory === "necklaces").length,
      braceletsRings: allProducts.filter((p) => p.category === "jewellery" && (p.subcategory === "bracelets" || p.subcategory === "rings")).length,
      everyday: allProducts.filter((p) => p.category === "everyday-essentials").length,
      gifts: allProducts.filter((p) => p.category === "gifts").length,
    };
  }, [allProducts]);

  const filterOptions = [
    { id: "all", label: "All Items", count: counts.all },
    { id: "hottest", label: "🔥 Hottest Picks", count: counts.hottest, isHighlight: true },
    { id: "sub:claw-clips", label: "Claw Clips", count: counts.clawClips },
    { id: "sub:hair-bows", label: "Hair Bows", count: counts.hairBows },
    { id: "sub:scrunchies", label: "Scrunchies", count: counts.scrunchies },
    { id: "sub:earrings", label: "Earrings", count: counts.earrings },
    { id: "sub:necklaces", label: "Necklaces", count: counts.necklaces },
    { id: "cat:jewellery", label: "All Jewellery", count: counts.earrings + counts.necklaces + counts.braceletsRings },
    { id: "cat:everyday-essentials", label: "Everyday Charms", count: counts.everyday },
    { id: "cat:gifts", label: "Gift Sets", count: counts.gifts },
  ];

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Apply Active Filter
    if (activeFilter === "hottest") {
      result = result.filter((p) => p.is_bestseller);
    } else if (activeFilter.startsWith("sub:")) {
      const sub = activeFilter.replace("sub:", "");
      result = result.filter((p) => p.subcategory === sub);
    } else if (activeFilter.startsWith("cat:")) {
      const cat = activeFilter.replace("cat:", "");
      result = result.filter((p) => p.category === cat);
    }

    if (onlyInStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting
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
        // Smart boutique relevance: Bestsellers -> Featured -> New
        result.sort((a, b) => {
          const scoreB = (b.is_bestseller ? 4 : 0) + (b.is_featured ? 2 : 0) + (b.is_new ? 1 : 0);
          const scoreA = (a.is_bestseller ? 4 : 0) + (a.is_featured ? 2 : 0) + (a.is_new ? 1 : 0);
          return scoreB - scoreA;
        });
        break;
    }

    return result;
  }, [allProducts, activeFilter, sortBy, onlyInStock]);

  const activeFilterLabel = filterOptions.find((f) => f.id === activeFilter)?.label;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
          The Full Boutique Catalogue
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal">
          Shop All Accessories
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70 font-sans font-light">
          Explore handcrafted baroque pearls, French silk ribbon bows, durable cellulose claw clips, and keepsake sets.
        </p>
      </div>

      {/* Filter and Sort Bar */}
      <div className="border-y border-[#EBE3D8] py-4 space-y-4">
        
        {/* Category & Section Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((opt) => {
            const isSelected = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActiveFilter(opt.id)}
                className={`px-3.5 py-2 text-xs uppercase tracking-wider font-sans transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? opt.isHighlight
                      ? "bg-[#2D2A26] text-[#FAF8F5] font-medium shadow-sm"
                      : "bg-charcoal text-white font-medium shadow-sm"
                    : opt.isHighlight
                    ? "bg-[#FAF7F2] border border-champagne text-[#C2714F] hover:border-charcoal font-medium"
                    : "bg-white border border-[#EBE3D8] text-charcoal/75 hover:border-champagne hover:text-charcoal"
                }`}
              >
                <span>{opt.label}</span>
                {opt.count > 0 && (
                  <span className={`text-[10px] ${isSelected ? "opacity-80" : "text-taupe"}`}>
                    ({opt.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort & Stock Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-[#EBE3D8]/60 text-xs font-sans text-charcoal/80">
          
          {/* Active Filter Indicator */}
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="font-semibold text-charcoal">{filteredProducts.length}</span> pieces
            </span>
            {activeFilter !== "all" && (
              <div className="flex items-center gap-1 bg-ivory px-2.5 py-1 border border-champagne text-[11px] text-charcoal">
                <span>Filter: {activeFilterLabel}</span>
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="hover:text-taupe-dark ml-1"
                  title="Clear filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right Controls: In Stock & Sorting */}
          <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="accent-charcoal rounded-none w-3.5 h-3.5 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            <div className="flex items-center gap-2 border-l border-[#EBE3D8] pl-4">
              <ArrowUpDown className="w-3.5 h-3.5 text-taupe" />
              <label htmlFor="shop-sort" className="sr-only">
                Sort products by
              </label>
              <select
                id="shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-charcoal text-xs uppercase tracking-wider focus:outline-none cursor-pointer py-1"
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

        </div>

      </div>

      {/* Products Grid */}
      {allProducts.length === 0 ? (
        <div className="text-center py-20 bg-ivory/60 border border-champagne p-8 sm:p-14 space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-champagne text-[10px] uppercase tracking-widest text-charcoal font-sans">
            <Sparkles className="w-3.5 h-3.5 text-taupe-dark" />
            <span>DROP 01 CURATION IN PROGRESS</span>
          </div>
          <h3 className="font-serif text-3xl sm:text-4xl text-charcoal">
            The Vault is Opening Soon
          </h3>
          <p className="text-xs sm:text-sm text-charcoal/70 font-sans leading-relaxed max-w-md mx-auto">
            We are curating hand-selected freshwater baroque pearls, tarnish-free gold essentials, and French atelier hair pieces. Every item is verified for luxury finish and organic luster.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/"
              className="btn-boutique-primary w-full sm:w-auto"
            >
              Explore Boutique Vibes
            </a>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#EBE3D8] p-8 space-y-4">
          <Filter className="w-8 h-8 text-taupe mx-auto" />
          <h3 className="font-serif text-2xl text-charcoal">No pieces found in this view</h3>
          <p className="text-xs text-charcoal/60 font-sans max-w-sm mx-auto">
            Try choosing a different section or resetting your active filters to explore our full boutique collection.
          </p>
          <button
            onClick={() => {
              setActiveFilter("all");
              setOnlyInStock(false);
            }}
            className="btn-boutique-primary mt-2"
          >
            Show All Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ShopAllPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-taupe text-xs font-sans">
          Loading boutique catalogue...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
