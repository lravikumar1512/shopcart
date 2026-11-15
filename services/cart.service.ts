import db from "@/lib/db";

export interface CartSummary {
  items: {
    id: string;
    productId: string;
    title: string;
    slug: string;
    image: string;
    price: number; // MRP in paise
    discountPrice: number; // Selling price in paise
    discountPercent: number;
    stock: number;
    quantity: number;
    totalPaise: number;
    isOutOfStock: boolean;
  }[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number; // MRP sum in paise
  discount: number; // Total discount savings in paise
  sellingTotal: number; // Sum of selling prices in paise
  deliveryCharge: number; // in paise
  finalAmount: number; // sellingTotal + deliveryCharge in paise
}

export class CartService {
  /**
   * Retrieves or initializes cart for user and computes financial summaries
   */
  static async getCart(userId: string): Promise<CartSummary> {
    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: "asc" } },
                },
              },
            },
          },
        },
      });
    }

    const items = cart.items.map((item) => {
      const p = item.product;
      const primaryImage =
        p.images.find((img) => img.isPrimary)?.url ||
        p.images[0]?.url ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

      return {
        id: item.id,
        productId: p.id,
        title: p.title,
        slug: p.slug,
        image: primaryImage,
        price: p.price,
        discountPrice: p.discountPrice,
        discountPercent: p.discountPercent,
        stock: p.stock,
        quantity: item.quantity,
        totalPaise: p.discountPrice * item.quantity,
        isOutOfStock: p.stock < item.quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const sellingTotal = items.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);
    const discount = subtotal - sellingTotal;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    // Flipkart-style delivery policy: Free delivery on orders >= ₹500 (50000 paise), else ₹40 (4000 paise)
    const deliveryCharge = sellingTotal >= 50000 || items.length === 0 ? 0 : 4000;
    const finalAmount = sellingTotal + deliveryCharge;

    return {
      items,
      itemCount: items.length,
      totalQuantity,
      subtotal,
      discount,
      sellingTotal,
      deliveryCharge,
      finalAmount,
    };
  }

  /**
   * Adds an item to the cart with strict stock verification
   */
  static async addToCart(userId: string, productId: string, quantity: number = 1) {
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock <= 0) {
      throw new Error("This item is currently out of stock");
    }

    let cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
      });
    }

    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const newQuantity = (existingItem?.quantity || 0) + quantity;

    if (newQuantity > product.stock) {
      throw new Error(`Only ${product.stock} units available in stock`);
    }

    if (existingItem) {
      return db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    }

    return db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: Math.min(newQuantity, product.stock),
      },
    });
  }

  /**
   * Updates quantity or removes item if quantity reaches 0
   */
  static async updateQuantity(userId: string, productId: string, quantity: number) {
    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) throw new Error("Cart not found");

    if (quantity <= 0) {
      return db.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
        },
      });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error("Product not found");

    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    return db.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: { quantity },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  /**
   * Removes single product from cart
   */
  static async removeFromCart(userId: string, productId: string) {
    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) return;

    return db.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
      },
    });
  }

  /**
   * Clears entire cart for user
   */
  static async clearCart(userId: string) {
    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) return;

    return db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  /**
   * Merges guest items into logged-in user's cart
   */
  static async mergeGuestCart(
    userId: string,
    guestItems: { productId: string; quantity: number }[]
  ) {
    for (const item of guestItems) {
      try {
        await this.addToCart(userId, item.productId, item.quantity);
      } catch (err) {
        console.warn(`Could not merge item ${item.productId}:`, err);
      }
    }
    return this.getCart(userId);
  }
}
