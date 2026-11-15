import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { CartService } from "@/services/cart.service";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({
        items: [],
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        discount: 0,
        sellingTotal: 0,
        deliveryCharge: 0,
        finalAmount: 0,
      });
    }

    const cart = await CartService.getCart(user.userId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to add to persistent cart" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    await CartService.addToCart(user.userId, parsed.data.productId, parsed.data.quantity);
    const updatedCart = await CartService.getCart(user.userId);

    return NextResponse.json({
      message: "Item added to cart",
      cart: updatedCart,
    });
  } catch (error: any) {
    console.error("Cart POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add item to cart" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, quantity } = body;

    const parsed = updateCartItemSchema.safeParse({ quantity });
    if (!parsed.success || !productId) {
      return NextResponse.json(
        { error: "Invalid product ID or quantity" },
        { status: 400 }
      );
    }

    await CartService.updateQuantity(user.userId, productId, parsed.data.quantity);
    const updatedCart = await CartService.getCart(user.userId);

    return NextResponse.json({
      message: "Cart updated",
      cart: updatedCart,
    });
  } catch (error: any) {
    console.error("Cart PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update cart" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = req.nextUrl;
    const productId = searchParams.get("productId");

    if (productId) {
      await CartService.removeFromCart(user.userId, productId);
    } else {
      await CartService.clearCart(user.userId);
    }

    const updatedCart = await CartService.getCart(user.userId);
    return NextResponse.json({
      message: productId ? "Item removed" : "Cart cleared",
      cart: updatedCart,
    });
  } catch (error: any) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove item" },
      { status: 500 }
    );
  }
}
