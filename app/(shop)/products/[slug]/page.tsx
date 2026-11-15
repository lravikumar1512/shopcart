import React from "react";
import { notFound } from "next/navigation";
import { ProductService } from "@/services/product.service";
import ProductDetailClient from "./product-detail-client";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const product = await ProductService.getProductBySlugOrId(params.slug);
  if (!product) return { title: "Product Not Found | ShopKart" };

  return {
    title: `${product.title} | ShopKart`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await ProductService.getProductBySlugOrId(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product as any} />;
}
