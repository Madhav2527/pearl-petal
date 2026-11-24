import { NextResponse } from "next/server";
import { getAllOrdersAdminAsync, updateOrderStatusAdmin } from "@/lib/store";

export async function GET() {
  try {
    const orders = await getAllOrdersAdminAsync();
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    if (!data.orderNumber || !data.status) {
      return NextResponse.json({ error: "Missing orderNumber or status." }, { status: 400 });
    }

    const updated = updateOrderStatusAdmin({
      orderNumber: data.orderNumber,
      status: data.status,
      supplierOrderRef: data.supplierOrderRef,
      trackingNumber: data.trackingNumber,
      courierPartner: data.courierPartner,
      actualShippingCost: data.actualShippingCost,
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error("Order update error:", err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
