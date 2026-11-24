import { NextResponse } from "next/server";
import crypto from "crypto";
import { getProductByIdAdmin, createOrder, updateOrderStatusAdmin } from "@/lib/store";
import { calculateShippingFee, DEFAULT_PRICING_SETTINGS, calculateContribution } from "@/lib/pricing-engine";
import { OrderItem, CustomerAddress } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, items } = body as {
      customer: CustomerAddress;
      items: Array<{ productId: string; variantId?: string; quantity: number }>;
    };

    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.pincode) {
      return NextResponse.json({ error: "Missing required customer address fields." }, { status: 400 });
    }

    if (customer.country !== "India") {
      return NextResponse.json(
        { error: "International checkout is currently unavailable. We currently deliver within India only." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your shopping bag is empty." }, { status: 400 });
    }

    // Verify each item against server store
    const verifiedItems: OrderItem[] = [];
    let serverSubtotal = 0;
    let totalSupplierCost = 0;

    for (const item of items) {
      const product = getProductByIdAdmin(item.productId);
      if (!product || !product.is_visible) {
        return NextResponse.json(
          { error: `A product in your bag is no longer available.` },
          { status: 400 }
        );
      }

      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : undefined;
      const unitSellingPrice = variant?.price_override ?? product.selling_price;
      const unitSupplierCost = product.supplier_cost;
      const qty = Math.max(1, Number(item.quantity) || 1);

      // Check stock
      const availableStock = variant ? variant.stock : product.stock;
      if (qty > availableStock) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${availableStock}` },
          { status: 400 }
        );
      }

      const lineTotal = unitSellingPrice * qty;
      const lineCost = unitSupplierCost * qty;

      serverSubtotal += lineTotal;
      totalSupplierCost += lineCost;

      verifiedItems.push({
        id: `ord-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        product_id: product.id,
        variant_id: variant?.id,
        product_name: product.name,
        variant_title: variant?.title,
        sku: variant?.sku || product.sku,
        unit_selling_price: unitSellingPrice,
        unit_supplier_cost: unitSupplierCost,
        quantity: qty,
        total_price: lineTotal,
        total_cost: lineCost,
        image_url: product.images[0]?.image_url,
      });
    }

    const shippingFee = calculateShippingFee(serverSubtotal, DEFAULT_PRICING_SETTINGS);
    const totalPayable = serverSubtotal + shippingFee;

    // Calculate contribution metrics
    const contribution = calculateContribution({
      sellingPrice: serverSubtotal,
      supplierCost: totalSupplierCost,
      shippingCustomerPaid: shippingFee,
    });

    // Save pending order to store
    const order = createOrder({
      customer,
      items: verifiedItems,
      status: "pending_payment",
      payment_status: "unpaid",
      subtotal: serverSubtotal,
      shipping_fee: shippingFee,
      discount_amount: 0,
      total_payable: totalPayable,
      total_supplier_cost: totalSupplierCost,
      total_contribution: contribution.netContribution,
    });

    // Check if Razorpay keys are configured in environment
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpayKeyId && razorpaySecret) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Razorpay = require("razorpay");
        const instance = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpaySecret,
        });

        const rzpOrder = await instance.orders.create({
          amount: Math.round(totalPayable * 100), // amount in paise
          currency: "INR",
          receipt: order.order_number,
          notes: {
            orderNumber: order.order_number,
            customerName: customer.name.slice(0, 40),
            customerEmail: customer.email.slice(0, 40),
            customerPhone: customer.phone.slice(0, 20),
            customerCity: customer.city.slice(0, 30),
            customerState: customer.state.slice(0, 30),
            customerPincode: customer.pincode.slice(0, 10),
            customerHouse: customer.house.slice(0, 40),
            customerStreet: customer.street.slice(0, 40),
            itemsSummary: verifiedItems.map((i) => `${i.quantity}x ${i.product_name}`).join(", ").slice(0, 240),
          },
        });

        // Store Razorpay order ID on internal order
        updateOrderStatusAdmin({
          orderNumber: order.order_number,
          status: "pending_payment",
          razorpayOrderId: rzpOrder.id,
        });

        return NextResponse.json({
          orderNumber: order.order_number,
          razorpayOrderId: rzpOrder.id,
          amountPaise: rzpOrder.amount,
          currency: "INR",
          keyId: razorpayKeyId,
          isLivePayment: true,
          orderRecord: order,
        });
      } catch (rzpErr) {
        console.error("Razorpay order creation failed, falling back to staging simulation:", rzpErr);
      }
    }

    // Safe simulation mode when live credentials are not yet configured
    const simulatedOrderId = `order_sim_${crypto.randomBytes(8).toString("hex")}`;
    return NextResponse.json({
      orderNumber: order.order_number,
      razorpayOrderId: simulatedOrderId,
      amountPaise: Math.round(totalPayable * 100),
      currency: "INR",
      keyId: "rzp_test_unconfigured",
      isLivePayment: false,
      message: "Gateway in demo/staging mode. Real credentials pending in .env.local.",
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 500 });
  }
}
