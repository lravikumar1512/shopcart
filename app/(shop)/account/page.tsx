"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useToast } from "@/components/ui/toast";

export default function AccountPage() {
  const router = useRouter();
  const { user, checkAuth, logout } = useAuthStore();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    addressType: "HOME",
    isDefault: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth().then((u) => {
      if (!u) router.push("/login?callbackUrl=/account");
    });
    loadData();
  }, [checkAuth, router]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to add address");
        return;
      }

      success("Address saved successfully");
      setShowAddForm(false);
      setForm({
        name: "",
        phone: "",
        street: "",
        locality: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        addressType: "HOME",
        isDefault: false,
      });
      loadData();
    } catch (err: any) {
      error(err.message || "Address creation error");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        success("Address deleted");
        loadData();
      }
    } catch (err) {
      error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        success("Default address updated");
        loadData();
      }
    } catch (err) {
      error("Failed to update default address");
    }
  };

  if (!user || loading) {
    return (
      <div className="py-20 flex justify-center text-[#2874f0]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Account</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-[#2874f0] rounded-full flex items-center justify-center font-bold text-xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-gray-900">{user.name}</h2>
              {user.role === "ADMIN" && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{user.email}</p>
            {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
          </div>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto px-4 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-300 rounded transition"
        >
          Logout
        </button>
      </div>

      {/* Saved Addresses Section */}
      <div id="addresses" className="bg-white rounded-sm shadow-sm border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Manage Addresses
            </h3>
            <p className="text-xs text-gray-400">Save delivery addresses for faster checkout</p>
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 bg-[#2874f0] hover:bg-[#1259c7] text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD NEW ADDRESS</span>
            </button>
          )}
        </div>

        {/* Add Address Form */}
        {showAddForm && (
          <form onSubmit={handleCreateAddress} className="bg-blue-50/30 border border-blue-200 p-4 rounded space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase">New Address Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="10-digit Phone *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="Flat / House / Street *"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="sm:col-span-2 p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Locality"
                value={form.locality}
                onChange={(e) => setForm({ ...form, locality: e.target.value })}
                className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="City *"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="State *"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="6-digit Pincode *"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="fk-btn-orange py-2 px-6 text-xs font-bold">
                SAVE ADDRESS
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-gray-500 hover:underline font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Addresses List */}
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-4 border rounded border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
            >
              <div className="space-y-1 text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{addr.name}</span>
                  <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                    {addr.addressType}
                  </span>
                  <span className="font-semibold text-gray-700">{addr.phone}</span>
                  {addr.isDefault && (
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>
                <p className="text-gray-600">
                  {addr.street}, {addr.locality && `${addr.locality}, `}
                  {addr.city}, {addr.state} - <strong className="text-gray-900">{addr.pincode}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-bold text-[#2874f0] hover:underline"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-gray-400 hover:text-rose-600 p-1 transition"
                  aria-label="Delete Address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
