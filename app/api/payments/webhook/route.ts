import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const result = await OrderService.handleWebhookEvent(rawBody, signature);

    return NextResponse.json({ status: "ok", ...result });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing error" },
      { status: 400 }
    );
  }
}
