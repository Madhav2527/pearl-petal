"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { getPublicProductBySlug, getPublicProducts } from "@/lib/public-catalog";
import { PublicProduct } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import ProductCard from "@/components/ProductCard";
import {
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Heart,
  Share2,
} from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const initialProduct = getPublicProductBySlug(slug);
  const [product, setProduct] = useState<PublicProduct | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);

  const { addItem } = useCart();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(initialProduct?.variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (!product) {
      fetch(`/api/products/${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.product) {
            setProduct(data.product);
            if (data.product.variants?.[0]) {
              setSelectedVariant(data.product.variants[0]);
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [slug, product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center space-y-3 font-sans">
        <p className="font-serif text-2xl text-charcoal">Loading boutique piece...</p>
        <p className="text-xs text-taupe">Retrieving piece details from the collection</p>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const images = product.images.length > 0
    ? product.images
    : [{ id: "fallback", image_url: "", alt_text: product.name, display_order: 1 }];

  // Find related products in same category
  const relatedProducts = getPublicProducts({ category: product.category })
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const currentPrice = selectedVariant?.price_override ?? product.selling_price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToBag = () => {
    if (currentStock <= 0) return;
    addItem(product, selectedVariant || undefined, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (currentStock <= 0) return;
    addItem(product, selectedVariant || undefined, quantity);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-sans text-taupe">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/category/${product.category}`} className="hover:text-charcoal transition-colors capitalize">
          {product.category.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-charcoal font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          
          {/* Thumbnails (desktop left, mobile bottom) */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 bg-ivory border transition-all overflow-hidden shrink-0 ${
                    selectedImageIdx === idx ? "border-charcoal ring-1 ring-charcoal" : "border-[#EBE3D8] hover:border-champagne"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || product.name}
                    fill
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Display Image */}
          <div className="relative aspect-[4/5] flex-1 bg-ivory/40 border border-[#EBE3D8] overflow-hidden">
            {images[selectedImageIdx] && (
              <Image
                src={images[selectedImageIdx].image_url}
                alt={images[selectedImageIdx].alt_text || product.name}
                fill
                priority
                className="object-cover object-center transition-all duration-500"
              />
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.is_bestseller && (
                <span className="bg-charcoal text-ivory text-[10px] uppercase tracking-widest px-3 py-1 font-sans font-medium">
                  Boutique Bestseller
                </span>
              )}
              {product.is_new && !product.is_bestseller && (
                <span className="bg-ivory text-charcoal text-[10px] uppercase tracking-widest px-3 py-1 font-sans font-medium border border-champagne">
                  New Arrival
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Product Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header & Price */}
          <div className="space-y-2 border-b border-[#EBE3D8] pb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-taupe font-sans block">
              {product.subcategory.replace("-", " ")} &bull; SKU: {selectedVariant?.sku || product.sku}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal leading-snug">
              {product.name}
            </h1>
            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-2xl font-serif text-charcoal font-medium">
                ₹{currentPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-sans text-taupe font-light">
                Inclusive of all taxes &bull; Prepaid only
              </span>
            </div>
          </div>

          {/* Product Description */}
          <div className="prose prose-sm text-charcoal/80 font-sans font-light leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Variants Selector */}
          {product.variants.length > 1 && (
            <div className="space-y-2.5 pt-2">
              <label className="text-xs uppercase tracking-wider font-sans font-medium text-charcoal block">
                Select Option: <span className="font-normal text-taupe">{selectedVariant?.title}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 text-xs font-sans transition-all border ${
                        isSelected
                          ? "bg-charcoal text-white border-charcoal font-medium shadow-sm"
                          : "bg-white text-charcoal/80 border-[#EBE3D8] hover:border-champagne"
                      }`}
                    >
                      {v.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status Indicator */}
          <div className="pt-1 flex items-center gap-2 text-xs font-sans">
            {currentStock > 5 ? (
              <span className="text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                In Stock &amp; Ready for Immediate Dispatch
              </span>
            ) : currentStock > 0 ? (
              <span className="text-amber-800 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                Only {currentStock} handcrafted pieces left in batch
              </span>
            ) : (
              <span className="text-rose-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                Currently Out of Stock &bull; Small Batch Restocking Soon
              </span>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-champagne bg-white h-12">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 h-full text-charcoal hover:bg-ivory transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-sans font-medium text-charcoal">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="px-3.5 h-full text-charcoal hover:bg-ivory transition-colors disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag */}
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={currentStock <= 0}
                className="btn-boutique-primary flex-1 h-12 flex items-center justify-center gap-2"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-champagne" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={currentStock <= 0}
              className="btn-boutique-champagne w-full h-12 flex items-center justify-center gap-2"
            >
              <span>Buy Now with Instant Checkout</span>
            </button>
          </div>

          {/* Delivery & Care Trust Accordion */}
          <div className="border-t border-[#EBE3D8] pt-6 space-y-4 text-xs font-sans">
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-taupe shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">Express Shipping Across India</p>
                <p className="text-charcoal/70 mt-0.5 font-light">
                  Orders dispatched within 24-48 hours via BlueDart / Delhivery. Estimated delivery 4-6 business days. Free on orders above ₹999.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-taupe shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">7-Day Replacement Guarantee</p>
                <p className="text-charcoal/70 mt-0.5 font-light">
                  In the rare event of transit damage or defect, we offer hassle-free replacements. Due to personal hygiene considerations, earrings are non-returnable once seal is broken.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-taupe shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-charcoal">100% Prepaid Verification</p>
                <p className="text-charcoal/70 mt-0.5 font-light">
                  We operate exclusively on prepaid orders to guarantee dedicated boutique gift packaging and priority dispatch.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Related Products Carousel/Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#EBE3D8] space-y-8">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-widest text-taupe font-sans">
              Pair With Delicate Pieces
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
              You May Also Adore
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
