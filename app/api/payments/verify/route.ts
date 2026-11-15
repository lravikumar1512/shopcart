import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import { verifyPaymentSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment verification data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    const confirmedOrder = await OrderService.verifyAndConfirmPayment(
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    return NextResponse.json({
      success: true,
      order: confirmedOrder,
      message: "Payment verified and order confirmed successfully",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 400 }
    );
  }
}
