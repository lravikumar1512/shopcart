import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { CartService } from "@/services/cart.service";
import { mergeCartSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to merge cart" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = mergeCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid cart items format" },
        { status: 400 }
      );
    }

    const updatedCart = await CartService.mergeGuestCart(user.userId, parsed.data.items);

    return NextResponse.json({
      message: "Guest cart merged successfully",
      cart: updatedCart,
    });
  } catch (error: any) {
    console.error("Cart merge error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to merge cart" },
      { status: 500 }
    );
  }
}
