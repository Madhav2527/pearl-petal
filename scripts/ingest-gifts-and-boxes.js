// ==============================================================================
// PETAL & PEARL — GIFTS & KEEPSAKE BOXES INGESTOR & RECLASSIFIER
// Ingests:
// 1. Gift Sets & Hampers (Jewellery sets, discovery hampers, gift vanity pouches)
// 2. Keepsake Jewellery Boxes (Velvet boxes, multi-tier cases, acrylic display boxes)
// Enforces:
// - Strict Selling Price = Supplier Cost + 50 across 100% of the catalogue
// - Category: "gifts", Subcategories: "gift-sets" & "keepsake-boxes"
// ==============================================================================

const https = require("https");
const fs = require("fs");
const path = require("path");

const PRODUCTS_JSON_PATH = path.join(__dirname, "..", "data", "products.json");

const ACTIVITIES = [
  { id: 13447, subcategory: "keepsake-boxes" }, // Keepsake & Makeup Boxes
  { id: 12949, subcategory: "gift-sets" },      // Jewelry Sets
  { id: 13438, subcategory: "gift-sets" },      // Jewelry 2Pcs / 3Pcs Sets
  { id: 13439, subcategory: "gift-sets" },      // Jewelry Sets
  { id: 13440, subcategory: "gift-sets" },      // Jewelry 4Pcs Sets
  { id: 13302, subcategory: "gift-sets" },      // Gifts & Hampers
  { id: 13446, subcategory: "gift-sets" },      // Gift Vanity Pouches
];

function fetchActivity(actId) {
  return new Promise((resolve) => {
    https.get(
      `https://www.savana.com/activity/${actId}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const start = data.indexOf('"goodsList":[');
          if (start === -1) return resolve([]);
          const arrStart = start + '"goodsList":'.length;
          let depth = 0;
          let arrEnd = -1;
          for (let i = arrStart; i < data.length; i++) {
            if (data[i] === "[") depth++;
            else if (data[i] === "]") {
              depth--;
              if (depth === 0) {
                arrEnd = i + 1;
                break;
              }
            }
          }
          if (arrEnd !== -1) {
            try {
              return resolve(JSON.parse(data.slice(arrStart, arrEnd)));
            } catch {
              return resolve([]);
            }
          }
          resolve([]);
        });
      }
    ).on("error", () => resolve([]));
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanGiftTitle(raw, subcategory) {
  let title = raw
    .replace(/Imitation\/Artificial Jewellery/gi, "Jewellery Gift Set")
    .replace(/Jewelry/gi, "Jewellery")
    .replace(/Makeup Box/gi, "Keepsake Jewellery Box")
    .replace(/Storage Box/gi, "Keepsake Jewellery Box")
    .replace(/Makeup Pouch/gi, "Gift Vanity Pouch")
    .replace(/&/g, " & ")
    .replace(/\s+/g, " ")
    .trim();

  // If title doesn't state box in keepsake-boxes
  if (subcategory === "keepsake-boxes" && !title.toLowerCase().includes("box")) {
    title = `${title} Keepsake Box`;
  }

  // Capitalize properly
  title = title
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
    .replace(/\b2pcs\b/gi, "2Pcs")
    .replace(/\b3pcs\b/gi, "3Pcs")
    .replace(/\b4pcs\b/gi, "4Pcs")
    .replace(/\b5pcs\b/gi, "5Pcs")
    .replace(/\b3d\b/gi, "3D");

  return title;
}

function generateGiftDescription(name, subcategory) {
  if (subcategory === "keepsake-boxes") {
    return `Store and protect your most cherished treasures in the ${name}. Elegantly constructed with anti-tarnish velvet interior lining, bespoke compartments for rings, earrings, and pendants, and a luxurious travel-friendly finish.`;
  }
  return `The perfect gesture of affection: the ${name}. Thoughtfully curated and coordinated for effortless elegance, arriving in Petal & Pearl boutique gift packaging with complimentary personalized gift messaging.`;
}

async function main() {
  console.log("Loading current catalogue from:", PRODUCTS_JSON_PATH);
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, "utf8"));
  console.log(`Starting catalogue count: ${products.length} products`);

  // Step 1: Reclassify existing boxes from everyday-essentials > trinket-dishes to gifts > keepsake-boxes
  let reclassifiedBoxes = 0;
  for (const p of products) {
    if (
      p.category === "everyday-essentials" &&
      p.subcategory === "trinket-dishes" &&
      p.name.toLowerCase().includes("box")
    ) {
      p.category = "gifts";
      p.subcategory = "keepsake-boxes";
      if (!p.tags.includes("keepsake boxes")) p.tags.push("keepsake boxes");
      if (!p.tags.includes("gifts")) p.tags.push("gifts");
      reclassifiedBoxes++;
    }
  }
  console.log(`Reclassified ${reclassifiedBoxes} existing boxes into Gifts > Keepsake Jewellery Boxes.`);

  // Build lookup of existing goods IDs and URLs
  const existingIds = new Set(products.map((p) => p.id));
  const existingLinks = new Set(products.map((p) => (p.product_link || "").trim().toLowerCase()));

  // Step 2: Fetch and ingest from Savana gift activities
  let addedCount = 0;
  let bestsellerAssigned = false;

  for (const act of ACTIVITIES) {
    console.log(`Fetching Savana Activity ${act.id} (${act.subcategory})...`);
    const goodsList = await fetchActivity(act.id);
    console.log(` - Retrieved ${goodsList.length} goods items.`);

    for (const g of goodsList) {
      const goodsId = g.goodsId;
      const pid = `prod-gift-${goodsId}`;

      // Build product link
      const rawTitle = g.goodsName || `Boutique Gift Item ${goodsId}`;
      const cleanName = cleanGiftTitle(rawTitle, act.subcategory);
      const slug = `${slugify(cleanName)}-${goodsId}`;
      const productLink = `https://www.savana.com/details/${slugify(rawTitle)}-${goodsId}`;

      if (existingIds.has(pid) || existingLinks.has(productLink.toLowerCase())) {
        continue;
      }

      // Extract images
      const images = [];
      if (Array.isArray(g.imageList) && g.imageList.length > 0) {
        for (const imgObj of g.imageList) {
          const rawUrl = imgObj.goodsThumb || imgObj.skcMainImg || imgObj.colorPic;
          if (rawUrl) {
            const hashMatch = rawUrl.match(/goods-pic\/([a-f0-9]{32})/);
            const highRes = hashMatch
              ? `https://img101.mfrcdn.com/goods-pic/${hashMatch[1]}_w1440_q90.webp`
              : rawUrl;
            if (!images.some((img) => img.image_url === highRes)) {
              images.push({
                id: `img-${goodsId}-${images.length + 1}`,
                image_url: highRes,
                alt_text: `${cleanName} - View ${images.length + 1}`,
                display_order: images.length + 1,
                is_primary: images.length === 0,
              });
            }
          }
        }
      }
      if (images.length === 0) {
        images.push({
          id: `img-${goodsId}-1`,
          image_url:
            act.subcategory === "keepsake-boxes"
              ? "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
              : "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
          alt_text: `${cleanName} - View 1`,
          display_order: 1,
          is_primary: true,
        });
      }

      // Extract variants
      const variants = [];
      if (Array.isArray(g.imageList)) {
        for (const img of g.imageList) {
          if (img.color && !variants.some((v) => v.attributes.color === img.color)) {
            variants.push({
              id: `var-${goodsId}-${img.colorId || variants.length + 1}`,
              title: img.color,
              sku: `PP-GIFT-${goodsId}-${(img.colorId || variants.length + 1)}`,
              stock: 25,
              attributes: { color: img.color },
            });
          }
        }
      }

      // Pricing: Strict +₹50 rule
      const rawPrice = Number(g.salePrice || g.promotePrice || 290);
      const supplierCost = Math.max(90, isNaN(rawPrice) ? 290 : rawPrice);
      const sellingPrice = supplierCost + 50;

      // Assign first top item as bestseller (hottest pick for gifts category)
      const isBestseller = !bestsellerAssigned && act.subcategory === "gift-sets";
      if (isBestseller) bestsellerAssigned = true;

      const product = {
        id: pid,
        sku: `PP-GIFT-${goodsId}`,
        name: cleanName,
        slug: slug,
        category: "gifts",
        subcategory: act.subcategory,
        description: generateGiftDescription(cleanName, act.subcategory),
        supplier_cost: supplierCost,
        selling_price: sellingPrice,
        custom_markup: null,
        stock: 45,
        is_featured: isBestseller || addedCount % 6 === 0,
        is_bestseller: isBestseller,
        is_new: true,
        is_visible: true,
        images: images,
        variants: variants,
        tags: [
          "gifts",
          act.subcategory === "keepsake-boxes" ? "keepsake boxes" : "gift sets",
          "hampers",
          "luxury gift",
          "boutique",
          "curated",
        ],
        product_link: productLink,
        source_url: productLink,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      products.push(product);
      existingIds.add(pid);
      existingLinks.add(productLink.toLowerCase());
      addedCount++;
    }
  }

  console.log(`Added ${addedCount} newly harvested gift & keepsake box products.`);

  // Step 3: Enforce strict +50 price check across ALL products
  let pricingViolations = 0;
  for (const p of products) {
    const expected = p.supplier_cost + 50;
    if (p.selling_price !== expected) {
      p.selling_price = expected;
      p.custom_markup = null;
      pricingViolations++;
    }
  }
  console.log(`Enforced +₹50 rule. Corrected ${pricingViolations} pricing discrepancies.`);

  // Step 4: Write back to products.json
  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), "utf8");
  console.log(`Updated ${PRODUCTS_JSON_PATH} successfully! Total products: ${products.length}`);

  // Summary breakdown
  const catSummary = {};
  const subSummary = {};
  for (const p of products) {
    catSummary[p.category] = (catSummary[p.category] || 0) + 1;
    const subKey = `${p.category} > ${p.subcategory}`;
    subSummary[subKey] = (subSummary[subKey] || 0) + 1;
  }
  console.log("\nCatalogue Distribution by Category:", catSummary);
  console.log("\nCatalogue Distribution by Subcategory:", subSummary);
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
