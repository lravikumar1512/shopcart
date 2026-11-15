"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemUI {
  id?: string;
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
  isOutOfStock?: boolean;
}

interface CartState {
  items: CartItemUI[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  sellingTotal: number;
  deliveryCharge: number;
  finalAmount: number;
  isLoading: boolean;
  isLoggedIn: boolean;

  setLoggedIn: (loggedIn: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (product: any, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCartOnLogin: () => Promise<void>;
}

function calculateTotals(items: CartItemUI[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const sellingTotal = items.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);
  const discount = subtotal - sellingTotal;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      discount: 0,
      sellingTotal: 0,
      deliveryCharge: 0,
      finalAmount: 0,
      isLoading: false,
      isLoggedIn: false,

      setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),

      fetchCart: async () => {
        const { isLoggedIn } = get();
        if (!isLoggedIn) {
          // Re-calculate guest items
          set(calculateTotals(get().items));
          return;
        }

        try {
          set({ isLoading: true });
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            set({
              items: data.items,
              itemCount: data.itemCount,
              totalQuantity: data.totalQuantity,
              subtotal: data.subtotal,
              discount: data.discount,
              sellingTotal: data.sellingTotal,
              deliveryCharge: data.deliveryCharge,
              finalAmount: data.finalAmount,
              isLoading: false,
            });
          }
        } catch (err) {
          console.error("Cart fetch error:", err);
          set({ isLoading: false });
        }
      },

      addItem: async (product, quantity = 1) => {
        const { isLoggedIn, items } = get();

        if (isLoggedIn) {
          try {
            set({ isLoading: true });
            const res = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: product.id, quantity }),
            });

            const data = await res.json();
            if (!res.ok) {
              set({ isLoading: false });
              return { success: false, error: data.error || "Failed to add to cart" };
            }

            set({
              items: data.cart.items,
              itemCount: data.cart.itemCount,
              totalQuantity: data.cart.totalQuantity,
              subtotal: data.cart.subtotal,
              discount: data.cart.discount,
              sellingTotal: data.cart.sellingTotal,
              deliveryCharge: data.cart.deliveryCharge,
              finalAmount: data.cart.finalAmount,
              isLoading: false,
            });
            return { success: true };
          } catch (err: any) {
            set({ isLoading: false });
            return { success: false, error: err.message };
          }
        }

        // Guest Cart logic (LocalStorage persisted)
        const existingIndex = items.findIndex((i) => i.productId === product.id);
        const primaryImage =
          product.images?.[0]?.url ||
          product.image ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

        let newItems: CartItemUI[];

        if (existingIndex > -1) {
          const currentItem = items[existingIndex];
          const newQty = currentItem.quantity + quantity;
          if (newQty > product.stock) {
            return {
              success: false,
              error: `Only ${product.stock} units available in stock`,
            };
          }
          newItems = items.map((item, idx) =>
            idx === existingIndex
              ? {
                  ...item,
                  quantity: newQty,
                  totalPaise: item.discountPrice * newQty,
                }
              : item
          );
        } else {
          if (quantity > product.stock) {
            return {
              success: false,
              error: `Only ${product.stock} units available in stock`,
            };
          }
          const newItem: CartItemUI = {
            productId: product.id,
            title: product.title,
            slug: product.slug,
            image: primaryImage,
            price: product.price,
            discountPrice: product.discountPrice,
            discountPercent: product.discountPercent,
            stock: product.stock,
            quantity,
            totalPaise: product.discountPrice * quantity,
          };
          newItems = [...items, newItem];
        }

        set(calculateTotals(newItems));
        return { success: true };
      },

      updateQuantity: async (productId, quantity) => {
        const { isLoggedIn, items } = get();

        if (isLoggedIn) {
          try {
            const res = await fetch("/api/cart", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId, quantity }),
            });
            const data = await res.json();
            if (res.ok) {
              set({
                items: data.cart.items,
                itemCount: data.cart.itemCount,
                totalQuantity: data.cart.totalQuantity,
                subtotal: data.cart.subtotal,
                discount: data.cart.discount,
                sellingTotal: data.cart.sellingTotal,
                deliveryCharge: data.cart.deliveryCharge,
                finalAmount: data.cart.finalAmount,
              });
            }
          } catch (err) {
            console.error("Cart update error:", err);
          }
          return;
        }

        // Guest update
        let newItems: CartItemUI[];
        if (quantity <= 0) {
          newItems = items.filter((i) => i.productId !== productId);
        } else {
          newItems = items.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity: Math.min(quantity, i.stock),
                  totalPaise: i.discountPrice * Math.min(quantity, i.stock),
                }
              : i
          );
        }
        set(calculateTotals(newItems));
      },

      removeItem: async (productId) => {
        const { isLoggedIn, items } = get();

        if (isLoggedIn) {
          try {
            const res = await fetch(`/api/cart?productId=${productId}`, {
              method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
              set({
                items: data.cart.items,
                itemCount: data.cart.itemCount,
                totalQuantity: data.cart.totalQuantity,
                subtotal: data.cart.subtotal,
                discount: data.cart.discount,
                sellingTotal: data.cart.sellingTotal,
                deliveryCharge: data.cart.deliveryCharge,
                finalAmount: data.cart.finalAmount,
              });
            }
          } catch (err) {
            console.error("Cart remove error:", err);
          }
          return;
        }

        const newItems = items.filter((i) => i.productId !== productId);
        set(calculateTotals(newItems));
      },

      clearCart: async () => {
        const { isLoggedIn } = get();
        if (isLoggedIn) {
          await fetch("/api/cart", { method: "DELETE" }).catch(() => {});
        }
        set({
          items: [],
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          discount: 0,
          sellingTotal: 0,
          deliveryCharge: 0,
          finalAmount: 0,
        });
      },

      mergeGuestCartOnLogin: async () => {
        const { items } = get();
        if (items.length === 0) {
          // Fetch existing server cart
          set({ isLoggedIn: true });
          await get().fetchCart();
          return;
        }

        try {
          const payload = {
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          };

          const res = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();
            set({
              isLoggedIn: true,
              items: data.cart.items,
              itemCount: data.cart.itemCount,
              totalQuantity: data.cart.totalQuantity,
              subtotal: data.cart.subtotal,
              discount: data.cart.discount,
              sellingTotal: data.cart.sellingTotal,
              deliveryCharge: data.cart.deliveryCharge,
              finalAmount: data.cart.finalAmount,
            });
          }
        } catch (err) {
          console.error("Guest cart merge error:", err);
        }
      },
    }),
    {
      name: "shopkart_guest_cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
