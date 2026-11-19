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
    id: "press-on-nails",
    name: "Press-On Nails & Nail Art",
    slug: "press-on-nails",
    description: "Salon-quality reusable press-on nails, glazed French manicures, and aesthetic nail charms for instant perfection.",
    image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "press-on-nails", name: "Press-On Nails", slug: "press-on-nails" },
      { id: "nail-art-stickers", name: "Nail Stickers & Charms", slug: "nail-art-stickers" },
      { id: "nail-accessories", name: "Nail Kits & Glue", slug: "nail-accessories" },
    ],
  },
  {
    id: "hair-accessories",
    name: "Hair Accessories",
    slug: "hair-accessories",
    description: "Italian cellulose acetate claw clips, double-faced French velvet ribbons, mulberry silk scrunchies, and padded headbands.",
    image_url: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "claw-clips", name: "Claw Clips", slug: "claw-clips" },
      { id: "hair-pins-clips", name: "Hair Clips & Barrettes", slug: "hair-pins-clips" },
      { id: "hair-bows", name: "Hair Bows & Ribbons", slug: "hair-bows" },
      { id: "scrunchies", name: "Silk Scrunchies", slug: "scrunchies" },
      { id: "headbands", name: "Headbands & Hairbands", slug: "headbands" },
    ],
  },
  {
    id: "jewellery",
    name: "Jewellery",
    slug: "jewellery",
    description: "Heirloom-grade freshwater pearls, delicate chains, waterproof rings, and 18k gold vermeil adornments crafted for daily grace.",
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "earrings", name: "Earrings", slug: "earrings" },
      { id: "necklaces", name: "Necklaces & Chokers", slug: "necklaces" },
      { id: "bracelets", name: "Bracelets & Bangles", slug: "bracelets" },
      { id: "rings", name: "Rings", slug: "rings" },
      { id: "anklets", name: "Anklets", slug: "anklets" },
      { id: "body-jewellery", name: "Body & Waist Jewellery", slug: "body-jewellery" },
    ],
  },
  {
    id: "everyday-essentials",
    name: "Everyday Essentials",
    slug: "everyday-essentials",
    description: "Handcrafted beaded phone charms, keychain straps, trinket dishes, and petite treasures to elevate your daily routine.",
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "phone-charms", name: "Phone Charms & Straps", slug: "phone-charms" },
      { id: "keychains", name: "Keychain & Bag Charms", slug: "keychains" },
      { id: "trinket-dishes", name: "Jewelry Dishes & Trays", slug: "trinket-dishes" },
    ],
  },
  {
    id: "bags-pouches",
    name: "Bags & Pouches",
    slug: "bags-pouches",
    description: "Aesthetic vanity cases, velvet pouches, and petite shoulder bags for your everyday essentials.",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "pouches", name: "Vanity & Makeup Pouches", slug: "pouches" },
      { id: "mini-bags", name: "Mini Shoulder Bags", slug: "mini-bags" },
      { id: "tote-bags", name: "Aesthetic Totes", slug: "tote-bags" },
    ],
  },
  {
    id: "eyewear",
    name: "Sunglasses & Eyewear",
    slug: "eyewear",
    description: "Chic cat-eye, retro oval, and classic aesthetic sunglasses paired with beaded and pearl chains.",
    image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "sunglasses", name: "Aesthetic Sunglasses", slug: "sunglasses" },
      { id: "sunglass-chains", name: "Pearl & Gold Eyewear Chains", slug: "sunglass-chains" },
    ],
  },
  {
    id: "beauty-vanity",
    name: "Beauty & Vanity",
    slug: "beauty-vanity",
    description: "Ornate vintage-inspired compact mirrors and pocket hair brushes for touch-ups on the go.",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "compact-mirrors", name: "Compact Mirrors", slug: "compact-mirrors" },
      { id: "hair-brushes", name: "Pocket Brushes & Combs", slug: "hair-brushes" },
    ],
  },
  {
    id: "gifts",
    name: "Gifts & Hampers",
    slug: "gifts",
    description: "Thoughtfully curated boutique gift boxes with custom handwritten cards and luxury drawer packaging.",
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "gift-sets", name: "Gift Sets & Hampers", slug: "gift-sets" },
      { id: "keepsake-boxes", name: "Keepsake Jewelry Boxes", slug: "keepsake-boxes" },
    ],
  },
];
