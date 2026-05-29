import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment keys not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { analysisId } = await req.json();

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis ID required" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: 9900, // ₹99 in paise
      currency: "INR",
      receipt: analysisId.substring(0, 40),
      notes: {
        analysisId,
        product: "PlacementAI Full Report",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Payment order creation error:", error);
    const errorMessage = error?.error?.description || error?.message || "Failed to create payment order";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
