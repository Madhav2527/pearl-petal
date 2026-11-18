import { NextResponse } from "next/server";
import { getPublicProducts } from "@/lib/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const subcategory = searchParams.get("subcategory") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const bestseller = searchParams.get("bestseller") === "true" ? true : undefined;
    const search = searchParams.get("search") || undefined;

    const products = getPublicProducts({
      category,
      subcategory,
      featured,
      bestseller,
      search,
    });

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    console.error("Public products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
