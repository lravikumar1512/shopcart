import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ProductService } from "@/services/product.service";
import { createReviewSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { productId, rating, comment, title } = parsed.data;

    const review = await ProductService.addReview(
      user.userId,
      productId,
      rating,
      comment,
      title
    );

    return NextResponse.json({
      review,
      message: "Thank you! Your verified review has been published.",
    });
  } catch (error: any) {
    console.error("Review POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 400 }
    );
  }
}
