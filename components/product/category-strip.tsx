import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

export default function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <div className="bg-white shadow-sm border-b mb-3">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between overflow-x-auto gap-4 scrollbar-none py-1">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center min-w-[76px] sm:min-w-[90px] group text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 relative mb-1.5 rounded-full overflow-hidden bg-gray-50 p-1 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src={
                    cat.image ||
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150"
                  }
                  alt={cat.name}
                  fill
                  sizes="64px"
                  className="object-cover rounded-full"
                />
              </div>
              <span className="text-xs font-semibold text-gray-800 group-hover:text-[#2874f0] transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
