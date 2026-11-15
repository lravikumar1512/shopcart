import db from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface ProductQueryOptions {
  q?: string;
  category?: string; // slug or id
  brand?: string; // slug or id
  minPrice?: number; // in paise
  maxPrice?: number; // in paise
  minRating?: number;
  inStock?: boolean;
  deal?: boolean;
  featured?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

export class ProductService {
  /**
   * Search and filter products with full pagination support
   */
  static async getProducts(opts: ProductQueryOptions = {}) {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      deal,
      featured,
      sort = "relevance",
      page = 1,
      limit = 16,
    } = opts;

    const skip = (Math.max(1, page) - 1) * limit;
    const where: Prisma.ProductWhereInput = {};

    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
        { brand: { name: { contains: term } } },
        { category: { name: { contains: term } } },
      ];
    }

    if (category) {
      where.category = {
        OR: [{ slug: category }, { id: category }],
      };
    }

    if (brand) {
      where.brand = {
        OR: [{ slug: brand }, { id: brand }],
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.discountPrice = {};
      if (minPrice !== undefined) where.discountPrice.gte = minPrice;
      if (maxPrice !== undefined) where.discountPrice.lte = maxPrice;
    }

    if (minRating !== undefined && minRating > 0) {
      where.rating = { gte: minRating };
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    if (deal) {
      where.isDealOfTheDay = true;
    }

    if (featured) {
      where.isFeatured = true;
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { discountPrice: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { discountPrice: "desc" };
    } else if (sort === "rating") {
      orderBy = { rating: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Retrieves single product by slug or id with full details and reviews
   */
  static async getProductBySlugOrId(identifier: string) {
    const product = await db.product.findFirst({
      where: {
        OR: [{ slug: identifier }, { id: identifier }],
      },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return product;
  }

  /**
   * Add a review from verified customer and recalculate average rating
   */
  static async addReview(
    userId: string,
    productId: string,
    rating: number,
    comment: string,
    title?: string
  ) {
    // 1. Check if user already reviewed this product
    const existing = await db.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      throw new Error("You have already reviewed this product");
    }

    // 2. Verified purchase check: user must have an order with this product in PAID or DELIVERED status
    const verifiedOrder = await db.order.findFirst({
      where: {
        userId,
        status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED"] },
        items: {
          some: { productId },
        },
      },
    });

    if (!verifiedOrder) {
      throw new Error("Only customers who have purchased this product can submit a review");
    }

    // 3. Create review & recalculate ratings inside transaction
    const result = await db.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          productId,
          rating,
          title,
          comment,
          isVerifiedPurchase: true,
        },
      });

      const allReviews = await tx.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const totalReviews = allReviews.length;
      const sumRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0;

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: avgRating,
          reviewCount: totalReviews,
        },
      });

      return review;
    });

    return result;
  }

  /**
   * Fetches home page data (banners, categories, deals, featured) in a single fast query
   */
  static async getHomePageData() {
    const [banners, categories, dealsOfTheDay, featuredProducts] = await Promise.all([
      db.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      db.category.findMany({
        orderBy: { name: "asc" },
      }),
      db.product.findMany({
        where: { isDealOfTheDay: true },
        take: 8,
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
        },
        orderBy: { discountPercent: "desc" },
      }),
      db.product.findMany({
        where: { isFeatured: true },
        take: 8,
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
        },
        orderBy: { rating: "desc" },
      }),
    ]);

    return {
      banners,
      categories,
      dealsOfTheDay,
      featuredProducts,
    };
  }
}
