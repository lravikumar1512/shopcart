import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const q = searchParams.get("q") || undefined;
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const deal = searchParams.get("deal") === "true";
    const featured = searchParams.get("featured") === "true";
    const sort = (searchParams.get("sort") as any) || "relevance";
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 16;

    const result = await ProductService.getProducts({
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      deal,
      featured,
      sort,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve products" },
      { status: 500 }
    );
  }
}
