import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Role } from "@/lib/constants";
import { updateProductSchema } from "@/lib/validators";
import { calculateDiscount } from "@/lib/utils";

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
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let discountPercent = existing.discountPercent;
    if (data.price !== undefined || data.discountPrice !== undefined) {
      const price = data.price ?? existing.price;
      const discountPrice = data.discountPrice ?? existing.discountPrice;
      discountPercent = calculateDiscount(price, discountPrice);
    }

    // Handle image replacements if provided
    if (data.images && data.images.length > 0) {
      await db.productImage.deleteMany({ where: { productId: id } });
      await db.productImage.createMany({
        data: data.images.map((url, idx) => ({
          productId: id,
          url,
          isPrimary: idx === 0,
          sortOrder: idx,
        })),
      });
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        discountPercent,
        stock: data.stock,
        sku: data.sku,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isFeatured: data.isFeatured,
        isDealOfTheDay: data.isDealOfTheDay,
        highlights: data.highlights ? JSON.stringify(data.highlights) : undefined,
        specifications: data.specifications ? JSON.stringify(data.specifications) : undefined,
      },
      include: {
        images: true,
        category: true,
        brand: true,
      },
    });

    return NextResponse.json({ product: updated, message: "Product updated successfully" });
  } catch (error: any) {
    console.error("Admin product update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Admin product delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
