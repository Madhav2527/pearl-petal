import { NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatusAdmin, getOrderByNumber } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("Invalid webhook signature received");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderReceipt = paymentEntity?.notes?.orderNumber;

      if (orderReceipt) {
        const order = getOrderByNumber(orderReceipt);
        if (order && order.status === "pending_payment") {
          updateOrderStatusAdmin({
            orderNumber: order.order_number,
            status: "paid",
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
