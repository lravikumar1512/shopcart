import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  paymentMethod: z.enum(["RAZORPAY", "COD"]).default("RAZORPAY"),
  notes: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await OrderService.getUserOrders(user.userId);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { addressId, paymentMethod, notes } = parsed.data;

    const result = await OrderService.createOrder(
      user.userId,
      addressId,
      paymentMethod,
      notes
    );

    return NextResponse.json({
      order: result.order,
      razorpayOrder: result.razorpayOrder,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Order create POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 400 }
    );
  }
}
