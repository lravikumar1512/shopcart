"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  MapPin,
  Plus,
  ShieldCheck,
  CreditCard,
  Truck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useCartStore } from "@/lib/store/use-cart-store";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import PriceDetailsCard from "@/components/cart/price-details-card";
import RazorpayButton from "@/components/checkout/razorpay-button";

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  locality?: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  addressType: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const {
    items,
    totalQuantity,
    subtotal,
    discount,
    deliveryCharge,
    finalAmount,
    fetchCart,
    clearCart,
  } = useCartStore();
  const { success, error } = useToast();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1); // 1: Address, 2: Summary, 3: Payment
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    addressType: "HOME",
    isDefault: true,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [orderInProgress, setOrderInProgress] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<any>(null);

  useEffect(() => {
    checkAuth().then((u) => {
      if (!u) {
        router.push("/login?callbackUrl=/checkout");
      }
    });
    fetchCart();
  }, [checkAuth, fetchCart, router]);

  // Fetch addresses
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
        const defaultAddr = data.addresses?.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (data.addresses?.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        }
      }
    } catch (err) {
      console.error("Addresses error:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingAddress(true);
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to save address");
        return;
      }

      success("Delivery address saved!");
      setShowAddressForm(false);
      await loadAddresses();
      if (data.address?.id) {
        setSelectedAddressId(data.address.id);
      }
    } catch (err: any) {
      error(err.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  // Step 2 -> Step 3: Initiate Order on server with DB prices
  const handleProceedToPayment = async () => {
    if (!selectedAddressId) {
      error("Please select a delivery address to proceed");
      return;
    }

    try {
      setOrderInProgress(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to prepare order");
        setOrderInProgress(false);
        return;
      }

      // If COD, order is immediately confirmed inside DB transaction!
      if (paymentMethod === "COD") {
        success("Order placed successfully with Cash on Delivery!");
        clearCart();
        router.push(`/orders/${data.order.id}`);
        return;
      }

      // If Razorpay, advance to Payment step with order data
      setCreatedOrderData(data);
      setActiveStep(3);
    } catch (err: any) {
      error(err.message || "Checkout preparation error");
    } finally {
      setOrderInProgress(false);
    }
  };

  const handlePaymentSuccess = (confirmedOrder: any) => {
    clearCart();
    router.push(`/orders/${confirmedOrder.id}`);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left: 4-Step Flipkart Accordion Flow (8 cols) */}
      <div className="lg:col-span-8 space-y-3">
        {/* Step 1: Login Header */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-sm bg-[#2874f0] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                LOGIN
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {user?.name} <span className="text-gray-400 font-normal">({user?.email})</span>
              </span>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-[#388e3c]" />
        </div>

        {/* Step 2: Delivery Address */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200">
          <div
            className={`p-4 flex items-center justify-between cursor-pointer ${
              activeStep === 1 ? "bg-[#2874f0] text-white" : "bg-white text-gray-800"
            }`}
            onClick={() => setActiveStep(1)}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-sm text-xs font-bold flex items-center justify-center ${
                  activeStep === 1 ? "bg-white text-[#2874f0]" : "bg-[#2874f0] text-white"
                }`}
              >
                2
              </span>
              <span className="text-sm font-bold uppercase tracking-wide">
                DELIVERY ADDRESS
              </span>
            </div>
            {activeStep !== 1 && selectedAddress && (
              <span className="text-xs text-[#2874f0] font-semibold underline">
                CHANGE
              </span>
            )}
          </div>

          {activeStep === 1 ? (
            <div className="p-4 space-y-4">
              {loadingAddresses ? (
                <div className="py-6 flex items-center justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2874f0]" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`block p-3.5 border rounded cursor-pointer transition ${
                          selectedAddressId === addr.id
                            ? "border-[#2874f0] bg-blue-50/40 ring-1 ring-[#2874f0]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="addressSelect"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 text-[#2874f0] focus:ring-0"
                          />
                          <div className="flex-1 text-xs sm:text-sm text-gray-700 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{addr.name}</span>
                              <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                                {addr.addressType}
                              </span>
                              <span className="font-semibold text-gray-700">{addr.phone}</span>
                            </div>
                            <p className="text-gray-600">
                              {addr.street}, {addr.locality && `${addr.locality}, `}
                              {addr.city}, {addr.state} - <strong className="text-gray-900">{addr.pincode}</strong>
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Add New Address Toggle */}
                  {!showAddressForm ? (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-2 text-xs font-bold text-[#2874f0] hover:underline pt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ADD A NEW ADDRESS</span>
                    </button>
                  ) : (
                    <form onSubmit={handleSaveAddress} className="border border-blue-200 bg-blue-50/20 p-4 rounded space-y-3">
                      <h4 className="text-xs font-bold text-gray-800 uppercase">
                        New Delivery Address
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Name *"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          placeholder="10-digit Mobile Number *"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Flat, House no., Building, Street *"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="sm:col-span-2 p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Locality / Area"
                          value={addressForm.locality}
                          onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                          className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          placeholder="City / District *"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          placeholder="State *"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          placeholder="6-digit Pincode *"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="fk-btn-orange py-2 px-6 text-xs font-bold"
                        >
                          {savingAddress ? "Saving..." : "SAVE & DELIVER HERE"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="text-xs text-gray-500 hover:underline font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Continue Button */}
                  {selectedAddressId && (
                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => setActiveStep(2)}
                        className="fk-btn-orange py-2.5 px-8 text-xs font-bold shadow"
                      >
                        DELIVER HERE
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            selectedAddress && (
              <div className="p-4 text-xs sm:text-sm text-gray-700">
                <span className="font-bold text-gray-900">{selectedAddress.name}</span> —{" "}
                {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </div>
            )
          )}
        </div>

        {/* Step 3: Order Summary */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200">
          <div
            className={`p-4 flex items-center justify-between cursor-pointer ${
              activeStep === 2 ? "bg-[#2874f0] text-white" : "bg-white text-gray-800"
            }`}
            onClick={() => {
              if (selectedAddressId) setActiveStep(2);
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-sm text-xs font-bold flex items-center justify-center ${
                  activeStep === 2 ? "bg-white text-[#2874f0]" : "bg-[#2874f0] text-white"
                }`}
              >
                3
              </span>
              <span className="text-sm font-bold uppercase tracking-wide">
                ORDER SUMMARY ({totalQuantity} {totalQuantity === 1 ? "Item" : "Items"})
              </span>
            </div>
          </div>

          {activeStep === 2 && (
            <div className="p-4 divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.productId} className="py-3 flex items-center gap-4">
                  <div className="relative w-16 h-16 border rounded p-1 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 text-xs sm:text-sm">
                    <p className="font-medium text-gray-800 line-clamp-1">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-gray-900">
                        {formatCurrency(item.discountPrice)}
                      </span>
                      <span className="text-gray-400">Qty: {item.quantity}</span>
                      <span className="text-gray-600 font-semibold">
                        Total: {formatCurrency(item.totalPaise)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Order confirmation email will be sent to <strong>{user?.email}</strong>
                </span>
                <button
                  onClick={() => setActiveStep(3)}
                  className="fk-btn-orange py-2.5 px-8 text-xs font-bold shadow"
                >
                  CONTINUE TO PAYMENT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Payment Options */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200">
          <div
            className={`p-4 flex items-center justify-between ${
              activeStep === 3 ? "bg-[#2874f0] text-white" : "bg-white text-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-sm text-xs font-bold flex items-center justify-center ${
                  activeStep === 3 ? "bg-white text-[#2874f0]" : "bg-[#2874f0] text-white"
                }`}
              >
                4
              </span>
              <span className="text-sm font-bold uppercase tracking-wide">
                PAYMENT OPTIONS
              </span>
            </div>
          </div>

          {activeStep === 3 && (
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                {/* Option 1: Razorpay */}
                <label
                  className={`block p-4 border rounded cursor-pointer transition ${
                    paymentMethod === "RAZORPAY"
                      ? "border-[#2874f0] bg-blue-50/30 ring-1 ring-[#2874f0]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="text-[#2874f0] focus:ring-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#2874f0]" />
                        <span className="font-bold text-sm text-gray-900">
                          Razorpay (Cards, UPI, NetBanking, Wallets)
                        </span>
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Instant refund on cancellation. Verified by 256-bit encryption.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Option 2: Cash on Delivery */}
                <label
                  className={`block p-4 border rounded cursor-pointer transition ${
                    paymentMethod === "COD"
                      ? "border-[#2874f0] bg-blue-50/30 ring-1 ring-[#2874f0]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="text-[#2874f0] focus:ring-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#ff9f00]" />
                        <span className="font-bold text-sm text-gray-900">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Pay with cash or UPI QR at your doorstep upon delivery.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment Action CTA */}
              <div className="pt-4 border-t border-gray-100">
                {paymentMethod === "COD" ? (
                  <button
                    onClick={handleProceedToPayment}
                    disabled={orderInProgress}
                    className="w-full fk-btn-orange py-3.5 text-base font-bold shadow flex items-center justify-center gap-2"
                  >
                    {orderInProgress ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    <span>{orderInProgress ? "Confirming Order..." : "CONFIRM COD ORDER"}</span>
                  </button>
                ) : createdOrderData ? (
                  <RazorpayButton
                    orderId={createdOrderData.order.id}
                    razorpayOrder={createdOrderData.razorpayOrder}
                    keyId={createdOrderData.keyId}
                    user={{
                      name: user?.name || "Customer",
                      email: user?.email || "customer@example.com",
                      phone: user?.phone || "9999999999",
                    }}
                    onSuccess={handlePaymentSuccess}
                  />
                ) : (
                  <button
                    onClick={handleProceedToPayment}
                    disabled={orderInProgress}
                    className="w-full fk-btn-orange py-3.5 text-base font-bold shadow flex items-center justify-center gap-2"
                  >
                    {orderInProgress ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                    <span>{orderInProgress ? "Setting Up Razorpay..." : `PAY ${formatCurrency(finalAmount)}`}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Price Details (4 cols) */}
      <div className="lg:col-span-4">
        <PriceDetailsCard
          totalQuantity={totalQuantity}
          subtotal={subtotal}
          discount={discount}
          deliveryCharge={deliveryCharge}
          finalAmount={finalAmount}
        />
      </div>
    </div>
  );
}
