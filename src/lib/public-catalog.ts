// ==============================================================================
// PETAL & PEARL — CLIENT-SAFE PUBLIC CATALOGUE
// Pure browser-compatible data layer with NO Node.js (fs) dependencies
// ==============================================================================

import { PublicProduct } from "./types";
import { SEED_PRODUCTS, CATEGORIES_DATA } from "../data/seed-data";
import { sanitizePublicProduct } from "./pricing-engine";

export { CATEGORIES_DATA };

// Base public catalogue (Supplier costs strictly sanitized)
const PUBLIC_CATALOGUE: PublicProduct[] = SEED_PRODUCTS.filter((p) => p.is_visible).map(
  sanitizePublicProduct
);

export function getPublicProducts(filters?: {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  bestseller?: boolean;
  search?: string;
}): PublicProduct[] {
  let list = [...PUBLIC_CATALOGUE];

  if (filters?.category) {
    list = list.filter((p) => p.category === filters.category);
  }
  if (filters?.subcategory) {
    list = list.filter((p) => p.subcategory === filters.subcategory);
  }
  if (filters?.featured) {
    list = list.filter((p) => p.is_featured);
  }
  if (filters?.bestseller) {
    list = list.filter((p) => p.is_bestseller);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return list;
}

export function getPublicProductBySlug(slug: string): PublicProduct | null {
  const p = PUBLIC_CATALOGUE.find((item) => item.slug === slug);
  return p || null;
}

export function getPublicProductById(id: string): PublicProduct | null {
  const p = PUBLIC_CATALOGUE.find((item) => item.id === id);
  return p || null;
}
