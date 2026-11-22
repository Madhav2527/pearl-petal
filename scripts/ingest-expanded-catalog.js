// ==============================================================================
// PETAL & PEARL — SAVANA EXPANDED CATALOG INGESTOR
// Ingests:
// 1. Everyday Essentials: Phone charms & straps, Keychains & bag charms, Dishes & trays
// 2. All Jewellery: Earrings, Necklaces & chokers, Bracelets & bangles, Rings, Anklets, Body & waist jewellery
// 3. Hair Accessories: Silk scrunchies & hair ties
// 4. Press-on Nails: Nail stickers & charms, Nail kits & glue
// Rule: Strictly Selling Price = Supplier Cost + 50
// ==============================================================================

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const PRODUCTS_JSON_PATH = path.join(DATA_DIR, "products.json");
const SEED_DATA_PATH = path.join(__dirname, "..", "src", "data", "seed-data.ts");

const ACTIVITIES = [
  // Everyday Essentials: Phone charms & straps
  { id: 13417, category: "everyday-essentials", subcategory: "phone-charms" },

  // Everyday Essentials: Keychains & bag charms
  { id: 13418, category: "everyday-essentials", subcategory: "keychains" },
  { id: 12940, category: "everyday-essentials", subcategory: "keychains" },
  { id: 13015, category: "everyday-essentials", subcategory: "keychains" },

  // Everyday Essentials: Dishes & trays / boxes
  { id: 13447, category: "everyday-essentials", subcategory: "trinket-dishes" },
  { id: 13449, category: "everyday-essentials", subcategory: "trinket-dishes" },
  { id: 13430, category: "everyday-essentials", subcategory: "trinket-dishes" },

  // Jewellery: Anklets
  { id: 13441, category: "jewellery", subcategory: "anklets" },

  // Jewellery: Body & waist jewellery
  { id: 13443, category: "jewellery", subcategory: "body-jewellery" },
  { id: 13426, category: "jewellery", subcategory: "body-jewellery" },

  // Jewellery: Necklaces & chokers
  { id: 13432, category: "jewellery", subcategory: "necklaces" },
  { id: 13433, category: "jewellery", subcategory: "necklaces" },
  { id: 13331, category: "jewellery", subcategory: "necklaces" },
  { id: 13332, category: "jewellery", subcategory: "necklaces" },
  { id: 12947, category: "jewellery", subcategory: "necklaces" },

  // Jewellery: Earrings
  { id: 13434, category: "jewellery", subcategory: "earrings" },
  { id: 13333, category: "jewellery", subcategory: "earrings" },
  { id: 13334, category: "jewellery", subcategory: "earrings" },
  { id: 13335, category: "jewellery", subcategory: "earrings" },
  { id: 13337, category: "jewellery", subcategory: "earrings" },
  { id: 12944, category: "jewellery", subcategory: "earrings" },

  // Jewellery: Bracelets & bangles
  { id: 13435, category: "jewellery", subcategory: "bracelets" },
  { id: 13436, category: "jewellery", subcategory: "bracelets" },
  { id: 13338, category: "jewellery", subcategory: "bracelets" },
  { id: 13339, category: "jewellery", subcategory: "bracelets" },
  { id: 12946, category: "jewellery", subcategory: "bracelets" },
  { id: 13382, category: "jewellery", subcategory: "bracelets" },

  // Jewellery: Rings
  { id: 13340, category: "jewellery", subcategory: "rings" },
  { id: 13341, category: "jewellery", subcategory: "rings" },
  { id: 12945, category: "jewellery", subcategory: "rings" },

  // Hair Accessories: Scrunchies
  { id: 13323, category: "hair-accessories", subcategory: "scrunchies" },

  // Nails: Stickers & Charms, Kits & Tools
  { id: 13342, category: "press-on-nails", subcategory: "press-on-nails" },
  { id: 13405, category: "press-on-nails", subcategory: "press-on-nails" },
  { id: 12953, category: "press-on-nails", subcategory: "nail-accessories" }
];

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

function cleanTitle(title, subcategory) {
  let cleaned = title
    .replace(/Imitation\/Artificial Jewellery\s*-\s*/gi, "")
    .replace(/Artificial Jewellery\s*-\s*/gi, "")
    .replace(/Imitation\/Artificial\s*/gi, "")
    .replace(/Artificial\s+Jewellery\s*/gi, "")
    .replace(/\bStud\b/gi, "Stud Earrings")
    .replace(/\bHoop\b/gi, "Hoop Earrings")
    .replace(/\bDangle\b/gi, "Dangle Earrings")
    .replace(/\bEar Cuff\b/gi, "Ear Cuff")
    .replace(/Chokers Necklace/gi, "Choker Necklace")
    .replace(/Brush Shelf/gi, "Vanity Display Tray")
    .replace(/Makeup Box/gi, "Keepsake Jewelry Box")
    .replace(/Phone Holder/gi, "Vanity Phone Stand")
    .replace(/Hair Tie/gi, "Silk Scrunchie")
    .replace(/&/g, " & ")
    .replace(/\s+/g, " ")
    .trim();

  // If subcategory is anklets and title lacks anklet, append it
  if (subcategory === "anklets" && !/anklet/i.test(cleaned)) {
    cleaned += " Anklet";
  }
  if (subcategory === "body-jewellery" && !/waist|chain|body/i.test(cleaned)) {
    cleaned += " Waist Chain";
  }
  if (subcategory === "scrunchies" && !/scrunchie|tie/i.test(cleaned)) {
    cleaned += " Silk Scrunchie";
  }
  if (subcategory === "phone-charms" && !/charm|strap/i.test(cleaned)) {
    cleaned += " Phone Charm";
  }

  // Capitalize title
  return cleaned
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
    .replace(/\bPcs\b/g, "Pcs")
    .replace(/\b3d\b/g, "3D");
}

function generateDescription(category, subcategory, name) {
  if (category === "everyday-essentials") {
    if (subcategory === "phone-charms") {
      return `Elevate your phone aesthetic with the ${name}. Handcrafted with iridescent beads, delicate pearls, and high-tensile cord, designed to loop securely through any phone case.`;
    }
    if (subcategory === "keychains") {
      return `The sweetest statement accent: ${name}. Crafted with premium hardware and tactile charms, designed to clip effortlessly onto bags, keys, or pouches.`;
    }
    return `Keep your daily treasures beautifully organized with the ${name}. Elegant, chic, and designed for bedside or vanity display.`;
  }

  if (category === "jewellery") {
    if (subcategory === "earrings") {
      return `Effortlessly elevated: ${name}. Lightweight, hypoallergenic, and crafted for all-day comfort with high-luster finish.`;
    }
    if (subcategory === "necklaces") {
      return `A timeless neckpiece for effortless layering: ${name}. Crafted with delicate detailing and water-resistant finish, designed to sit gracefully from day to night.`;
    }
    if (subcategory === "bracelets") {
      return `Adorn your wrist with the ${name}. Designed with shimmering accents and an adjustable clasp for the dreamiest stacked aesthetic.`;
    }
    if (subcategory === "rings") {
      return `Minimalist luxury for your fingers: ${name}. Designed for seamless stacking or statement wear with high-polish tarnish-resistant coating.`;
    }
    if (subcategory === "anklets") {
      return `The ultimate summer sparkle: ${name}. Delicate, waterproof, and designed to drape effortlessly around your ankle with high-gloss brilliance.`;
    }
    if (subcategory === "body-jewellery") {
      return `Turn heads with the ${name}. An ultra-chic waist adornment crafted with fluid drape and secure clasp, designed to elevate crop fits, swimwear, or evening attire.`;
    }
  }

  if (category === "hair-accessories") {
    return `Soft on strands and impossibly cute: ${name}. Crafted from mulberry silk-blend fabric to prevent breakage, creases, and frizz.`;
  }

  if (subcategory === "nail-art-stickers") {
    return `Create salon-quality nail art in minutes with ${name}. Ultra-thin, self-adhesive, and designed for high-precision placement with glossy gel topcoats.`;
  }
  if (subcategory === "nail-accessories") {
    return `Professional nail care at home: ${name}. Precision-engineered manicure essentials crafted for effortless prep, secure application, and damage-free removal.`;
  }

  return `Elevate your manicure with ${name}. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection.`;
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
    const res = await fetchWithTimeout(url, {}, 4500);
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
  console.log("🌸 Starting Expanded Catalog Ingestion from Savana...");

  // Load existing products from data/products.json
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
    if (p.source_url) existingMap.set(p.source_url, p);
  }

  // Target collections to harvest
  const candidates = new Map();

  for (const act of ACTIVITIES) {
    try {
      console.log(`Fetching activity [${act.id}] (${act.category} -> ${act.subcategory})...`);
      const res = await fetchWithTimeout(`https://www.savana.com/activity/${act.id}`, {}, 8000);
      const html = await res.text();
      const goods = getGoodsListFromHtml(html);
      console.log(`   Activity ${act.id} returned ${goods.length} items`);

      for (const g of goods) {
        if (!g.goodsId || !g.goodsName) continue;
        const id = g.goodsId;

        // Determine exact category and subcategory
        let cat = act.category;
        let sub = act.subcategory;
        const nameLower = g.goodsName.toLowerCase();

        // Refine nails
        if (cat === "press-on-nails") {
          if (nameLower.includes("sticker") || nameLower.includes("decal") || nameLower.includes("charm")) {
            sub = "nail-art-stickers";
          } else if (nameLower.includes("glue") || nameLower.includes("tab") || nameLower.includes("cutter") || nameLower.includes("brush") || nameLower.includes("tool") || nameLower.includes("file") || nameLower.includes("kit")) {
            sub = "nail-accessories";
          }
        }
        // Refine jewellery
        if (cat === "jewellery") {
          if (nameLower.includes("anklet") || nameLower.includes("ankle")) sub = "anklets";
          else if (nameLower.includes("waist") || nameLower.includes("belly") || nameLower.includes("body chain")) sub = "body-jewellery";
          else if (nameLower.includes("earring") || nameLower.includes("hoop") || nameLower.includes("stud") || nameLower.includes("dangle") || nameLower.includes("cuff")) sub = "earrings";
          else if (nameLower.includes("choker") || nameLower.includes("necklace") || nameLower.includes("pendant")) sub = "necklaces";
          else if (nameLower.includes("bangle") || nameLower.includes("bracelet")) sub = "bracelets";
          else if (nameLower.includes("ring") && !nameLower.includes("earring") && !nameLower.includes("key ring")) sub = "rings";
        }
        // Refine everyday
        if (cat === "everyday-essentials") {
          if (nameLower.includes("phone") && (nameLower.includes("charm") || nameLower.includes("strap") || nameLower.includes("lanyard"))) sub = "phone-charms";
          else if (nameLower.includes("box") || nameLower.includes("shelf") || nameLower.includes("tray") || nameLower.includes("dish") || nameLower.includes("holder")) sub = "trinket-dishes";
          else sub = "keychains";
        }

        // Avoid duplicates within this harvest
        if (!candidates.has(id)) {
          candidates.set(id, { goods: g, category: cat, subcategory: sub });
        }
      }
    } catch (e) {
      console.error(`Error fetching activity ${act.id}:`, e.message);
    }
  }

  console.log(`\nTotal unique candidate products collected: ${candidates.size}`);

  const itemsToProcess = Array.from(candidates.values());

  const CONCURRENCY = 8;
  const processedProducts = [];

  for (let i = 0; i < itemsToProcess.length; i += CONCURRENCY) {
    const batch = itemsToProcess.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async ({ goods, category, subcategory }) => {
        const id = goods.goodsId;
        const name = cleanTitle(goods.goodsName, subcategory);
        const slug = `${slugify(name)}-${id}`;
        const sourceUrl = `https://www.savana.com/details/${slug}`;
        
        let prefix = "prod-misc";
        if (category === "press-on-nails") prefix = "prod-nail";
        else if (category === "hair-accessories") prefix = "prod-hair";
        else if (category === "jewellery") prefix = "prod-jew";
        else if (category === "everyday-essentials") prefix = "prod-ess";

        const productId = `${prefix}-${id}`;

        // If already in catalog, retain
        if (existingMap.has(productId)) {
          return existingMap.get(productId);
        }

        // Parse price
        const priceStr = goods.promotePriceText || goods.salePriceText || goods.promotePrice || goods.salePrice || "0";
        let cost = parseInt(String(priceStr).replace(/[^0-9]/g, ""), 10);
        if (!cost || isNaN(cost) || cost <= 0) {
          cost = 149;
        }

        // STRICT PRICE RULE: Selling Price = Supplier Cost + 50
        const sellingPrice = cost + 50;

        // Fetch detail gallery
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
          imageUrls.push("https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80");
        }

        let skuPrefix = "PP-ACC";
        if (category === "press-on-nails") skuPrefix = "PP-NAIL";
        else if (category === "hair-accessories") skuPrefix = "PP-HAIR";
        else if (category === "jewellery") skuPrefix = "PP-JEW";
        else if (category === "everyday-essentials") skuPrefix = "PP-ESS";

        const sku = `${skuPrefix}-${String(id).slice(-4)}`;
        const description = generateDescription(category, subcategory, name);

        const productImages = imageUrls.map((url, idx) => ({
          id: `img-${id}-${idx + 1}`,
          image_url: url,
          alt_text: `${name} - View ${idx + 1}`,
          display_order: idx + 1,
          is_primary: idx === 0,
        }));

        const tags = [
          category.replace(/-/g, " "),
          subcategory.replace(/-/g, " "),
          "genz aesthetic",
          "curated boutique",
          "petal and pearl"
        ];

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

  // Merge with existing products
  const finalMap = new Map();
  for (const p of existingProducts) finalMap.set(p.id, p);
  for (const p of processedProducts) {
    if (!finalMap.has(p.id)) {
      finalMap.set(p.id, p);
    }
  }

  const finalProducts = Array.from(finalMap.values());

  // Assign bestsellers across categories so every department has top viral picks
  const categoryGroups = {};
  for (const p of finalProducts) {
    if (!categoryGroups[p.category]) categoryGroups[p.category] = [];
    categoryGroups[p.category].push(p);
  }

  for (const [cat, prods] of Object.entries(categoryGroups)) {
    prods.forEach((p, idx) => {
      if (idx < 8) {
        p.is_bestseller = true;
        p.is_featured = true;
      }
    });
  }

  // Enforce pricing rule strictly
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

  console.log(`\nFinal Consolidated Catalog Breakdown:`);
  console.log(`- Total Products: ${finalProducts.length}`);
  const catCounts = {};
  const subCounts = {};
  for (const p of finalProducts) {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    const subKey = `${p.category} -> ${p.subcategory}`;
    subCounts[subKey] = (subCounts[subKey] || 0) + 1;
  }
  console.log("Categories:", catCounts);
  console.log("Subcategories:", subCounts);
  console.log(`Hottest Picks count: ${finalProducts.filter(p => p.is_bestseller).length}`);

  // Write to data/products.json
  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(finalProducts, null, 2), "utf8");
  console.log(`Successfully wrote ${finalProducts.length} products to ${PRODUCTS_JSON_PATH}`);

  // Write to src/data/seed-data.ts RAW_PRODUCTS
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

  console.log("\nExpanded Catalog Ingestion Complete!");
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
