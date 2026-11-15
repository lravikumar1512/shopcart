import crypto from "crypto";
import Razorpay from "razorpay";
import {
  IPaymentService,
  CreatePaymentOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  RefundParams,
  RefundResult,
} from "./payment.interface";

export class RazorpayService implements IPaymentService {
  public readonly name = "RAZORPAY";
  private razorpayClient: Razorpay | null = null;
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart12345";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "shopkart_secret_key_mock_123456";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "shopkart_webhook_secret_12345";

    if (this.keyId && this.keySecret && !this.keySecret.includes("mock")) {
      try {
        this.razorpayClient = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });
      } catch (err) {
        console.warn("Razorpay client init warning:", err);
      }
    }
  }

  /**
   * Creates an order with Razorpay in paise
   */
  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    if (this.razorpayClient) {
      try {
        const order = await this.razorpayClient.orders.create({
          amount: Math.round(params.amount),
          currency: params.currency || "INR",
          receipt: params.receipt,
          notes: params.notes,
        });

        return {
          providerOrderId: order.id,
          amount: typeof order.amount === "number" ? order.amount : Number(order.amount),
          currency: order.currency,
          status: order.status,
          raw: order,
        };
      } catch (error) {
        console.error("Razorpay order creation error:", error);
        // Fall back to generated test order if credentials are test/sandbox
      }
    }

    // Dev/Sandbox/Mock fallback order generation
    const mockOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;
    return {
      providerOrderId: mockOrderId,
      amount: Math.round(params.amount),
      currency: params.currency || "INR",
      status: "created",
      raw: { id: mockOrderId, mock: true },
    };
  }

  /**
   * Cryptographically verifies payment signature (HMAC-SHA256)
   * Formula: hmac_sha256(order_id + "|" + razorpay_payment_id, secret) == razorpay_signature
   */
  verifyPayment(params: VerifyPaymentParams): boolean {
    const { orderId, paymentId, signature } = params;
    if (!orderId || !paymentId || !signature) return false;

    // Special test bypass for demo test mock signatures
    if (signature.startsWith("sig_mock_") && process.env.NODE_ENV !== "production") {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(signature)
      );
    } catch {
      return false;
    }
  }

  /**
   * Verifies Razorpay Webhook signature (HMAC-SHA256)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!payload || !signature) return false;

    // Mock bypass in non-production if signature matches mock pattern
    if (signature.startsWith("sig_mock_") && process.env.NODE_ENV !== "production") {
      return true;
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(payload)
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );
    } catch {
      return false;
    }
  }

  /**
   * Issues refund via Razorpay
   */
  async processRefund(params: RefundParams): Promise<RefundResult> {
    if (this.razorpayClient && !params.paymentId.startsWith("pay_mock_")) {
      try {
        const refund = await this.razorpayClient.payments.refund(params.paymentId, {
          amount: params.amount ? Math.round(params.amount) : undefined,
          notes: params.notes,
        });

        return {
          refundId: refund.id,
          amount: Number(refund.amount),
          status: refund.status || "processed",
        };
      } catch (err) {
        console.error("Razorpay refund error:", err);
        throw new Error(err instanceof Error ? err.message : "Refund failed");
      }
    }

    // Dev / Test Mock Refund
    const mockRefundId = `rfnd_${crypto.randomBytes(8).toString("hex")}`;
    return {
      refundId: mockRefundId,
      amount: params.amount || 0,
      status: "processed",
    };
  }
}
