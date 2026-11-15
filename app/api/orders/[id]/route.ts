import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import { Role } from "@/lib/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const isAdmin = user.role === Role.ADMIN;
    const order = await OrderService.getOrder(id, user.userId, isAdmin);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Order GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

// Cancel order action
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const isAdmin = user.role === Role.ADMIN;

    if (body.action === "cancel") {
      const cancelledOrder = await OrderService.cancelOrder(id, user.userId, isAdmin);
      return NextResponse.json({
        order: cancelledOrder,
        message: "Order has been cancelled successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Order cancel error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel order" },
      { status: 400 }
    );
  }
}
