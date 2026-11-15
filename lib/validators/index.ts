import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  phone: z
    .string()
    .regex(/^[0-9+ -]{10,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const addressSchema = z.object({
  name: z.string().min(2, "Full name is required").max(60),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be a valid 10-digit number"),
  street: z.string().min(5, "Flat / House No. / Street is required").max(120),
  locality: z.string().max(80).optional(),
  city: z.string().min(2, "City is required").max(50),
  state: z.string().min(2, "State is required").max(50),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
  landmark: z.string().max(80).optional(),
  addressType: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  isDefault: z.boolean().default(false),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative").max(10),
});

export const mergeCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(10),
    })
  ),
});

export const createRazorpayOrderSchema = z.object({
  addressId: z.string().min(1, "Delivery address is required"),
  notes: z.string().max(200).optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "ShopKart Order ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

export const createCodOrderSchema = z.object({
  addressId: z.string().min(1, "Delivery address is required"),
  notes: z.string().max(200).optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().max(100).optional(),
  comment: z.string().min(5, "Review comment must be at least 5 characters").max(1000),
});

export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().int().positive("MRP must be positive (in paise)"),
  discountPrice: z.number().int().positive("Selling price must be positive (in paise)"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
  highlights: z.array(z.string()).optional(),
  specifications: z.record(z.record(z.string())).optional(),
  isFeatured: z.boolean().default(false),
  isDealOfTheDay: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PLACED", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

export const issueRefundSchema = z.object({
  amount: z.number().int().positive().optional(), // In paise, if partial
  reason: z.string().max(200).optional(),
});

export const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  imageUrl: z.string().url(),
  linkUrl: z.string().default("/"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
