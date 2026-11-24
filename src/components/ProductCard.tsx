"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PublicProduct } from "@/lib/types";
import { useCart } from "@/context/cart-context";

interface ProductCardProps {
  product: PublicProduct;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();

  // Helper to extract image URL safely whether string or object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getImageUrl = (img: any): string => {
    if (!img) return "";
    if (typeof img === "string") return img;
    return img.image_url || "";
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawPrimary = product.images.find((img: any) => typeof img === "object" && img?.is_primary) || product.images[0];
  const primaryImageUrl = getImageUrl(rawPrimary);
  const primaryAltText = (typeof rawPrimary === "object" && rawPrimary?.alt_text) || product.name;

  const rawSecondary = product.images.length > 1 ? product.images[1] : null;
  const secondaryImageUrl = rawSecondary ? getImageUrl(rawSecondary) : "";

  return (
    <div className="group flex flex-col h-full bg-white border border-[#EBE3D8] transition-all duration-300 hover:border-champagne hover:shadow-[0_8px_30px_rgb(216,197,171,0.15)]">
      
      {/* Image Container with hover swap */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-ivory/50">
        {primaryImageUrl && (
          <Image
            src={primaryImageUrl}
            alt={primaryAltText}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            unoptimized
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = "";
              target.src = product.category === "gifts"
                ? "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"
                : "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80";
            }}
            className={`object-cover object-center transition-all duration-700 group-hover:scale-105 ${
              secondaryImageUrl ? "group-hover:opacity-0" : ""
            }`}
          />
        )}

        {secondaryImageUrl && (
          <Image
            src={secondaryImageUrl}
            alt={primaryAltText}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
            referrerPolicy="no-referrer"
            className="object-cover object-center absolute inset-0 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_bestseller && (
            <span className="bg-[#2D2A26] text-[#FAF8F5] text-[9px] uppercase tracking-wider px-2.5 py-1 font-sans font-semibold flex items-center gap-1 shadow-sm">
              <span>🔥 Hottest Pick</span>
            </span>
          )}
          {product.is_new && !product.is_bestseller && (
            <span className="bg-ivory text-charcoal text-[9px] uppercase tracking-widest px-2.5 py-1 font-sans font-medium border border-champagne">
              ✦ New Drop
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[9px] uppercase tracking-widest px-2 py-0.5 font-sans">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Quick Add Overlay on desktop hover */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItem(product, product.variants[0], 1);
          }}
          className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-sm text-charcoal text-[11px] uppercase tracking-widest py-2.5 px-4 font-sans font-medium shadow-sm border border-champagne opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:flex items-center justify-center gap-1.5 hover:bg-charcoal hover:text-white"
          aria-label={`Quick add ${product.name} to shopping bag`}
        >
          <Plus className="w-3.5 h-3.5" />
          Quick Add
        </button>
      </Link>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-taupe font-sans block mb-1">
            {product.subcategory === "claw-clips"
              ? "Claw Clip"
              : product.subcategory === "hair-bows"
              ? "Hair Bow"
              : product.subcategory.replace("-", " ")}
          </span>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base sm:text-lg text-charcoal leading-snug line-clamp-1 hover:text-taupe transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-[#EBE3D8]/60 flex items-center justify-between">
          <span className="font-sans text-sm font-medium text-charcoal tracking-wide">
            ₹{product.selling_price.toLocaleString("en-IN")}
          </span>

          {/* Mobile quick add button */}
          <button
            type="button"
            onClick={() => addItem(product, product.variants[0], 1)}
            className="sm:hidden p-1.5 text-charcoal hover:text-taupe border border-champagne rounded-none"
            aria-label={`Add ${product.name} to bag`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
