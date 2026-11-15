import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { RazorpayService } from "@/services/payment/razorpay.service";

describe("Razorpay HMAC SHA256 Signature Verification", () => {
  const service = new RazorpayService();
  const secret = process.env.RAZORPAY_KEY_SECRET || "shopkart_secret_key_mock_123456";

  it("should successfully verify a valid HMAC SHA256 payment signature", () => {
    const orderId = "order_9A33XWu170gUtm";
    const paymentId = "pay_29A1XWuMqpGwAI";

    // Generate valid HMAC SHA256
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = service.verifyPayment({
      orderId,
      paymentId,
      signature: expectedSignature,
    });

    expect(isValid).toBe(true);
  });

  it("should reject tampered or invalid payment signatures", () => {
    const orderId = "order_9A33XWu170gUtm";
    const paymentId = "pay_29A1XWuMqpGwAI";
    const tamperedSignature = "bad_signature_000000000000000000000000000000000000000000000000";

    const isValid = service.verifyPayment({
      orderId,
      paymentId,
      signature: tamperedSignature,
    });

    expect(isValid).toBe(false);
  });

  it("should reject when orderId or paymentId is missing", () => {
    expect(service.verifyPayment({ orderId: "", paymentId: "pay_123", signature: "sig" })).toBe(false);
    expect(service.verifyPayment({ orderId: "order_123", paymentId: "", signature: "sig" })).toBe(false);
    expect(service.verifyPayment({ orderId: "order_123", paymentId: "pay_123", signature: "" })).toBe(false);
  });

  it("should verify webhook signature correctly", () => {
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_123", order_id: "order_123" } } },
    });
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "shopkart_webhook_secret_12345";

    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    expect(service.verifyWebhookSignature(payload, signature)).toBe(true);
    expect(service.verifyWebhookSignature(payload, "invalid_sig")).toBe(false);
  });
});
