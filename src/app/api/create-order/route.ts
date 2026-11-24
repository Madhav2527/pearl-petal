import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt } = body;

    // Validate amount
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount)) {
      return NextResponse.json(
        { error: "A valid amount in paise is required." },
        { status: 400 }
      );
    }

    // Minimum amount: 100 paise (₹1.00)
    if (parsedAmount < 100) {
      return NextResponse.json(
        { error: "Minimum order amount is 100 paise (₹1.00)." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receiptId = receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      const order = await razorpay.orders.create({
        amount: Math.round(parsedAmount),
        currency: currency.toUpperCase(),
        receipt: receiptId,
      });

      return NextResponse.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      });
    } catch (rzpErr: unknown) {
      const errObj = rzpErr as { statusCode?: number; error?: { description?: string; code?: string }; message?: string };
      console.error("Razorpay API Error:", rzpErr);

      if (errObj.statusCode === 401 || errObj.error?.code === "BAD_REQUEST_ERROR" && errObj.message?.includes("auth")) {
        return NextResponse.json(
          { error: "Razorpay authentication failed. Invalid Key ID or Secret." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: errObj.error?.description || errObj.message || "Failed to create order with Razorpay." },
        { status: errObj.statusCode || 500 }
      );
    }
  } catch (err: unknown) {
    console.error("Unexpected error in /api/create-order:", err);
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}
