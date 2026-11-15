import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const product = await ProductService.getProductBySlugOrId(slug);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { error: "Failed to load product details" },
      { status: 500 }
    );
  }
}
