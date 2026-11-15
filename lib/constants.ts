export const Role = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;
export type RoleType = (typeof Role)[keyof typeof Role];

export const OrderStatus = {
  PLACED: "PLACED",
  PAID: "PAID",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;
export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  RAZORPAY: "RAZORPAY",
  COD: "COD",
  STRIPE: "STRIPE",
} as const;
export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const AddressType = {
  HOME: "HOME",
  WORK: "WORK",
  OTHER: "OTHER",
} as const;
export type AddressTypeType = (typeof AddressType)[keyof typeof AddressType];

export const AUTH_COOKIE_NAME = "shopkart_token";

export const ORDER_STATUS_LABELS: Record<OrderStatusType, { label: string; color: string; desc: string }> = {
  PLACED: { label: "Order Placed", color: "bg-blue-100 text-blue-800 border-blue-200", desc: "Your order has been recorded" },
  PAID: { label: "Payment Confirmed", color: "bg-emerald-100 text-emerald-800 border-emerald-200", desc: "Payment received successfully" },
  PACKED: { label: "Packed", color: "bg-amber-100 text-amber-800 border-amber-200", desc: "Seller has packed your items" },
  SHIPPED: { label: "Shipped", color: "bg-indigo-100 text-indigo-800 border-indigo-200", desc: "Package is on the way" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800 border-green-200", desc: "Package delivered to your address" },
  CANCELLED: { label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-200", desc: "Order has been cancelled" },
  REFUNDED: { label: "Refunded", color: "bg-purple-100 text-purple-800 border-purple-200", desc: "Refund processed to original source" },
};

export const ORDER_TIMELINE_STEPS: OrderStatusType[] = [
  OrderStatus.PLACED,
  OrderStatus.PAID,
  OrderStatus.PACKED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];
