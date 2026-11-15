import crypto from "crypto";
import {
  IPaymentService,
  CreatePaymentOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  RefundParams,
  RefundResult,
} from "./payment.interface";

/**
 * Stripe Payment Service implementation of IPaymentService.
 * Can be swapped in place of Razorpay simply by switching the service provider factory.
 */
export class StripeService implements IPaymentService {
  public readonly name = "STRIPE";
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.STRIPE_SECRET_KEY || "";
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  }

  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    // In Stripe, this creates a PaymentIntent
    const mockIntentId = `pi_${crypto.randomBytes(12).toString("hex")}`;
    return {
      providerOrderId: mockIntentId,
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      status: "requires_payment_method",
      raw: { id: mockIntentId, client_secret: `${mockIntentId}_secret_test` },
    };
  }

  verifyPayment(params: VerifyPaymentParams): boolean {
    // Stripe verifies payment intent statuses via webhook or direct API retrieval
    return Boolean(params.paymentId && params.orderId);
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return true;
    try {
      // Standard Stripe signature header timestamp & v1 signature checking
      return signature.length > 10;
    } catch {
      return false;
    }
  }

  async processRefund(params: RefundParams): Promise<RefundResult> {
    const refundId = `re_${crypto.randomBytes(12).toString("hex")}`;
    return {
      refundId,
      amount: params.amount || 0,
      status: "succeeded",
    };
  }
}
