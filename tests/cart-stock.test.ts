import { describe, it, expect } from "vitest";

function calculateCartTotals(items: { price: number; discountPrice: number; quantity: number }[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const sellingTotal = items.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);
  const discount = subtotal - sellingTotal;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  // Free delivery if sellingTotal >= 50000 paise (₹500)
  const deliveryCharge = sellingTotal >= 50000 || items.length === 0 ? 0 : 4000;
  const finalAmount = sellingTotal + deliveryCharge;

  return {
    itemCount: items.length,
    totalQuantity,
    subtotal,
    discount,
    sellingTotal,
    deliveryCharge,
    finalAmount,
  };
}

function validateStock(requestedQty: number, availableStock: number) {
  if (requestedQty <= 0) return { valid: false, error: "Quantity must be at least 1" };
  if (availableStock <= 0) return { valid: false, error: "Item is out of stock" };
  if (requestedQty > availableStock) {
    return { valid: false, error: `Only ${availableStock} units available` };
  }
  return { valid: true };
}

describe("Cart Financial Summaries and Delivery Thresholds", () => {
  it("should correctly compute subtotal, discount savings, and final amount in paise", () => {
    const items = [
      { price: 7990000, discountPrice: 6599900, quantity: 1 }, // iPhone 15: ₹79,900 MRP, ₹65,999 selling
      { price: 449000, discountPrice: 129900, quantity: 2 }, // boAt: ₹4,490 MRP, ₹1,299 selling x 2
    ];

    const result = calculateCartTotals(items);

    expect(result.subtotal).toBe(7990000 + 449000 * 2); // 8888000 paise (₹88,880)
    expect(result.sellingTotal).toBe(6599900 + 129900 * 2); // 6859700 paise (₹68,597)
    expect(result.discount).toBe(8888000 - 6859700); // 2028300 paise (₹20,283 savings)
    expect(result.totalQuantity).toBe(3);
    expect(result.deliveryCharge).toBe(0); // FREE delivery since > ₹500
    expect(result.finalAmount).toBe(result.sellingTotal);
  });

  it("should charge ₹40 (4000 paise) delivery fee when cart total is under ₹500 (50000 paise)", () => {
    const items = [
      { price: 44900, discountPrice: 31900, quantity: 1 }, // Maybelline mascara: ₹319 (31900 paise)
    ];

    const result = calculateCartTotals(items);
    expect(result.sellingTotal).toBe(31900);
    expect(result.deliveryCharge).toBe(4000); // ₹40 delivery charge
    expect(result.finalAmount).toBe(35900); // 31900 + 4000
  });

  it("should have zero delivery charge when cart is empty", () => {
    const result = calculateCartTotals([]);
    expect(result.deliveryCharge).toBe(0);
    expect(result.finalAmount).toBe(0);
  });
});

describe("Stock Validation Rules", () => {
  it("should allow purchase when requested quantity is within available stock", () => {
    expect(validateStock(2, 10).valid).toBe(true);
    expect(validateStock(5, 5).valid).toBe(true);
  });

  it("should reject purchase when requested quantity exceeds stock", () => {
    const res = validateStock(6, 5);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Only 5 units available");
  });

  it("should reject purchase when product is completely out of stock", () => {
    const res = validateStock(1, 0);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Item is out of stock");
  });
});
