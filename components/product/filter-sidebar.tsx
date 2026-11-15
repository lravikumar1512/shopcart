"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, RotateCcw } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
}

export default function FilterSidebar({ categories, brands }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentRating = searchParams.get("minRating") || "";
  const inStock = searchParams.get("inStock") === "true";

  const [minPrice, setMinPrice] = useState(
    currentMinPrice ? String(Number(currentMinPrice) / 100) : ""
  );
  const [maxPrice, setMaxPrice] = useState(
    currentMaxPrice ? String(Number(currentMaxPrice) / 100) : ""
  );

  const applyFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page"); // Reset to page 1 on filter change
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) {
      params.set("minPrice", String(Math.round(Number(minPrice) * 100)));
    } else {
      params.delete("minPrice");
    }
    if (maxPrice) {
      params.set("maxPrice", String(Math.round(Number(maxPrice) * 100)));
    } else {
      params.delete("maxPrice");
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const q = searchParams.get("q");
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/products");
    }
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentBrand || currentMinPrice || currentMaxPrice || currentRating || inStock
  );

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 text-sm divide-y divide-gray-100">
      {/* Title & Clear */}
      <div className="pb-3 flex items-center justify-between">
        <h3 className="font-bold text-base text-gray-900 uppercase tracking-wide">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#2874f0] hover:underline font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            CLEAR ALL
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="py-3">
        <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wider mb-2">
          Category
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => applyFilter("category", null)}
            className={`w-full text-left px-2 py-1 rounded text-xs transition ${
              !currentCategory
                ? "bg-blue-50 text-[#2874f0] font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => applyFilter("category", cat.slug)}
              className={`w-full text-left px-2 py-1 rounded text-xs transition ${
                currentCategory === cat.slug
                  ? "bg-blue-50 text-[#2874f0] font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="py-3">
        <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wider mb-2">
          Price Range (₹)
        </h4>
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-xs p-1.5 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs p-1.5 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-1.5 rounded transition"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Brands */}
      <div className="py-3">
        <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wider mb-2">
          Brand
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => applyFilter("brand", null)}
            className={`w-full text-left px-2 py-1 rounded text-xs transition ${
              !currentBrand
                ? "bg-blue-50 text-[#2874f0] font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => applyFilter("brand", b.slug)}
              className={`w-full text-left px-2 py-1 rounded text-xs transition ${
                currentBrand === b.slug
                  ? "bg-blue-50 text-[#2874f0] font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Ratings */}
      <div className="py-3">
        <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wider mb-2">
          Customer Ratings
        </h4>
        <div className="space-y-1.5 text-xs">
          {[4, 3, 2].map((stars) => (
            <label
              key={stars}
              className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-gray-900"
            >
              <input
                type="radio"
                name="rating"
                checked={currentRating === String(stars)}
                onChange={() => applyFilter("minRating", String(stars))}
                className="text-[#2874f0] focus:ring-0"
              />
              <span className="flex items-center gap-1 font-medium">
                {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> & above
              </span>
            </label>
          ))}
          {currentRating && (
            <button
              onClick={() => applyFilter("minRating", null)}
              className="text-[11px] text-blue-600 hover:underline pt-1 block"
            >
              Clear rating filter
            </button>
          )}
        </div>
      </div>

      {/* Availability */}
      <div className="py-3">
        <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wider mb-2">
          Availability
        </h4>
        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => applyFilter("inStock", e.target.checked ? "true" : null)}
            className="rounded text-[#2874f0] focus:ring-0"
          />
          <span>Exclude Out of Stock</span>
        </label>
      </div>
    </div>
  );
}
