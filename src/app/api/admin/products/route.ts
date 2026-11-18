import { NextResponse } from "next/server";
import { getAllProductsAdmin, saveProductAdmin, deleteProductAdmin } from "@/lib/store";

export async function GET() {
  try {
    const products = getAllProductsAdmin();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name || !data.category || data.supplier_cost === undefined) {
      return NextResponse.json({ error: "Name, category, and supplier cost are required." }, { status: 400 });
    }

    const saved = saveProductAdmin(data);
    return NextResponse.json({ success: true, product: saved });
  } catch (err) {
    console.error("Save product error:", err);
    return NextResponse.json({ error: "Failed to save product." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing product ID." }, { status: 400 });
    }

    const deleted = deleteProductAdmin(id);
    return NextResponse.json({ success: deleted });
  } catch {
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
