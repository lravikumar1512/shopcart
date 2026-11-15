"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function AdminProductsPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [form, setForm] = useState({
    title: "",
    description: "",
    priceRupees: "",
    discountPriceRupees: "",
    stock: "",
    categoryId: "",
    brandId: "",
    imageUrl: "",
    isFeatured: false,
    isDealOfTheDay: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/categories"),
      ]);
      const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
      setBrands(catData.brands || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      title: "",
      description: "",
      priceRupees: "",
      discountPriceRupees: "",
      stock: "50",
      categoryId: categories[0]?.id || "",
      brandId: brands[0]?.id || "",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      isFeatured: false,
      isDealOfTheDay: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setForm({
      title: p.title,
      description: p.description,
      priceRupees: String(p.price / 100),
      discountPriceRupees: String(p.discountPrice / 100),
      stock: String(p.stock),
      categoryId: p.categoryId,
      brandId: p.brandId,
      imageUrl: p.images?.[0]?.url || "",
      isFeatured: p.isFeatured,
      isDealOfTheDay: p.isDealOfTheDay,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: any = {
        title: form.title,
        description: form.description,
        price: Math.round(Number(form.priceRupees) * 100),
        discountPrice: Math.round(Number(form.discountPriceRupees) * 100),
        stock: parseInt(form.stock, 10),
        categoryId: form.categoryId,
        brandId: form.brandId,
        images: [form.imageUrl],
        isFeatured: form.isFeatured,
        isDealOfTheDay: form.isDealOfTheDay,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to save product");
        return;
      }

      success(editingProduct ? "Product updated!" : "Product created!");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        success("Product deleted");
        loadData();
      }
    } catch {
      error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-xs text-gray-500">
            Create, edit prices, monitor stock levels and manage catalog items
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="fk-btn-orange py-2 px-5 text-xs font-bold shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW PRODUCT</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-sm p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by title, brand or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none text-gray-800"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-[#2874f0]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[11px] border-b">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">MRP / Selling</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const primaryImage =
                    p.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100";

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition">
                      {/* Product Column */}
                      <td className="p-3">
                        <div className="flex items-center gap-3 max-w-xs">
                          <div className="w-10 h-10 relative flex-shrink-0 border rounded bg-white p-0.5">
                            <Image
                              src={primaryImage}
                              alt={p.title}
                              fill
                              sizes="40px"
                              className="object-contain"
                            />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-gray-900 truncate">{p.title}</p>
                            <span className="text-[10px] text-gray-400 font-mono">
                              SKU: {p.sku || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3 font-medium text-gray-800">{p.category?.name}</td>

                      {/* Brand */}
                      <td className="p-3 font-medium text-gray-800">{p.brand?.name}</td>

                      {/* Prices */}
                      <td className="p-3">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(p.discountPrice)}
                        </div>
                        <div className="text-[10px] text-gray-400 line-through">
                          {formatCurrency(p.price)}
                        </div>
                      </td>

                      {/* Discount % */}
                      <td className="p-3">
                        <span className="font-bold text-[#388e3c]">
                          {p.discountPercent}% off
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stock <= 5
                              ? "bg-rose-100 text-rose-700"
                              : p.stock <= 15
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 text-gray-500 hover:text-[#2874f0] transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl max-w-xl w-full p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter title, pricing in rupees (auto converted to paise), stock and images.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full p-2 border rounded border-gray-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Brand *</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                    className="w-full p-2 border rounded border-gray-300 bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.priceRupees}
                    onChange={(e) => setForm({ ...form, priceRupees: e.target.value })}
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.discountPriceRupees}
                    onChange={(e) => setForm({ ...form, discountPriceRupees: e.target.value })}
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full p-2 border rounded border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Image URL *</label>
                <input
                  type="url"
                  required
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded text-[#2874f0]"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isDealOfTheDay}
                    onChange={(e) => setForm({ ...form, isDealOfTheDay: e.target.checked })}
                    className="rounded text-[#2874f0]"
                  />
                  <span>Deal of the Day 🔥</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="fk-btn-orange py-2 px-6 font-bold"
                >
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
