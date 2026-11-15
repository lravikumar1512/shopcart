import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Role } from "@/lib/constants";
import { createProductSchema } from "@/lib/validators";
import { calculateDiscount, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;

    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { sku: { contains: q } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        _count: {
          select: { orderItems: true, reviews: true },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve admin products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const baseSlug = slugify(data.title);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const discountPercent = calculateDiscount(data.price, data.discountPrice);

    const product = await db.product.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        discountPercent,
        stock: data.stock,
        sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isFeatured: data.isFeatured,
        isDealOfTheDay: data.isDealOfTheDay,
        highlights: data.highlights ? JSON.stringify(data.highlights) : null,
        specifications: data.specifications ? JSON.stringify(data.specifications) : null,
        images: {
          create: data.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
            altText: `${data.title} photo ${idx + 1}`,
          })),
        },
      },
      include: {
        images: true,
        category: true,
        brand: true,
      },
    });

    return NextResponse.json({ product, message: "Product created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Admin product create error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
