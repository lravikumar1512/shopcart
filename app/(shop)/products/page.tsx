import React, { Suspense } from "react";
import db from "@/lib/db";
import { ProductService } from "@/services/product.service";
import ProductCard from "@/components/product/product-card";
import FilterSidebar from "@/components/product/filter-sidebar";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    inStock?: string;
    deal?: string;
    featured?: string;
    sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const q = searchParams.q || undefined;
  const category = searchParams.category || undefined;
  const brand = searchParams.brand || undefined;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const minRating = searchParams.minRating ? Number(searchParams.minRating) : undefined;
  const inStock = searchParams.inStock === "true";
  const deal = searchParams.deal === "true";
  const featured = searchParams.featured === "true";
  const sort = searchParams.sort || "relevance";
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;

  // Parallel fetch: products and filter options
  const [data, categories, brands] = await Promise.all([
    ProductService.getProducts({
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      deal,
      featured,
      sort,
      page,
      limit: 16,
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const { products, pagination } = data;

  const buildUrlWithSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("sort", newSort);
    params.delete("page");
    return `/products?${params.toString()}`;
  };

  const buildUrlWithPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", String(newPage));
    return `/products?${params.toString()}`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      {/* Left Filter Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <FilterSidebar categories={categories} brands={brands} />
      </div>

      {/* Right Product Grid & Sorting */}
      <div className="flex-1 w-full bg-white rounded-sm shadow-sm border border-gray-200 p-4">
        {/* Top bar: Result count & Sort tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              {q ? `Search results for "${q}"` : category ? `Category: ${category}` : "All Products"}
            </h1>
            <p className="text-xs text-gray-500">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} –{" "}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{" "}
              {pagination.totalCount} products
            </p>
          </div>

          {/* Flipkart-style Sort strip */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs overflow-x-auto scrollbar-none">
            <span className="font-bold text-gray-700 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort:
            </span>
            {[
              { id: "relevance", label: "Relevance" },
              { id: "price_asc", label: "Price -- Low to High" },
              { id: "price_desc", label: "Price -- High to Low" },
              { id: "newest", label: "Newest First" },
              { id: "rating", label: "Popularity / Rating" },
            ].map((tab) => (
              <Link
                key={tab.id}
                href={buildUrlWithSort(tab.id)}
                className={`px-2.5 py-1.5 rounded transition whitespace-nowrap ${
                  sort === tab.id
                    ? "text-[#2874f0] font-bold border-b-2 border-[#2874f0] bg-blue-50/50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {products.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-3">
            <p className="text-base font-semibold text-gray-700">No products found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              We couldn&apos;t find any matches for your current filter criteria. Try adjusting your search term or clearing filters.
            </p>
            <Link
              href="/products"
              className="inline-block mt-2 bg-[#2874f0] text-white text-xs font-semibold px-4 py-2 rounded-sm"
            >
              Clear All Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
            <span className="text-xs text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <div className="flex items-center gap-2">
              {pagination.hasPrevPage ? (
                <Link
                  href={buildUrlWithPage(pagination.currentPage - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-300 cursor-not-allowed">
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </span>
              )}

              {pagination.hasNextPage ? (
                <Link
                  href={buildUrlWithPage(pagination.currentPage + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-300 cursor-not-allowed">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
