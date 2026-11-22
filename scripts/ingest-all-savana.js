// ==============================================================================
// PETAL & PEARL — SAVANA PRODUCT INGESTOR
// Harvests all Nails and Hair Accessories from Savana activities
// Enforces:
// 1. Strict +₹50 price hike (Selling Price = Supplier Cost + 50)
// 2. Accurate classification: Nails -> press-on-nails, Hair -> hair-accessories
// 3. Subcategories: claw-clips, hair-pins-clips, hair-bows, scrunchies, headbands
// 4. High-resolution gallery images
// 5. Dual persistence to data/products.json and src/data/seed-data.ts
// ==============================================================================

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const PRODUCTS_JSON_PATH = path.join(DATA_DIR, "products.json");
const SEED_DATA_PATH = path.join(__dirname, "..", "src", "data", "seed-data.ts");

const NAIL_ACTIVITIES = [12954, 13014, 12950, 12951, 12952];
const HAIR_ACTIVITIES = [12937, 13009, 12956, 12932, 12933, 12934];

function getGoodsListFromHtml(html) {
  const start = html.indexOf('"goodsList":[');
  if (start === -1) return [];
  const arrayStart = start + '"goodsList":'.length;
  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < html.length; i++) {
    if (html[i] === "[") depth++;
    else if (html[i] === "]") {
      depth--;
      if (depth === 0) {
        arrayEnd = i + 1;
        break;
      }
    }
  }
  if (arrayEnd === -1) return [];
  try {
    return JSON.parse(html.slice(arrayStart, arrayEnd));
  } catch {
    return [];
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanTitle(title) {
  return title
    .replace(/&/g, " & ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
    .replace(/\bPcs\b/g, "Pcs")
    .replace(/\b3d\b/g, "3D");
}

function determineSubcategory(category, name) {
  const lower = name.toLowerCase();
  if (category === "press-on-nails") {
    if (lower.includes("sticker") || lower.includes("decal")) return "nail-art-stickers";
    if (lower.includes("glue") || lower.includes("tab") || lower.includes("file") || lower.includes("kit")) return "nail-accessories";
    return "press-on-nails";
  }
  if (category === "hair-accessories") {
    if (lower.includes("claw") || lower.includes("jaw")) return "claw-clips";
    if (lower.includes("bow") || lower.includes("ribbon")) return "hair-bows";
    if (lower.includes("headband") || lower.includes("hairband")) return "headbands";
    if (lower.includes("scrunchie")) return "scrunchies";
    if (lower.includes("clip") || lower.includes("pin") || lower.includes("barrette") || lower.includes("bobby")) return "hair-pins-clips";
    if (lower.includes("comb") || lower.includes("roller")) return "hair-pins-clips";
    return "claw-clips";
  }
  return "claw-clips";
}

function generateDescription(category, subcategory, name) {
  if (category === "press-on-nails") {
    return `Elevate your manicure with ${name}. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.`;
  }
  if (subcategory === "claw-clips") {
    return `Elevate your updo with the ${name}. Crafted with premium high-durability acrylic and an ultra-secure spring grip, designed to hold thick to fine hair comfortably all day with zero creasing.`;
  }
  if (subcategory === "hair-bows") {
    return `The ultimate coquette aesthetic touch: ${name}. Designed with delicate silhouettes and a luxury finish to elevate any ponytail, half-up, or braid effortlessly.`;
  }
  if (subcategory === "headbands") {
    return `Make a statement with the ${name}. Ultra-comfortable, lightweight, and gentle on hair, designed for effortless day-to-night styling without headache pressure.`;
  }
  if (subcategory === "scrunchies") {
    return `Soft on strands and impossibly cute: ${name}. Crafted to prevent breakage and frizz while giving you the dreamiest voluminous hold.`;
  }
  return `Add instant polish to your styling with the ${name}. Featuring shimmering accents and an ultra-secure grip, designed to elevate your aesthetic effortlessly.`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function fetchDetailPage(goodsId, name) {
  const slug = slugify(name);
  const url = `https://www.savana.com/details/${slug}-${goodsId}`;
  try {
    const res = await fetchWithTimeout(url, {}, 5000);
    if (!res.ok) return null;
    const html = await res.text();
    const start = html.indexOf("window.$preData = {");
    if (start === -1) return null;
    const jsonStart = start + "window.$preData = ".length;
    let depth = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }
    if (jsonEnd === -1) return null;
    const pre = JSON.parse(html.slice(jsonStart, jsonEnd));
    const detail = pre["/n/api/intention/item/v4/detail"] || pre["/n/api/trade/intention/item/detail"];
    if (!detail) return null;

    const images = [];
    if (Array.isArray(detail.images)) {
      for (const img of detail.images) {
        const u = img.originalPic || img.picThumb;
        if (u && !images.includes(u)) {
          let cleanUrl = u;
          if (!cleanUrl.includes(".webp") && !cleanUrl.endsWith(".jpg") && !cleanUrl.endsWith(".png")) {
            cleanUrl = cleanUrl.replace(/_w\d+.*$/, "") + "_w1440_q90.webp";
          }
          images.push(cleanUrl);
        }
      }
    }
    return {
      images: images.slice(0, 6),
      detail,
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log("🌸 Starting Savana Harvest for Nails & Hair Accessories...");

  let existingProducts = [];
  if (fs.existsSync(PRODUCTS_JSON_PATH)) {
    try {
      existingProducts = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, "utf8"));
      console.log(`Loaded ${existingProducts.length} existing products.`);
    } catch {}
  }

  const existingMap = new Map();
  for (const p of existingProducts) {
    existingMap.set(p.id, p);
    if (p.source_url) {
      existingMap.set(p.source_url, p);
    }
  }

  // 1. Harvest activities
  const allActs = [...new Set([...NAIL_ACTIVITIES, ...HAIR_ACTIVITIES])];
  const candidateNails = new Map();
  const candidateHair = new Map();

  for (const actId of allActs) {
    try {
      console.log(`Fetching activity ${actId}...`);
      const res = await fetchWithTimeout(`https://www.savana.com/activity/${actId}`, {}, 8000);
      const html = await res.text();
      const goods = getGoodsListFromHtml(html);
      console.log(`  Activity ${actId} returned ${goods.length} items`);

      for (const g of goods) {
        const name = (g.goodsName || "").trim();
        const id = g.goodsId;
        if (!name || !id) continue;

        const isNail = /nail/i.test(name) || actId === 12954 || actId === 13014;
        if (isNail && /nail/i.test(name)) {
          if (!candidateNails.has(id)) {
            candidateNails.set(id, g);
          }
        }

        const isHair =
          /hair|claw|clip|scrunchie|headband|hairpin|barrette|bobby pin|comb|roller/i.test(name) ||
          actId === 12937 ||
          actId === 13009 ||
          actId === 12956;
        if (isHair && !/nail|eyelash|slimming|brush set/i.test(name)) {
          if (!candidateHair.has(id)) {
            candidateHair.set(id, g);
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching activity ${actId}:`, e.message);
    }
  }

  console.log(`\nFound ${candidateNails.size} unique Nails and ${candidateHair.size} unique Hair Accessories!`);

  const itemsToProcess = [];
  for (const [id, g] of candidateNails.entries()) {
    itemsToProcess.push({ type: "nail", id, goods: g });
  }
  for (const [id, g] of candidateHair.entries()) {
    itemsToProcess.push({ type: "hair", id, goods: g });
  }

  console.log(`Total candidate products to process: ${itemsToProcess.length}`);

  const CONCURRENCY = 8;
  const processedProducts = [];

  for (let i = 0; i < itemsToProcess.length; i += CONCURRENCY) {
    const batch = itemsToProcess.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async ({ type, id, goods }) => {
        const rawName = goods.goodsName || "";
        const name = cleanTitle(rawName);
        const slug = `${slugify(name)}-${id}`;
        const sourceUrl = `https://www.savana.com/details/${slug}`;
        const productId = type === "nail" ? `prod-nail-${id}` : `prod-hair-${id}`;

        if (existingMap.has(productId)) {
          const existing = existingMap.get(productId);
          return existing;
        }

        const priceStr = goods.promotePriceText || goods.salePriceText || goods.promotePrice || goods.salePrice || "0";
        let cost = parseInt(String(priceStr).replace(/[^0-9]/g, ""), 10);
        if (!cost || isNaN(cost) || cost <= 0) {
          cost = 149;
        }

        const sellingPrice = cost + 50;

        const detailInfo = await fetchDetailPage(id, name);

        let imageUrls = [];
        if (detailInfo && detailInfo.images && detailInfo.images.length > 0) {
          imageUrls = detailInfo.images;
        } else if (goods.imageList && goods.imageList.length > 0) {
          const thumb = goods.imageList[0].goodsThumb || goods.imageList[0].skcMainImg;
          if (thumb) {
            let highRes = thumb.replace(/_w\d+.*$/, "") + "_w1440_q90.webp";
            imageUrls.push(highRes);
          }
        }

        if (imageUrls.length === 0) {
          imageUrls.push(
            type === "nail"
              ? "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80"
              : "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80"
          );
        }

        const category = type === "nail" ? "press-on-nails" : "hair-accessories";
        const subcategory = determineSubcategory(category, name);
        const description = generateDescription(category, subcategory, name);
        const skuPrefix = type === "nail" ? "PP-NAIL" : "PP-HAIR";
        const sku = `${skuPrefix}-${String(id).slice(-4)}`;

        const productImages = imageUrls.map((url, idx) => ({
          id: `img-${id}-${idx + 1}`,
          image_url: url,
          alt_text: `${name} - View ${idx + 1}`,
          display_order: idx + 1,
          is_primary: idx === 0,
        }));

        const tags =
          type === "nail"
            ? ["press-on-nails", "nail art", "artificial nails", "salon glaze", "manicure", "genz aesthetic"]
            : ["hair accessories", "aesthetic hair", "genz fashion", subcategory.replace(/-/g, " "), "coquette"];

        return {
          id: productId,
          sku,
          name,
          slug,
          category,
          subcategory,
          description,
          supplier_cost: cost,
          selling_price: sellingPrice,
          custom_markup: null,
          stock: 25,
          is_featured: false,
          is_bestseller: false,
          is_new: true,
          is_visible: true,
          images: productImages,
          variants: [],
          tags,
          product_link: sourceUrl,
          source_url: sourceUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      })
    );

    for (const r of results) {
      if (r) processedProducts.push(r);
    }
    console.log(`Processed ${processedProducts.length}/${itemsToProcess.length} products...`);
  }

  const finalMap = new Map();
  for (const p of existingProducts) {
    finalMap.set(p.id, p);
  }
  for (const p of processedProducts) {
    if (!finalMap.has(p.id)) {
      finalMap.set(p.id, p);
    }
  }

  const finalProducts = Array.from(finalMap.values());

  const nails = finalProducts.filter((p) => p.category === "press-on-nails");
  const hair = finalProducts.filter((p) => p.category === "hair-accessories");

  nails.forEach((p, idx) => {
    if (idx < 12) {
      p.is_bestseller = true;
      p.is_featured = true;
    }
  });

  hair.forEach((p, idx) => {
    if (idx < 12) {
      p.is_bestseller = true;
      p.is_featured = true;
    }
  });

  console.log(`\nFinal Catalog Breakdown:`);
  console.log(`- Total Products: ${finalProducts.length}`);
  console.log(`- Press-On Nails: ${nails.length}`);
  console.log(`- Hair Accessories: ${hair.length}`);
  console.log(`- Bestsellers (Hottest Picks): ${finalProducts.filter((p) => p.is_bestseller).length}`);

  let pricingRuleViolations = 0;
  for (const p of finalProducts) {
    if (p.selling_price !== p.supplier_cost + 50) {
      p.selling_price = p.supplier_cost + 50;
      pricingRuleViolations++;
    }
  }
  if (pricingRuleViolations > 0) {
    console.log(`Adjusted ${pricingRuleViolations} products to enforce strict +50 price hike.`);
  }

  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(finalProducts, null, 2), "utf8");
  console.log(`\nSuccessfully wrote ${finalProducts.length} products to ${PRODUCTS_JSON_PATH}`);

  const rawProducts = finalProducts.map((p) => {
    const { selling_price, created_at, updated_at, ...rest } = p;
    return rest;
  });

  const currentSeed = fs.readFileSync(SEED_DATA_PATH, "utf8");
  const categoriesStart = currentSeed.indexOf("export const CATEGORIES_DATA");
  const categoriesSnippet = currentSeed.slice(categoriesStart);

  const newSeedContent = `import { Product, Supplier } from "../lib/types";
import { calculateSellingPrice } from "../lib/pricing-engine";

export const SEED_SUPPLIERS: Supplier[] = [];

// Base catalog loaded from Savana with strict +₹50 price hike
const RAW_PRODUCTS: Array<Omit<Product, "selling_price" | "created_at" | "updated_at">> = ${JSON.stringify(rawProducts, null, 2)};

// Dynamically compute selling_price = supplier_cost + 50 (or custom markup)
export const SEED_PRODUCTS: Product[] = RAW_PRODUCTS.map((item) => ({
  ...item,
  selling_price: calculateSellingPrice(item.supplier_cost, item.custom_markup || 50),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

${categoriesSnippet}
`;

  fs.writeFileSync(SEED_DATA_PATH, newSeedContent, "utf8");
  console.log(`Successfully wrote ${rawProducts.length} products to ${SEED_DATA_PATH}`);

  console.log("\nSavana Ingestion Complete!");
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
