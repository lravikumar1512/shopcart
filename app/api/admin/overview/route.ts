import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Role, OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      ordersToday,
      totalUsers,
      lowStockProducts,
      completedOrders,
      recentOrders,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      db.user.count({
        where: { role: Role.CUSTOMER },
      }),
      db.product.findMany({
        where: { stock: { lte: 10 } },
        take: 5,
        orderBy: { stock: "asc" },
        select: { id: true, title: true, stock: true, discountPrice: true, slug: true },
      }),
      db.order.findMany({
        where: {
          status: { in: [OrderStatus.PAID, OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
        },
        select: { totalAmount: true, createdAt: true },
      }),
      db.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
    ]);

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Group last 30 days daily sales for the chart
    const dailyMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(5, 10); // MM-DD
      dailyMap.set(key, 0);
    }

    completedOrders.forEach((o) => {
      if (o.createdAt >= thirtyDaysAgo) {
        const key = o.createdAt.toISOString().slice(5, 10);
        if (dailyMap.has(key)) {
          dailyMap.set(key, (dailyMap.get(key) || 0) + o.totalAmount);
        }
      }
    });

    const salesChart = Array.from(dailyMap.entries()).map(([date, revenue]) => ({
      date,
      revenueRupees: Math.round(revenue / 100),
      revenuePaise: revenue,
    }));

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        ordersToday,
        totalUsers,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
      salesChart,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard overview" },
      { status: 500 }
    );
  }
}
