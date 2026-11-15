import { IPaymentService } from "./payment.interface";
import { RazorpayService } from "./razorpay.service";
import { StripeService } from "./stripe.service";

export * from "./payment.interface";
export * from "./razorpay.service";
export * from "./stripe.service";

let razorpayInstance: RazorpayService | null = null;
let stripeInstance: StripeService | null = null;

export function getPaymentService(provider: "RAZORPAY" | "STRIPE" = "RAZORPAY"): IPaymentService {
  if (provider === "STRIPE") {
    if (!stripeInstance) stripeInstance = new StripeService();
    return stripeInstance;
  }

  if (!razorpayInstance) razorpayInstance = new RazorpayService();
  return razorpayInstance;
}
