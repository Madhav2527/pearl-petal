import { NextResponse } from "next/server";
import crypto from "crypto";
import { getOrderByNumber, updateOrderStatusAdmin } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!orderNumber || !razorpayOrderId) {
      return NextResponse.json({ error: "Missing verification parameters." }, { status: 400 });
    }

    const order = getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // If live credentials are provided, strictly verify HMAC SHA-256 signature
    if (razorpaySecret && razorpayPaymentId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        console.error("Payment signature verification failed!");
        return NextResponse.json(
          { error: "Payment verification failed. Security signature mismatch." },
          { status: 400 }
        );
      }
    }

    // Update order status to Paid
    updateOrderStatusAdmin({
      orderNumber,
      status: "paid",
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      status: "paid",
      message: "Payment successfully verified and order confirmed.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Server payment verification failed." }, { status: 500 });
  }
}
