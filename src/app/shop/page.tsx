"use client";

import { useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { getPublicProducts } from "@/lib/public-catalog";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function ShopAllPage() {
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
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  const categories = [
    { label: "All Items", value: "all" },
    { label: "Jewellery", value: "jewellery" },
    { label: "Hair Accessories", value: "hair-accessories" },
    { label: "Everyday Essentials", value: "everyday-essentials" },
    { label: "Gifts", value: "gifts" },
  ];

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedSubcategory !== "all") {
      result = result.filter((p) => p.subcategory === selectedSubcategory);
    }

    if (onlyInStock) {
      result = result.filter((p) => p.stock > 0);
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
      case "featured":
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [allProducts, selectedCategory, selectedSubcategory, sortBy, onlyInStock]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      
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
      <div className="border-y border-[#EBE3D8] py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.value);
                setSelectedSubcategory("all");
              }}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-sans transition-all ${
                selectedCategory === cat.value
                  ? "bg-charcoal text-white font-medium"
                  : "bg-white border border-[#EBE3D8] text-charcoal/70 hover:border-champagne hover:text-charcoal"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & Stock Controls */}
        <div className="flex items-center gap-4 text-xs font-sans text-charcoal/80">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="accent-charcoal rounded-none w-3.5 h-3.5"
            />
            <span>In Stock Only</span>
          </label>

          <div className="flex items-center gap-1.5 border-l border-[#EBE3D8] pl-4">
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

      </div>

      {/* Products Counter */}
      <div className="flex justify-between items-center text-xs font-sans text-taupe">
        <span>Showing {filteredProducts.length} handcrafted pieces</span>
        {selectedCategory !== "all" && (
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSubcategory("all");
            }}
            className="text-charcoal underline underline-offset-4 hover:text-taupe"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {allProducts.length === 0 ? (
        <div className="text-center py-20 bg-ivory/60 border border-champagne p-8 sm:p-14 space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-champagne text-[10px] uppercase tracking-widest text-charcoal font-sans">
            ✦ DROP 01 CURATION IN PROGRESS
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
          <SlidersHorizontal className="w-8 h-8 text-taupe mx-auto" />
          <h3 className="font-serif text-2xl text-charcoal">No pieces found</h3>
          <p className="text-xs text-charcoal/60 font-sans max-w-sm mx-auto">
            Try resetting your filters to explore our full boutique collection.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSubcategory("all");
              setOnlyInStock(false);
            }}
            className="btn-boutique-primary mt-2"
          >
            Reset Filters
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
