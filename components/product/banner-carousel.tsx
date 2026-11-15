"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl: string;
}

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [banners.length, nextSlide]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto mb-4 overflow-hidden rounded shadow-sm group bg-gray-100">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b, idx) => (
          <Link
            key={b.id}
            href={b.linkUrl}
            className="w-full flex-shrink-0 relative h-48 sm:h-72 md:h-80 block"
          >
            <Image
              src={b.imageUrl}
              alt={b.title}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover"
            />
            {/* Gradient Overlay & Text */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-6 sm:px-12 text-white">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#ffe500] mb-1">
                Special Offer
              </span>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold max-w-lg leading-tight mb-2 text-white drop-shadow">
                {b.title}
              </h2>
              {b.subtitle && (
                <p className="text-xs sm:text-base text-gray-200 max-w-md drop-shadow">
                  {b.subtitle}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
            aria-label="Previous Slide"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-r shadow-md transition opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
            aria-label="Next Slide"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-l shadow-md transition opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-6 bg-[#2874f0]" : "w-2 bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
