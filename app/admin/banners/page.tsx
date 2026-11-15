"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function AdminBannersPage() {
  const { success, error } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "/products",
    sortOrder: 1,
  });
  const [saving, setSaving] = useState(false);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      const d = await res.json();
      setBanners(d.banners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sortOrder: Number(form.sortOrder),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to create banner");
        return;
      }

      success("Banner added to homepage!");
      setShowAddModal(false);
      setForm({
        title: "",
        subtitle: "",
        imageUrl: "",
        linkUrl: "/products",
        sortOrder: 1,
      });
      loadBanners();
    } catch (err: any) {
      error(err.message || "Failed to add banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to remove this banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        success("Banner removed");
        loadBanners();
      }
    } catch {
      error("Failed to delete banner");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-xs text-gray-500">
            Control home hero carousel banners, promotional slides and target links
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="fk-btn-orange py-2 px-5 text-xs font-bold shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW BANNER</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-[#2874f0]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-gray-100">
                <Image
                  src={b.imageUrl}
                  alt={b.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Order: #{b.sortOrder}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{b.title}</h4>
                  {b.subtitle && <p className="text-gray-500">{b.subtitle}</p>}
                  <span className="text-[10px] text-blue-600 block mt-1">Link: {b.linkUrl}</span>
                </div>

                <button
                  onClick={() => handleDeleteBanner(b.id)}
                  className="text-gray-400 hover:text-rose-600 p-2 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 text-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Add Home Hero Banner</h3>
            <form onSubmit={handleCreateBanner} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Big Festive Electronics Bonanza"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Up to 80% Off on Laptops & Smart TVs"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Destination Link *</label>
                  <input
                    type="text"
                    required
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sort Order *</label>
                  <input
                    type="number"
                    required
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) })}
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="fk-btn-orange py-2 px-5 font-bold"
                >
                  {saving ? "Adding..." : "Add Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
