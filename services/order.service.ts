import db from "@/lib/db";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/constants";
import { CartService } from "./cart.service";
import { getPaymentService } from "./payment";

export class OrderService {
  /**
   * Generates a new order with prices calculated strictly server-side from the DB
   */
  static async createOrder(
    userId: string,
    addressId: string,
    paymentMethod: "RAZORPAY" | "COD" = "RAZORPAY",
    notes?: string
  ) {
    // 1. Verify address belongs to user
    const address = await db.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new Error("Invalid delivery address selected");
    }

    // 2. Fetch cart and re-calculate strictly from DB
    const cartSummary = await CartService.getCart(userId);

    if (cartSummary.items.length === 0) {
      throw new Error("Your cart is empty");
    }

    // 3. Verify stock availability for all items
    for (const item of cartSummary.items) {
      if (item.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${item.title}". Only ${item.stock} left in stock.`
        );
      }
    }

    const orderNumber = `OD${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    const shippingAddressSnapshot = JSON.stringify({
      name: address.name,
      phone: address.phone,
      street: address.street,
      locality: address.locality,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark,
      addressType: address.addressType,
    });

    if (paymentMethod === "COD") {
      // For COD, confirm immediately inside transaction and decrement stock
      const result = await db.$transaction(async (tx) => {
        // Decrement stock for all items
        for (const item of cartSummary.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }

        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId,
            addressId,
            shippingAddress: shippingAddressSnapshot,
            subtotal: cartSummary.subtotal,
            discount: cartSummary.discount,
            deliveryCharge: cartSummary.deliveryCharge,
            totalAmount: cartSummary.finalAmount,
            status: OrderStatus.PLACED,
            paymentMethod: PaymentMethod.COD,
            notes,
            items: {
              create: cartSummary.items.map((item) => ({
                productId: item.productId,
                title: item.title,
                image: item.image,
                price: item.discountPrice,
                mrp: item.price,
                quantity: item.quantity,
                total: item.totalPaise,
              })),
            },
            payments: {
              create: {
                provider: "COD",
                amount: cartSummary.finalAmount,
                status: PaymentStatus.PENDING,
              },
            },
          },
          include: {
            items: true,
            payments: true,
          },
        });

        // Clear user cart
        const cart = await tx.cart.findUnique({ where: { userId } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return newOrder;
      });

      return {
        order: result,
        razorpayOrder: null,
      };
    }

    // Razorpay Flow: Create Order in PLACED status and register Razorpay Order
    const paymentService = getPaymentService("RAZORPAY");
    const rzpOrder = await paymentService.createOrder({
      amount: cartSummary.finalAmount,
      currency: "INR",
      receipt: orderNumber,
      notes: {
        userId,
        orderNumber,
      },
    });

    const newOrder = await db.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        shippingAddress: shippingAddressSnapshot,
        subtotal: cartSummary.subtotal,
        discount: cartSummary.discount,
        deliveryCharge: cartSummary.deliveryCharge,
        totalAmount: cartSummary.finalAmount,
        status: OrderStatus.PLACED,
        paymentMethod: PaymentMethod.RAZORPAY,
        notes,
        items: {
          create: cartSummary.items.map((item) => ({
            productId: item.productId,
            title: item.title,
            image: item.image,
            price: item.discountPrice,
            mrp: item.price,
            quantity: item.quantity,
            total: item.totalPaise,
          })),
        },
        payments: {
          create: {
            provider: "RAZORPAY",
            razorpayOrderId: rzpOrder.providerOrderId,
            amount: cartSummary.finalAmount,
            status: PaymentStatus.PENDING,
          },
        },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    return {
      order: newOrder,
      razorpayOrder: rzpOrder,
    };
  }

  /**
   * Confirms payment via HMAC-SHA256 signature verification and executes stock decrement inside transaction
   */
  static async verifyAndConfirmPayment(
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const paymentService = getPaymentService("RAZORPAY");
    const isValid = paymentService.verifyPayment({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      await db.payment.updateMany({
        where: { orderId, razorpayOrderId },
        data: {
          status: PaymentStatus.FAILED,
          razorpayPaymentId,
          razorpaySignature,
          errorMessage: "Invalid payment cryptographic signature",
        },
      });
      throw new Error("Payment signature verification failed");
    }

    // Execute atomic update & stock decrement
    const confirmedOrder = await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, payments: true },
      });

      if (!order) throw new Error("Order not found");

      // Idempotency check: if already PAID, return without double-decrementing stock
      if (order.status === OrderStatus.PAID) {
        return order;
      }

      // Decrement stock for each purchased item
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }
      }

      // Update payment record
      await tx.payment.updateMany({
        where: { orderId, razorpayOrderId },
        data: {
          status: PaymentStatus.COMPLETED,
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
        },
        include: {
          items: true,
          payments: true,
          address: true,
        },
      });

      // Clear user cart
      const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return updated;
    });

    return confirmedOrder;
  }

  /**
   * Idempotent webhook event handler for payment.captured and payment.failed
   */
  static async handleWebhookEvent(rawBody: string, signature: string) {
    const paymentService = getPaymentService("RAZORPAY");
    const isValid = paymentService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      throw new Error("Invalid webhook signature");
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) return { received: true, ignored: true };

    const rzpOrderId = paymentEntity.order_id;
    const rzpPaymentId = paymentEntity.id;

    if (!rzpOrderId) return { received: true, ignored: true };

    const existingPayment = await db.payment.findFirst({
      where: { razorpayOrderId: rzpOrderId },
      include: { order: { include: { items: true } } },
    });

    if (!existingPayment) return { received: true, notFound: true };

    if (event === "payment.captured") {
      if (existingPayment.status !== PaymentStatus.COMPLETED) {
        await db.$transaction(async (tx) => {
          // Decrement stock if order was still PLACED
          if (existingPayment.order.status === OrderStatus.PLACED) {
            for (const item of existingPayment.order.items) {
              if (item.productId) {
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { decrement: item.quantity } },
                });
              }
            }
          }

          await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: PaymentStatus.COMPLETED,
              razorpayPaymentId: rzpPaymentId,
              webhookPayload: JSON.stringify(payload),
            },
          });

          await tx.order.update({
            where: { id: existingPayment.orderId },
            data: { status: OrderStatus.PAID },
          });
        });
      }
    } else if (event === "payment.failed") {
      await db.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: PaymentStatus.FAILED,
          razorpayPaymentId: rzpPaymentId,
          errorMessage: paymentEntity.error_description || "Payment failed at gateway",
          webhookPayload: JSON.stringify(payload),
        },
      });
    }

    return { received: true, processed: true };
  }

  /**
   * Order cancellation with stock restoration and refund trigger
   */
  static async cancelOrder(orderId: string, userId: string, isAdmin: boolean = false) {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });

    if (!order) throw new Error("Order not found");

    if (!isAdmin && order.userId !== userId) {
      throw new Error("You are not authorized to cancel this order");
    }

    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new Error("Order has already been shipped and cannot be cancelled");
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.REFUNDED
    ) {
      throw new Error("Order is already cancelled or refunded");
    }

    // Atomic stock restoration & cancellation
    const updated = await db.$transaction(async (tx) => {
      // If stock was already decremented (for COD orders or PAID orders), restore it
      const stockWasDecremented =
        order.paymentMethod === PaymentMethod.COD ||
        order.status === OrderStatus.PAID ||
        order.status === OrderStatus.PACKED;

      if (stockWasDecremented) {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      // Check if refund is needed
      const successfulPayment = order.payments.find(
        (p) => p.status === PaymentStatus.COMPLETED && p.razorpayPaymentId
      );

      let targetStatus: string = OrderStatus.CANCELLED;

      if (successfulPayment && successfulPayment.razorpayPaymentId) {
        try {
          const paymentService = getPaymentService("RAZORPAY");
          await paymentService.processRefund({
            paymentId: successfulPayment.razorpayPaymentId,
            amount: order.totalAmount,
            notes: { orderNumber: order.orderNumber, reason: "Customer cancelled" },
          });

          await tx.payment.update({
            where: { id: successfulPayment.id },
            data: { status: PaymentStatus.REFUNDED },
          });

          targetStatus = OrderStatus.REFUNDED;
        } catch (err) {
          console.error("Refund processing error on cancel:", err);
          targetStatus = OrderStatus.CANCELLED;
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: targetStatus },
        include: { items: true, payments: true, address: true },
      });
    });

    return updated;
  }

  /**
   * Retrieves single order by id or orderNumber
   */
  static async getOrder(identifier: string, userId?: string, isAdmin: boolean = false) {
    const order = await db.order.findFirst({
      where: {
        OR: [{ id: identifier }, { orderNumber: identifier }],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                rating: true,
                reviewCount: true,
              },
            },
          },
        },
        payments: true,
        address: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) return null;

    if (!isAdmin && userId && order.userId !== userId) {
      throw new Error("Unauthorized to view this order");
    }

    return order;
  }

  /**
   * Retrieves orders for user
   */
  static async getUserOrders(userId: string) {
    return db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        payments: true,
        address: true,
      },
    });
  }
}
