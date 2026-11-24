import { NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatusAdmin, getOrderByNumber, getAllOrdersAdmin } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const isMatch =
        expectedSignature.length === signature.length &&
        crypto.timingSafeEqual(
          Buffer.from(expectedSignature, "utf8"),
          Buffer.from(signature, "utf8")
        );

      if (!isMatch) {
        console.error("Invalid Razorpay webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const paymentId = paymentEntity?.id;
    const orderId = paymentEntity?.order_id;
    const method = paymentEntity?.method;

    if (event === "payment.captured" || event === "order.paid") {
      const orderReceipt = paymentEntity?.notes?.orderNumber;

      // Find order by order_number or by razorpay_order_id
      let targetOrder = orderReceipt ? getOrderByNumber(orderReceipt) : null;
      if (!targetOrder && orderId) {
        const allOrders = getAllOrdersAdmin();
        targetOrder = allOrders.find((o) => o.razorpay_order_id === orderId) || null;
      }

      if (targetOrder) {
        // Prevent duplicate webhook processing
        if (targetOrder.status === "paid" || targetOrder.payment_status === "paid") {
          return NextResponse.json({ status: "already_processed", orderNumber: targetOrder.order_number });
        }

        updateOrderStatusAdmin({
          orderNumber: targetOrder.order_number,
          status: "paid",
          paymentStatus: "paid",
          razorpayOrderId: orderId || targetOrder.razorpay_order_id,
          razorpayPaymentId: paymentId,
          paymentMethod: method,
        });

        console.log(`Webhook successfully confirmed payment for Order ${targetOrder.order_number}`);
      }
    } else if (event === "payment.failed") {
      const orderReceipt = paymentEntity?.notes?.orderNumber;
      if (orderReceipt) {
        const targetOrder = getOrderByNumber(orderReceipt);
        if (targetOrder && targetOrder.status === "pending_payment") {
          updateOrderStatusAdmin({
            orderNumber: targetOrder.order_number,
            status: "pending_payment",
            paymentStatus: "failed",
            razorpayPaymentId: paymentId,
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
