import { NextResponse } from "next/server";

const CATEGORY_STUDIO_IMAGES: Record<string, string> = {
  earrings: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
  necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
  bracelets: "https://images.unsplash.com/photo-1611591475870-761214041724?auto=format&fit=crop&w=800&q=80",
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
  "claw-clips": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
  scrunchies: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
  "hair-bows": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
  "phone-charms": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
  pouches: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
  "gift-sets": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
};

function isDirectImageUrl(urlStr: string): boolean {
  return (
    /\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(urlStr) ||
    urlStr.includes("images.unsplash.com") ||
    urlStr.includes("m.media-amazon.com/images") ||
    urlStr.includes("adn-static1.nykaa.com") ||
    urlStr.includes("assets.myntassets.com") ||
    urlStr.includes("/media/catalog/product")
  );
}

function cleanTitleFromUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname;
    const parts = pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1] || "Boutique Accessory";
    
    // Remove query params or trailing numbers/IDs
    const clean = lastPart
      .replace(/\.(html|htm|php|aspx|json)$/i, "")
      .replace(/^[0-9_-]+|[0-9_-]+$/g, "")
      .replace(/[-_]+/g, " ")
      .trim();

    return clean
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  } catch {
    return "New Boutique Accessory";
  }
}

function detectCategoryFromText(text: string): { category: "jewellery" | "hair-accessories" | "everyday-essentials" | "gifts"; subcategory: string } {
  const lower = text.toLowerCase();
  
  if (lower.includes("earring") || lower.includes("stud") || lower.includes("hoop") || lower.includes("jhumk")) {
    return { category: "jewellery", subcategory: "earrings" };
  }
  if (lower.includes("necklace") || lower.includes("choker") || lower.includes("chain") || lower.includes("pendant")) {
    return { category: "jewellery", subcategory: "necklaces" };
  }
  if (lower.includes("bracelet") || lower.includes("bangle") || lower.includes("anklet") || lower.includes("cuff")) {
    return { category: "jewellery", subcategory: "bracelets" };
  }
  if (lower.includes("ring") || lower.includes("band")) {
    return { category: "jewellery", subcategory: "rings" };
  }
  if (lower.includes("claw") || lower.includes("clip") || lower.includes("jaw")) {
    return { category: "hair-accessories", subcategory: "claw-clips" };
  }
  if (lower.includes("scrunchie") || lower.includes("scrunchy")) {
    return { category: "hair-accessories", subcategory: "scrunchies" };
  }
  if (lower.includes("bow") || lower.includes("ribbon") || lower.includes("barrette") || lower.includes("headband")) {
    return { category: "hair-accessories", subcategory: "hair-bows" };
  }
  if (lower.includes("phone") || lower.includes("charm") || lower.includes("strap")) {
    return { category: "everyday-essentials", subcategory: "phone-charms" };
  }
  if (lower.includes("pouch") || lower.includes("case") || lower.includes("organizer") || lower.includes("bag")) {
    return { category: "everyday-essentials", subcategory: "pouches" };
  }
  if (lower.includes("gift") || lower.includes("set") || lower.includes("hamper") || lower.includes("box")) {
    return { category: "gifts", subcategory: "gift-sets" };
  }

  return { category: "jewellery", subcategory: "earrings" };
}

export async function POST(req: Request) {
  try {
    const { url, directImageUrl } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A valid product link is required." }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      return NextResponse.json({ error: "Please enter a valid URL (e.g. https://...)." }, { status: 400 });
    }

    let title = "";
    let description = "";
    let imageUrl = typeof directImageUrl === "string" && directImageUrl.trim() ? directImageUrl.trim() : "";
    let isExtracted = false;

    // Check if the link itself is an image URL
    if (!imageUrl && isDirectImageUrl(trimmedUrl)) {
      imageUrl = trimmedUrl;
      title = cleanTitleFromUrl(trimmedUrl);
      isExtracted = true;
    }

    // Try HTML extraction if not already resolved as a direct image
    if (!imageUrl || !title) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(parsedUrl.toString(), {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Ch-Ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": "\"Windows\"",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Upgrade-Insecure-Requests": "1",
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const html = await response.text();

          // 1. Title Extraction (all meta and HTML tag orders)
          if (!title) {
            const ogTitle =
              html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1] ||
              html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:title["']/i)?.[1];

            if (ogTitle) {
              title = ogTitle.trim();
            } else {
              const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
              if (titleTag) {
                title = titleTag.split(/[|\-–—]/)[0].trim();
              }
            }
          }

          // 2. Image Extraction (OG, Twitter, JSON-LD, platform patterns)
          if (!imageUrl) {
            const extractedImg =
              html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1] ||
              html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)?.[1] ||
              html.match(/<meta[^>]*name=["']twitter:image:src["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i)?.[1] ||
              html.match(/https?:\/\/adn-static1\.nykaa\.com\/media\/catalog\/product\/[^\s"\x27]+\.(jpg|jpeg|png|webp)/i)?.[0] ||
              html.match(/https?:\/\/m\.media-amazon\.com\/images\/I\/[^\s"\x27]+\.(jpg|jpeg|png|webp)/i)?.[0] ||
              html.match(/https?:\/\/assets\.myntassets\.com\/[^\s"\x27]+\.(jpg|jpeg|png|webp)/i)?.[0];

            if (extractedImg) {
              imageUrl = extractedImg.trim();
              if (imageUrl.startsWith("//")) {
                imageUrl = "https:" + imageUrl;
              } else if (imageUrl.startsWith("/")) {
                imageUrl = parsedUrl.origin + imageUrl;
              }
            } else {
              // JSON-LD schema search
              const jsonLdMatch = html.match(/"image":\s*(\"[^\"]+\"|\[[^\]]+\])/i);
              if (jsonLdMatch && jsonLdMatch[1]) {
                const imgParsed = jsonLdMatch[1].match(/https?:\/\/[^"\x27]+/);
                if (imgParsed) {
                  imageUrl = imgParsed[0];
                }
              }
            }
          }

          // 3. Description Extraction
          if (!description) {
            const ogDesc =
              html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i)?.[1] ||
              html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)?.[1];

            if (ogDesc) {
              description = ogDesc.trim();
            }
          }

          if (title || imageUrl) {
            isExtracted = true;
          }
        }
      } catch {
        // Fallback gracefully if blocked or timed out
      }
    }

    // Determine category based on title, URL slug and text
    const { category, subcategory } = detectCategoryFromText((title || "") + " " + trimmedUrl);

    // Fallbacks if not extracted
    if (!title) {
      title = cleanTitleFromUrl(trimmedUrl);
    }

    if (!description) {
      description = "A thoughtfully curated " + subcategory.replace("-", " ") + " boutique piece for Petal & Pearl. Designed with organic contours and feminine details for effortless daily wear.";
    }

    if (!imageUrl) {
      // Pick matching studio category image so the product NEVER has a blank image
      imageUrl = CATEGORY_STUDIO_IMAGES[subcategory] || CATEGORY_STUDIO_IMAGES.earrings;
    }

    return NextResponse.json({
      success: true,
      isExtracted,
      sourceUrl: trimmedUrl,
      data: {
        name: title,
        description,
        image_url: imageUrl,
        category,
        subcategory,
        product_link: trimmedUrl,
      },
    });
  } catch (error) {
    console.error("Extract link error:", error);
    return NextResponse.json({ error: "Failed to process product link." }, { status: 500 });
  }
}
