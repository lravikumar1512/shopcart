export interface CreatePaymentOrderParams {
  amount: number; // In paise (e.g. 49900 = ₹499.00)
  currency: string; // e.g. "INR"
  receipt: string; // Internal unique reference, e.g. order number
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  providerOrderId: string;
  amount: number;
  currency: string;
  status: string;
  raw?: unknown;
}

export interface VerifyPaymentParams {
  orderId: string; // The provider order id (e.g. rzp order id)
  paymentId: string; // The payment id from provider (e.g. rzp payment id)
  signature: string; // The cryptographic signature from provider
}

export interface RefundParams {
  paymentId: string;
  amount?: number; // Optional partial refund in paise
  notes?: Record<string, string>;
}

export interface RefundResult {
  refundId: string;
  amount: number;
  status: string;
}

/**
 * Standard Payment Gateway Interface.
 * Allows seamless swapping between Razorpay, Stripe, or any other provider.
 */
export interface IPaymentService {
  readonly name: string;

  /**
   * Generates a new order on the payment gateway
   */
  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>;

  /**
   * Verifies payment authenticity via HMAC signature
   */
  verifyPayment(params: VerifyPaymentParams): boolean;

  /**
   * Verifies webhook payload authenticity
   */
  verifyWebhookSignature(payload: string, signature: string): boolean;

  /**
   * Issues refund to customer
   */
  processRefund(params: RefundParams): Promise<RefundResult>;
}
