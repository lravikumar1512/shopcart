import React from "react";
import { ProductService } from "@/services/product.service";
import CategoryStrip from "@/components/product/category-strip";
import BannerCarousel from "@/components/product/banner-carousel";
import DealsSection from "@/components/product/deals-section";
import ProductCard from "@/components/product/product-card";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { banners, categories, dealsOfTheDay, featuredProducts } =
    await ProductService.getHomePageData();

  return (
    <div className="space-y-4">
      {/* 1. Category Strip */}
      <CategoryStrip categories={categories} />

      {/* 2. Hero Banner Carousel */}
      <BannerCarousel banners={banners} />

      {/* 3. Deals of the Day (with countdown) */}
      <DealsSection
        title="Deals of the Day"
        subtitle="Handpicked Discounts"
        products={dealsOfTheDay}
        viewAllLink="/products?deal=true"
      />

      {/* 4. Featured Products Section */}
      <div className="bg-white rounded-sm shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2874f0]" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Trending & Featured
            </h2>
            <span className="hidden sm:inline text-xs text-gray-500 font-medium">
              Top Rated Products
            </span>
          </div>

          <Link
            href="/products?featured=true"
            className="inline-flex items-center gap-1 bg-[#2874f0] hover:bg-[#1259c7] text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-sm transition"
          >
            <span>VIEW ALL</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
