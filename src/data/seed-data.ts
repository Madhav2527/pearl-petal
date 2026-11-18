import { Product, Supplier } from "../lib/types";
import { calculateSellingPrice } from "../lib/pricing-engine";

export const SEED_SUPPLIERS: Supplier[] = [];

// Base catalog starts empty - merchant will add live products via Quick Add by Link in /admin/products
const RAW_PRODUCTS: Array<Omit<Product, "selling_price" | "created_at" | "updated_at">> = [];

// Dynamically compute selling_price = supplier_cost + 100
export const SEED_PRODUCTS: Product[] = RAW_PRODUCTS.map((item) => ({
  ...item,
  selling_price: calculateSellingPrice(item.supplier_cost, 100),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export const CATEGORIES_DATA = [
  {
    id: "jewellery",
    name: "Jewellery",
    slug: "jewellery",
    description: "Heirloom-grade freshwater pearls, delicate chains, and 18k gold vermeil adornments crafted for daily grace.",
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "earrings", name: "Earrings", slug: "earrings" },
      { id: "necklaces", name: "Necklaces", slug: "necklaces" },
      { id: "bracelets", name: "Bracelets", slug: "bracelets" },
      { id: "rings", name: "Rings", slug: "rings" },
    ],
  },
  {
    id: "hair-accessories",
    name: "Hair Accessories",
    slug: "hair-accessories",
    description: "Italian cellulose acetate claw clips, double-faced French velvet ribbons, and mulberry silk scrunchies.",
    image_url: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "claw-clips", name: "Claw Clips", slug: "claw-clips" },
      { id: "scrunchies", name: "Scrunchies", slug: "scrunchies" },
      { id: "hair-bows", name: "Hair Bows", slug: "hair-bows" },
    ],
  },
  {
    id: "everyday-essentials",
    name: "Everyday Essentials",
    slug: "everyday-essentials",
    description: "Handcrafted beaded phone charms, travel pouches, and petite treasures to elevate your daily routine.",
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "phone-charms", name: "Phone Charms", slug: "phone-charms" },
      { id: "pouches", name: "Pouches", slug: "pouches" },
    ],
  },
  {
    id: "gifts",
    name: "Gifts",
    slug: "gifts",
    description: "Thoughtfully curated boutique gift boxes with custom handwritten cards and luxury packaging.",
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "gift-sets", name: "Gift Sets", slug: "gift-sets" },
    ],
  },
];
