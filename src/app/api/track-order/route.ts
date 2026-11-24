import { NextResponse } from "next/server";
import { trackOrder, getOrderByNumberAsync } from "@/lib/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber") || "";
    const contact = searchParams.get("contact") || "";

    if (!orderNumber) {
      return NextResponse.json({ error: "Missing orderNumber" }, { status: 400 });
    }

    let order = contact
      ? trackOrder(orderNumber, contact)
      : null;

    if (!order) {
      order = await getOrderByNumberAsync(orderNumber);
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Tracking error" }, { status: 500 });
  }
}
