import { NextResponse } from "next/server";

function cleanTitleFromUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname;
    const parts = pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1] || "Boutique Accessory";
    
    // Remove file extensions or IDs
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
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A valid product link is required." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: "Please enter a valid URL (e.g. https://...)." }, { status: 400 });
    }

    let title = "";
    let description = "";
    let imageUrl = "";
    let isExtracted = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();

        // 1. Extract Title
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          title = ogTitleMatch[1].trim();
        } else {
          const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleTagMatch && titleTagMatch[1]) {
            title = titleTagMatch[1].split(/[|\-–—]/)[0].trim();
          }
        }

        // 2. Extract Image
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogImageMatch && ogImageMatch[1]) {
          imageUrl = ogImageMatch[1].trim();
          // Resolve relative URLs
          if (imageUrl.startsWith("/")) {
            imageUrl = `${parsedUrl.origin}${imageUrl}`;
          }
        }

        // 3. Extract Description
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (ogDescMatch && ogDescMatch[1]) {
          description = ogDescMatch[1].trim();
        }

        if (title || imageUrl) {
          isExtracted = true;
        }
      }
    } catch {
      // Fetch failed or timed out, will fall back gracefully
    }

    // Fallbacks if not extracted or incomplete
    if (!title) {
      title = cleanTitleFromUrl(url);
    }

    if (!description) {
      description = `An elegant boutique addition to Petal & Pearl, designed with soft feminine contours and delicate details for daily grace.`;
    }

    if (!imageUrl) {
      imageUrl = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80";
    }

    const { category, subcategory } = detectCategoryFromText(title + " " + url);

    return NextResponse.json({
      success: true,
      isExtracted,
      sourceUrl: url,
      data: {
        name: title,
        description,
        image_url: imageUrl,
        category,
        subcategory,
      },
    });
  } catch (error) {
    console.error("Extract link error:", error);
    return NextResponse.json({ error: "Failed to process product link." }, { status: 500 });
  }
}
