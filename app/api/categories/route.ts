import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [categories, brands] = await Promise.all([
      db.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      db.brand.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
    ]);

    return NextResponse.json({ categories, brands });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
