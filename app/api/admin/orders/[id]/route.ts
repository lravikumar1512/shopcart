import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Role, OrderStatus, PaymentStatus } from "@/lib/constants";
import { getPaymentService } from "@/services/payment";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const order = await db.order.findUnique({
      where: { id },
      include: { payments: true, items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Action 1: Refund via Razorpay
    if (body.action === "refund") {
      const payment = order.payments.find(
        (p) => p.status === PaymentStatus.COMPLETED && p.razorpayPaymentId
      );

      if (!payment || !payment.razorpayPaymentId) {
        return NextResponse.json(
          { error: "No completed online payment found to refund" },
          { status: 400 }
        );
      }

      const paymentService = getPaymentService("RAZORPAY");
      const refundResult = await paymentService.processRefund({
        paymentId: payment.razorpayPaymentId,
        amount: body.amount || order.totalAmount,
        notes: {
          orderId: order.id,
          reason: body.reason || "Admin initiated refund",
        },
      });

      await db.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });

      const updatedOrder = await db.order.update({
        where: { id },
        data: { status: OrderStatus.REFUNDED },
        include: { payments: true, items: true },
      });

      return NextResponse.json({
        order: updatedOrder,
        refund: refundResult,
        message: "Refund processed successfully",
      });
    }

    // Action 2: Update status
    if (body.status) {
      const targetStatus = body.status;

      // If updating to CANCELLED, restore stock
      if (
        targetStatus === OrderStatus.CANCELLED &&
        order.status !== OrderStatus.CANCELLED &&
        order.status !== OrderStatus.REFUNDED
      ) {
        await db.$transaction(async (tx) => {
          for (const item of order.items) {
            if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
          await tx.order.update({
            where: { id },
            data: { status: OrderStatus.CANCELLED },
          });
        });
      } else {
        await db.order.update({
          where: { id },
          data: { status: targetStatus },
        });
      }

      const updated = await db.order.findUnique({
        where: { id },
        include: { payments: true, items: true, user: true, address: true },
      });

      return NextResponse.json({
        order: updated,
        message: `Order status updated to ${targetStatus}`,
      });
    }

    return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
