import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Standard domain constants compatible with both PostgreSQL Enums and SQLite strings
const Role = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;

const AddressType = {
  HOME: "HOME",
  WORK: "WORK",
  OTHER: "OTHER",
} as const;

const PaymentMethod = {
  RAZORPAY: "RAZORPAY",
  COD: "COD",
  STRIPE: "STRIPE",
} as const;

const OrderStatus = {
  PLACED: "PLACED",
  PAID: "PAID",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ShopKart database seed...");

  // Clean existing records if any
  await prisma.review.deleteMany().catch(() => {});
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.cart.deleteMany().catch(() => {});
  await prisma.productImage.deleteMany().catch(() => {});
  await prisma.productVariant.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.brand.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.address.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});
  await prisma.banner.deleteMany().catch(() => {});

  // 1. Users
  console.log("Creating users...");
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const customerPassword = await bcrypt.hash("Customer@123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "ShopKart Admin",
      email: "admin@shopkart.com",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "+91 9876543210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    },
  });

  const rahul = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      password: customerPassword,
      role: Role.CUSTOMER,
      phone: "+91 9123456780",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya@gmail.com",
      password: customerPassword,
      role: Role.CUSTOMER,
      phone: "+91 9988776655",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    },
  });

  // Rahul's Addresses
  const rahulHomeAddress = await prisma.address.create({
    data: {
      userId: rahul.id,
      name: "Rahul Sharma",
      phone: "9123456780",
      street: "Flat 402, Sunshine Heights, 100 Feet Road",
      locality: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      landmark: "Near Metro Pillar 84",
      addressType: AddressType.HOME,
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: rahul.id,
      name: "Rahul Sharma (Office)",
      phone: "9123456780",
      street: "7th Floor, Tech Park Tower B, Outer Ring Road",
      locality: "Bellandur",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103",
      landmark: "Opposite Ecospace",
      addressType: AddressType.WORK,
      isDefault: false,
    },
  });

  // Priya's Address
  await prisma.address.create({
    data: {
      userId: priya.id,
      name: "Priya Patel",
      phone: "9988776655",
      street: "B-12, Green Glen Towers",
      locality: "Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400053",
      landmark: "Near Infinity Mall",
      addressType: AddressType.HOME,
      isDefault: true,
    },
  });

  // 2. Categories (8 categories)
  console.log("Creating categories...");
  const categoriesData = [
    {
      name: "Mobiles & Tablets",
      slug: "mobiles-tablets",
      description: "Latest smartphones, flagship devices, iPads and tablets",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
    },
    {
      name: "Electronics",
      slug: "electronics",
      description: "Laptops, audio, smart watches, headphones, and gaming gear",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300",
    },
    {
      name: "Appliances",
      slug: "appliances",
      description: "Smart TVs, refrigerators, washing machines and microwave ovens",
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300",
    },
    {
      name: "Fashion",
      slug: "fashion",
      description: "Men's and women's clothing, footwear, watches and sunglasses",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300",
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Furniture, home decor, cookware and kitchen appliances",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300",
    },
    {
      name: "Beauty & Grooming",
      slug: "beauty-grooming",
      description: "Skincare, haircare, perfumes, trimmers and cosmetics",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300",
    },
    {
      name: "Toys & Baby Care",
      slug: "toys-baby",
      description: "Educational toys, remote cars, board games and baby essentials",
      image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300",
    },
    {
      name: "Sports & Fitness",
      slug: "sports-fitness",
      description: "Gym equipment, running shoes, cycles, yoga mats and sportswear",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300",
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({
      data: cat,
    });
  }

  // 3. Brands
  console.log("Creating brands...");
  const brandsData = [
    { name: "Apple", slug: "apple" },
    { name: "Samsung", slug: "samsung" },
    { name: "Sony", slug: "sony" },
    { name: "OnePlus", slug: "oneplus" },
    { name: "Dell", slug: "dell" },
    { name: "boAt", slug: "boat" },
    { name: "LG", slug: "lg" },
    { name: "Nike", slug: "nike" },
    { name: "Puma", slug: "puma" },
    { name: "Philips", slug: "philips" },
    { name: "Prestige", slug: "prestige" },
    { name: "L'Oreal", slug: "loreal" },
    { name: "Decathlon", slug: "decathlon" },
    { name: "Lego", slug: "lego" },
    { name: "Xiaomi", slug: "xiaomi" },
    { name: "Noise", slug: "noise" },
  ];

  const brands: Record<string, any> = {};
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.create({
      data: b,
    });
  }

  // 4. Banners
  console.log("Creating home banners...");
  await prisma.banner.createMany({
    data: [
      {
        title: "Big Diwali & Festive Bonanza",
        subtitle: "Up to 80% Off on Top Electronics, Mobiles & Fashion",
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80",
        linkUrl: "/products?deal=true",
        sortOrder: 1,
      },
      {
        title: "Next-Gen Smartphones",
        subtitle: "iPhone 15 Series, Galaxy S24 Ultra & Flagship Deals",
        imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1600&auto=format&fit=crop&q=80",
        linkUrl: "/products?category=mobiles-tablets",
        sortOrder: 2,
      },
      {
        title: "Upgrade Your Workspace",
        subtitle: "High-Performance Laptops & 4K Monitors with No Cost EMI",
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1600&auto=format&fit=crop&q=80",
        linkUrl: "/products?category=electronics",
        sortOrder: 3,
      },
      {
        title: "Home & Kitchen Makeover",
        subtitle: "Transform your living space with stylish premium essentials",
        imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80",
        linkUrl: "/products?category=home-kitchen",
        sortOrder: 4,
      },
    ],
  });

  // 5. Products (50+ realistic items across 8 categories)
  console.log("Creating 50+ realistic products...");
  const productsList = [
    // --- Mobiles & Tablets (8 products) ---
    {
      title: "Apple iPhone 15 (Blue, 128 GB)",
      slug: "apple-iphone-15-blue-128gb",
      description: "Experience Dynamic Island, 48MP Main camera with 2x Telephoto, and USB-C connectivity. Powered by the superfast A16 Bionic chip with all-day battery life and Ceramic Shield front glass.",
      price: 7990000,
      discountPrice: 6599900,
      discountPercent: 17,
      stock: 45,
      sku: "IPH15-BLU-128",
      rating: 4.6,
      reviewCount: 1420,
      categorySlug: "mobiles-tablets",
      brandSlug: "apple",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800",
      ],
      highlights: JSON.stringify([
        "128 GB ROM",
        "15.49 cm (6.1 inch) Super Retina XDR Display",
        "48MP + 12MP Dual Rear Camera | 12MP Front Camera",
        "A16 Bionic Chip, 6 Core Processor",
      ]),
      specifications: JSON.stringify({
        General: { Model: "iPhone 15", Color: "Blue", SIM: "Dual SIM (Nano + eSIM)" },
        Display: { Resolution: "2556 x 1179 Pixels", Type: "Super Retina XDR OLED" },
        Camera: { Primary: "48MP + 12MP", Selfie: "12MP TrueDepth" },
      }),
    },
    {
      title: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)",
      slug: "samsung-galaxy-s24-ultra-titanium-gray-256gb",
      description: "Galaxy AI is here. 200MP camera with Quad Telephoto system, built-in S Pen, Titanium frame, and Snapdragon 8 Gen 3 for Galaxy.",
      price: 13499900,
      discountPrice: 11999900,
      discountPercent: 11,
      stock: 30,
      sku: "S24U-TGR-256",
      rating: 4.7,
      reviewCount: 980,
      categorySlug: "mobiles-tablets",
      brandSlug: "samsung",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
        "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800",
      ],
      highlights: JSON.stringify([
        "12 GB RAM | 256 GB ROM",
        "17.27 cm (6.8 inch) Dynamic AMOLED 2X Display",
        "200MP + 50MP + 12MP + 10MP | 12MP Front Camera",
        "5000 mAh Battery with S Pen Included",
      ]),
      specifications: JSON.stringify({
        General: { Model: "Galaxy S24 Ultra", Color: "Titanium Gray" },
        Performance: { Processor: "Snapdragon 8 Gen 3", RAM: "12 GB" },
      }),
    },
    {
      title: "OnePlus 12 (Flowy Emerald, 16GB RAM, 512GB Storage)",
      slug: "oneplus-12-flowy-emerald-512gb",
      description: "Fast and Smooth performance on Snapdragon 8 Gen 3 with 4th Gen Hasselblad Camera System, 5400 mAh battery and 100W SUPERVOOC charging.",
      price: 6999900,
      discountPrice: 6199900,
      discountPercent: 11,
      stock: 50,
      sku: "OP12-EMR-512",
      rating: 4.5,
      reviewCount: 650,
      categorySlug: "mobiles-tablets",
      brandSlug: "oneplus",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      ],
      highlights: JSON.stringify([
        "16 GB RAM | 512 GB ROM",
        "100W SUPERVOOC + 50W AIRVOOC Wireless",
        "50MP Sony LYT-808 with OIS",
        "6.82 inch 2K 120Hz ProXDR Display",
      ]),
    },
    {
      title: "Apple iPad Air 11-inch (M2 Chip, Wi-Fi, 128GB - Space Grey)",
      slug: "apple-ipad-air-11-m2-128gb",
      description: "Redesigned with the blazing-fast M2 chip, gorgeous Liquid Retina display, landscape front camera, and ultra-fast Wi-Fi 6E.",
      price: 5990000,
      discountPrice: 5490000,
      discountPercent: 8,
      stock: 25,
      sku: "IPAD-AIR-M2-128",
      rating: 4.8,
      reviewCount: 320,
      categorySlug: "mobiles-tablets",
      brandSlug: "apple",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
      ],
      highlights: JSON.stringify([
        "Apple M2 chip with 8-core CPU and 10-core GPU",
        "27.69 cm (11 inch) Liquid Retina Display",
        "12MP Wide back camera, 12MP Ultra Wide front camera",
      ]),
    },
    {
      title: "Samsung Galaxy Tab S9 FE (Wi-Fi, 6GB RAM, 128GB Storage)",
      slug: "samsung-galaxy-tab-s9-fe",
      description: "Vibrant 90Hz display, bundled S Pen, IP68 water and dust resistance, long-lasting 8000 mAh battery for creativity and streaming.",
      price: 4499900,
      discountPrice: 3199900,
      discountPercent: 28,
      stock: 40,
      sku: "TABS9-FE-128",
      rating: 4.4,
      reviewCount: 290,
      categorySlug: "mobiles-tablets",
      brandSlug: "samsung",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800",
      ],
      highlights: JSON.stringify([
        "6 GB RAM | 128 GB ROM | Expandable up to 1 TB",
        "27.69 cm (10.9 inch) WQXGA Display",
        "S Pen included in box with IP68 rating",
      ]),
    },
    {
      title: "Xiaomi Redmi Note 13 Pro+ 5G (Fusion Purple, 256 GB)",
      slug: "redmi-note-13-pro-plus-5g",
      description: "Flagship 200MP camera with OIS, 120W HyperCharge, curved 1.5K AMOLED screen and IP68 water resistance rating.",
      price: 3399900,
      discountPrice: 2799900,
      discountPercent: 17,
      stock: 60,
      sku: "RN13P-PUR-256",
      rating: 4.3,
      reviewCount: 840,
      categorySlug: "mobiles-tablets",
      brandSlug: "xiaomi",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800",
      ],
      highlights: JSON.stringify([
        "8 GB RAM | 256 GB ROM",
        "120W HyperCharge (100% in 19 mins)",
        "200MP Samsung ISOCELL HP3 Sensor",
      ]),
    },
    {
      title: "Apple iPhone 13 (Midnight, 128 GB)",
      slug: "apple-iphone-13-midnight-128gb",
      description: "Our most advanced dual-camera system ever. Super Retina XDR display. A15 Bionic chip. Durable design and huge leap in battery life.",
      price: 5990000,
      discountPrice: 4799900,
      discountPercent: 19,
      stock: 80,
      sku: "IPH13-MID-128",
      rating: 4.6,
      reviewCount: 4500,
      categorySlug: "mobiles-tablets",
      brandSlug: "apple",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      ],
      highlights: JSON.stringify([
        "128 GB ROM",
        "15.49 cm (6.1 inch) Super Retina XDR Display",
        "12MP + 12MP Dual Rear Camera | 12MP Front Camera",
        "A15 Bionic Chip Processor",
      ]),
    },
    {
      title: "OnePlus Nord CE4 5G (Celadon Marble, 128 GB)",
      slug: "oneplus-nord-ce4-5g",
      description: "Snapdragon 7 Gen 3 processor, 100W SUPERVOOC charging, 5500 mAh battery, and Sony LYT-600 with OIS camera.",
      price: 2499900,
      discountPrice: 2199900,
      discountPercent: 12,
      stock: 75,
      sku: "NORD-CE4-128",
      rating: 4.3,
      reviewCount: 1100,
      categorySlug: "mobiles-tablets",
      brandSlug: "oneplus",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800",
      ],
      highlights: JSON.stringify([
        "8 GB RAM | 128 GB ROM",
        "100W SUPERVOOC Fastest Nord Charging",
        "5500 mAh Mega Battery",
      ]),
    },

    // --- Electronics (Laptops, Audio, Watches) (8 products) ---
    {
      title: "Apple MacBook Air 13-inch (M2 Chip, 8GB Unified, 256GB SSD - Midnight)",
      slug: "apple-macbook-air-m2-midnight",
      description: "Strikingly thin design with all-day battery life up to 18 hours. Brilliant Liquid Retina display, MagSafe charging, and 1080p FaceTime HD camera.",
      price: 9990000,
      discountPrice: 8499000,
      discountPercent: 14,
      stock: 35,
      sku: "MBA-M2-MID-256",
      rating: 4.8,
      reviewCount: 780,
      categorySlug: "electronics",
      brandSlug: "apple",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
      ],
      highlights: JSON.stringify([
        "Apple M2 chip with 8-core CPU and 8-core GPU",
        "8 GB Unified Memory | 256 GB SSD",
        "34.46 cm (13.6 inch) Liquid Retina Display",
        "Up to 18 hours battery life",
      ]),
    },
    {
      title: "Dell XPS 13 Plus (Intel Core i7 13th Gen, 16GB, 1TB SSD, 4K OLED)",
      slug: "dell-xps-13-plus-i7-4k",
      description: "Double the performance in the same 13-inch size. Seamless glass touchpad, zero-lattice keyboard, and breathtaking 4K InfinityEdge OLED touch display.",
      price: 18999900,
      discountPrice: 16499900,
      discountPercent: 13,
      stock: 15,
      sku: "DELL-XPS13P-1TB",
      rating: 4.7,
      reviewCount: 140,
      categorySlug: "electronics",
      brandSlug: "dell",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
      ],
      highlights: JSON.stringify([
        "Intel Core i7-1360P 13th Gen",
        "16 GB LPDDR5 | 1 TB NVMe SSD",
        "13.4 inch 4K UHD+ OLED Touch Display",
        "Windows 11 Home + MS Office",
      ]),
    },
    {
      title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Black)",
      slug: "sony-wh-1000xm5-black",
      description: "Industry-leading noise cancellation with two processors and 8 microphones. Exceptional sound quality engineered with Auto NC Optimizer.",
      price: 3499000,
      discountPrice: 2699000,
      discountPercent: 22,
      stock: 45,
      sku: "SONY-XM5-BLK",
      rating: 4.7,
      reviewCount: 1890,
      categorySlug: "electronics",
      brandSlug: "sony",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
      ],
      highlights: JSON.stringify([
        "Industry-leading Noise Cancellation",
        "Up to 30 hours battery life with Quick Charge",
        "Crystal clear hands-free calling with 4 beamforming mics",
      ]),
    },
    {
      title: "boAt Airdopes 141 Bluetooth True Wireless in Ear Earbuds (Bold Black)",
      slug: "boat-airdopes-141-black",
      description: "42H playtime, Beast Mode for real-time audio gaming, ENx Environmental Noise Cancellation tech, ASAP Charge and IPX4 water resistance.",
      price: 449000,
      discountPrice: 129900,
      discountPercent: 71,
      stock: 120,
      sku: "BOAT-AD141-BLK",
      rating: 4.1,
      reviewCount: 8400,
      categorySlug: "electronics",
      brandSlug: "boat",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
      ],
      highlights: JSON.stringify([
        "Up to 42 hours total playback",
        "ENx Technology for clear calls",
        "ASAP Charge: 5 mins charge = 75 mins playtime",
        "IPX4 Sweat and Water Resistance",
      ]),
    },
    {
      title: "Apple Watch Series 9 GPS 45mm (Midnight Aluminium with Sport Band)",
      slug: "apple-watch-series-9-45mm",
      description: "Powerful S9 SiP chip, double tap gesture, brighter display, on-device Siri, and advanced health sensors for ECG and blood oxygen.",
      price: 4490000,
      discountPrice: 3899000,
      discountPercent: 13,
      stock: 40,
      sku: "AW-S9-45-MID",
      rating: 4.8,
      reviewCount: 520,
      categorySlug: "electronics",
      brandSlug: "apple",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      ],
      highlights: JSON.stringify([
        "Magic Double Tap Gesture control",
        "Up to 2000 nits brighter Always-On Retina display",
        "Blood Oxygen & ECG apps included",
      ]),
    },
    {
      title: "Noise ColorFit Pulse 2 Max Smartwatch (1.85 inch Display, Jet Black)",
      slug: "noise-colorfit-pulse-2-max",
      description: "Massive 1.85-inch TFT LCD, Bluetooth calling with Tru Sync technology, 10-day battery life, 100 sports modes and health monitoring suite.",
      price: 599900,
      discountPrice: 149900,
      discountPercent: 75,
      stock: 90,
      sku: "NOISE-CFP2M-BLK",
      rating: 4.2,
      reviewCount: 3100,
      categorySlug: "electronics",
      brandSlug: "noise",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800",
      ],
      highlights: JSON.stringify([
        "1.85 inch bright TFT LCD display",
        "Advanced Bluetooth Calling",
        "100 sports modes + IP68 Water Resistance",
      ]),
    },
    {
      title: "Sony PlayStation 5 Console (Slim Disc Edition)",
      slug: "sony-playstation-5-slim-disc",
      description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.",
      price: 5499000,
      discountPrice: 4999000,
      discountPercent: 9,
      stock: 20,
      sku: "PS5-SLIM-DISC",
      rating: 4.9,
      reviewCount: 1650,
      categorySlug: "electronics",
      brandSlug: "sony",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
      ],
      highlights: JSON.stringify([
        "1 TB Custom Ultra-High Speed SSD",
        "Ray Tracing & 4K-TV Gaming up to 120fps",
        "DualSense Wireless Controller with Haptic Feedback",
      ]),
    },
    {
      title: "Dell 27-inch 4K UHD USB-C Hub Monitor (S2722QC)",
      slug: "dell-27-inch-4k-uhd-monitor",
      description: "Stunning 4K resolution with IPS technology, 65W USB-C power delivery, integrated speakers, and ergonomic height-adjustable stand.",
      price: 4200000,
      discountPrice: 3299900,
      discountPercent: 21,
      stock: 25,
      sku: "DELL-S2722QC-4K",
      rating: 4.5,
      reviewCount: 210,
      categorySlug: "electronics",
      brandSlug: "dell",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
      ],
      highlights: JSON.stringify([
        "3840 x 2160 4K UHD IPS Panel",
        "USB-C Single Cable connectivity with 65W charging",
        "Built-in Dual 3W Waves MaxxAudio speakers",
      ]),
    },

    // --- Appliances (6 products) ---
    {
      title: "LG 55-inch 4K Ultra HD Smart OLED TV (OLED55C3PSA)",
      slug: "lg-55-inch-4k-oled-c3",
      description: "Self-lit OLED pixels for infinite contrast. alpha9 AI Processor 4K Gen6, Dolby Vision & Dolby Atmos, 120Hz refresh rate and 0.1ms response time.",
      price: 16999000,
      discountPrice: 12499000,
      discountPercent: 26,
      stock: 18,
      sku: "LG-OLED55-C3",
      rating: 4.8,
      reviewCount: 390,
      categorySlug: "appliances",
      brandSlug: "lg",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
      ],
      highlights: JSON.stringify([
        "4K Ultra HD (3840 x 2160) OLED Panel",
        "120Hz Refresh Rate with NVIDIA G-Sync & AMD FreeSync",
        "Dolby Vision IQ & Dolby Atmos with 40W 2.2 Ch Audio",
      ]),
    },
    {
      title: "Samsung 653 L Frost Free Side-by-Side Refrigerator with AI Eco (Gentle Silver)",
      slug: "samsung-653l-side-by-side-refrigerator",
      description: "Convertible 5-in-1 mode, SpaceMax technology for more inside space, Digital Inverter with 20-year warranty, and Wi-Fi SmartThings control.",
      price: 11299000,
      discountPrice: 7999000,
      discountPercent: 29,
      stock: 12,
      sku: "SAM-REF-653L-SS",
      rating: 4.6,
      reviewCount: 410,
      categorySlug: "appliances",
      brandSlug: "samsung",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800",
      ],
      highlights: JSON.stringify([
        "653 Litres Capacity for 5+ family members",
        "Digital Inverter Compressor with 20-Year Warranty",
        "Convertible 5-in-1 with SpaceMax Tech",
      ]),
    },
    {
      title: "LG 8.0 Kg 5 Star Inverter Fully Automatic Front Load Washing Machine",
      slug: "lg-8kg-front-load-washing-machine",
      description: "AI DD intelligent fabric protection, Steam wash for 99.9% allergy reduction, 6 Motion Direct Drive, and Smart Diagnosis.",
      price: 4999000,
      discountPrice: 3599000,
      discountPercent: 28,
      stock: 22,
      sku: "LG-WM-8KG-FL",
      rating: 4.5,
      reviewCount: 880,
      categorySlug: "appliances",
      brandSlug: "lg",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800",
      ],
      highlights: JSON.stringify([
        "8.0 Kg Capacity with 1400 RPM spin speed",
        "AI Direct Drive motor with 10-year warranty",
        "Inbuilt Heater with Allergy Care Steam Cycle",
      ]),
    },
    {
      title: "Philips Digital Air Fryer with Rapid Air Technology (4.1 L, Black)",
      slug: "philips-digital-air-fryer-4-1l",
      description: "Fry with up to 90% less fat. Rapid Air Technology for crispy delicious food with minimal oil. Touch screen with 7 presets and keep-warm function.",
      price: 1199500,
      discountPrice: 749900,
      discountPercent: 37,
      stock: 55,
      sku: "PHI-AF-HD9252",
      rating: 4.5,
      reviewCount: 2200,
      categorySlug: "appliances",
      brandSlug: "philips",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800",
      ],
      highlights: JSON.stringify([
        "4.1 Litre basket capacity (up to 4 portions)",
        "Rapid Air Technology for 90% less oil",
        "Digital Touchscreen with 7 pre-set cooking programs",
      ]),
    },
    {
      title: "Samsung 1.5 Ton 5 Star AI Inverter Split AC (WindFree Technology)",
      slug: "samsung-1-5-ton-windfree-ac",
      description: "WindFree cooling gently disperses air through 23,000 micro air holes. 5-star energy rating, 5-in-1 convertible modes, copper anti-bacterial filter.",
      price: 6899000,
      discountPrice: 4399000,
      discountPercent: 36,
      stock: 20,
      sku: "SAM-AC-15T-WF",
      rating: 4.4,
      reviewCount: 560,
      categorySlug: "appliances",
      brandSlug: "samsung",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1614633833026-06201b17b6dc?w=800",
      ],
      highlights: JSON.stringify([
        "1.5 Ton suitable for medium sized rooms (up to 150 sq ft)",
        "5 Star BEE rating with 5.16 ISEER",
        "10-Year Compressor Warranty + Copper condenser",
      ]),
    },
    {
      title: "Philips 1000W Heavy Duty Dry Iron (HD1172)",
      slug: "philips-heavy-duty-dry-iron",
      description: "Speed shaped soleplate for easy gliding. Button groove speeds up ironing along buttons and seams. Non-stick coating soleplate.",
      price: 129500,
      discountPrice: 89900,
      discountPercent: 30,
      stock: 110,
      sku: "PHI-IRON-1000W",
      rating: 4.4,
      reviewCount: 4200,
      categorySlug: "appliances",
      brandSlug: "philips",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
      ],
      highlights: JSON.stringify([
        "1000 Watts powerful heating element",
        "Linished non-stick aluminium soleplate",
        "1.9m cord length for maximum reach",
      ]),
    },

    // --- Fashion (Men & Women) (8 products) ---
    {
      title: "Nike Air Max 270 Men's Running Shoes (Black/White)",
      slug: "nike-air-max-270-black-white",
      description: "Nike's biggest heel Air unit yet delivers a super-soft ride that feels as impossible as it looks. Knit fabric with no-sew overlays for comfort and support.",
      price: 1399500,
      discountPrice: 999900,
      discountPercent: 28,
      stock: 40,
      sku: "NIKE-AM270-BLK",
      rating: 4.6,
      reviewCount: 920,
      categorySlug: "fashion",
      brandSlug: "nike",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800",
      ],
      highlights: JSON.stringify([
        "Large 270 Max Air heel unit for lightweight cushioning",
        "Breathable woven and synthetic fabric on upper",
        "Durable rubber outsole with flex grooves",
      ]),
    },
    {
      title: "Puma Mens Tazon 6 Fracture Running Sneakers (Puma Black)",
      slug: "puma-mens-tazon-6-black",
      description: "Sleek, streamlined silhouette with synthetic leather upper, midfoot saddle for maximum fit and comfort, and EVA heel pod for cushioning.",
      price: 599900,
      discountPrice: 289900,
      discountPercent: 51,
      stock: 65,
      sku: "PUMA-TAZ6-BLK",
      rating: 4.3,
      reviewCount: 1340,
      categorySlug: "fashion",
      brandSlug: "puma",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800",
      ],
      highlights: JSON.stringify([
        "Synthetic leather upper with perforations",
        "TPU shank for increased stability",
        "EVA heel cushioning pod for shock absorption",
      ]),
    },
    {
      title: "Nike Dri-FIT Men's Full Zip Training Hoodie (Charcoal Heather)",
      slug: "nike-dri-fit-training-hoodie",
      description: "Soft French terry fabric with sweat-wicking technology helps keep you warm and dry before, during, and after your workout.",
      price: 399500,
      discountPrice: 279500,
      discountPercent: 30,
      stock: 45,
      sku: "NIKE-HD-DF-CHR",
      rating: 4.5,
      reviewCount: 460,
      categorySlug: "fashion",
      brandSlug: "nike",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800",
      ],
      highlights: JSON.stringify([
        "Dri-FIT technology moves sweat away from your skin",
        "Full front zipper with adjustable drawstring hood",
        "Split kangaroo pocket to store your essentials",
      ]),
    },
    {
      title: "Puma Men's Slim Fit Cotton Crew Neck T-Shirt (Pack of 3)",
      slug: "puma-cotton-tshirt-pack-of-3",
      description: "100% combed cotton jersey t-shirts designed for ultimate everyday comfort and durability. Regular slim fit with iconic Puma Cat logo.",
      price: 299900,
      discountPrice: 129900,
      discountPercent: 56,
      stock: 80,
      sku: "PUMA-TEE-3PK",
      rating: 4.2,
      reviewCount: 1890,
      categorySlug: "fashion",
      brandSlug: "puma",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
      ],
      highlights: JSON.stringify([
        "100% Breathable Combed Cotton",
        "Set of 3 (Black, Navy Blue, Heather Grey)",
        "Ribbed crew neckline and reinforced stitching",
      ]),
    },
    {
      title: "Ray-Ban Aviator Classic Polarized Sunglasses (Gold Frame / Green Lens)",
      slug: "ray-ban-aviator-classic-polarized",
      description: "Timeless style meets cutting-edge polarized lens technology. Originally designed for US aviators in 1937, offering 100% UV protection and exceptional clarity.",
      price: 1159000,
      discountPrice: 899000,
      discountPercent: 22,
      stock: 30,
      sku: "RB-AV-3025-GLD",
      rating: 4.7,
      reviewCount: 620,
      categorySlug: "fashion",
      brandSlug: "apple", // accessories
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
      ],
      highlights: JSON.stringify([
        "100% UV400 Protection with Polarized crystal lenses",
        "Durable lightweight metal frame in classic Gold",
        "Case and microfiber cleaning cloth included",
      ]),
    },
    {
      title: "Fossil Grant Chronograph Navy Blue Dial Men's Leather Watch",
      slug: "fossil-grant-chronograph-leather-watch",
      description: "Vintage-inspired Roman numeral markers meet modern chronograph functionality. Dark navy blue dial paired with a rich luggage leather strap.",
      price: 1399500,
      discountPrice: 799500,
      discountPercent: 42,
      stock: 35,
      sku: "FOS-FS5061-BLU",
      rating: 4.5,
      reviewCount: 840,
      categorySlug: "fashion",
      brandSlug: "boat", // accessories
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
      ],
      highlights: JSON.stringify([
        "44mm stainless steel case with mineral dial window",
        "Genuine leather strap with buckle closure",
        "50m water resistant (swimming and showering)",
      ]),
    },
    {
      title: "Puma Women's Softride Sophia Slip-On Walking Shoes (Rose Gold)",
      slug: "puma-womens-softride-sophia",
      description: "Effortlessly easy slip-on silhouette with plush Softride foam in the midsole for maximum all-day cushioning and stylish metallic accents.",
      price: 499900,
      discountPrice: 249900,
      discountPercent: 50,
      stock: 50,
      sku: "PUMA-SR-W-ROS",
      rating: 4.4,
      reviewCount: 510,
      categorySlug: "fashion",
      brandSlug: "puma",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800",
      ],
      highlights: JSON.stringify([
        "Softride foam midsole for extreme cushioning",
        "Bootie construction for easy entry and snug fit",
        "Zoned rubber outsole pods for traction",
      ]),
    },
    {
      title: "Wildcraft 45L Cargo Laptop Travel Backpack (Black & Teal)",
      slug: "wildcraft-45l-cargo-laptop-backpack",
      description: "Heavy-duty ergonomic travel and campus backpack with dedicated 16-inch padded laptop sleeve, rain cover, and multi-compartment organization.",
      price: 349900,
      discountPrice: 199900,
      discountPercent: 42,
      stock: 70,
      sku: "WILD-BP-45L",
      rating: 4.4,
      reviewCount: 1450,
      categorySlug: "fashion",
      brandSlug: "decathlon",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      ],
      highlights: JSON.stringify([
        "45 Litres spacious capacity with 3 large compartments",
        "Ergonomic padded back with Ventex air channels",
        "Integrated rain cover stored in bottom zip pocket",
      ]),
    },

    // --- Home & Kitchen (6 products) ---
    {
      title: "Prestige Iris Plus 750 Watt Mixer Grinder with 4 Jars (Black)",
      slug: "prestige-iris-plus-750w-mixer-grinder",
      description: "Powerful 750W copper motor, 3 stainless steel jars with transparent lids plus 1 juicer jar with sieve for effortless blending and grinding.",
      price: 619500,
      discountPrice: 329900,
      discountPercent: 46,
      stock: 65,
      sku: "PRES-IRIS-750W",
      rating: 4.3,
      reviewCount: 3800,
      categorySlug: "home-kitchen",
      brandSlug: "prestige",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800",
      ],
      highlights: JSON.stringify([
        "750W heavy-duty copper motor",
        "4 Jars: 1.5L wet, 1.0L dry, 300ml chutney, and Juicer jar",
        "Overload protection with sturdy ergonomic handles",
      ]),
    },
    {
      title: "Prestige Deluxe Alpha Stainless Steel Pressure Cooker (5 Litres)",
      slug: "prestige-deluxe-alpha-pressure-cooker-5l",
      description: "Heavy-gauge Alpha base induction bottom distributes heat evenly. Pressure indicator, durable stainless steel body, and controlled gasket release system.",
      price: 349000,
      discountPrice: 249900,
      discountPercent: 28,
      stock: 80,
      sku: "PRES-CKR-5L",
      rating: 4.5,
      reviewCount: 1650,
      categorySlug: "home-kitchen",
      brandSlug: "prestige",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1584990347449-a2e63cbfa42b?w=800",
      ],
      highlights: JSON.stringify([
        "5 Litres capacity made from premium 304 food-grade steel",
        "Unique Alpha base works on Gas and Induction cooktops",
        "5-Year manufacturer warranty included",
      ]),
    },
    {
      title: "Wakefit Orthopedic Memory Foam Mattress (King Size, 78x72x8 inch)",
      slug: "wakefit-orthopedic-memory-foam-mattress-king",
      description: "Ergonomic pressure relief with Next-Gen Memory Foam and High Resilience support base. Breathable fabric cover and 10-year warranty.",
      price: 2499900,
      discountPrice: 1549900,
      discountPercent: 38,
      stock: 25,
      sku: "WAKE-MAT-KING-8",
      rating: 4.7,
      reviewCount: 2900,
      categorySlug: "home-kitchen",
      brandSlug: "prestige",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
      ],
      highlights: JSON.stringify([
        "King Size (78 x 72 inches, 8 inches thickness)",
        "Spine support orthopedic foam zoned for body contours",
        "100-night risk-free trial + 10-Year manufacturer warranty",
      ]),
    },
    {
      title: "Solimo Premium Stainless Steel 3-Tier Kitchen Trolley with Wheels",
      slug: "solimo-stainless-steel-3-tier-kitchen-trolley",
      description: "High-grade stainless steel construction with 3 spacious baskets for vegetables, fruits, and pantry storage. 360-degree lockable swivel caster wheels.",
      price: 249900,
      discountPrice: 139900,
      discountPercent: 44,
      stock: 60,
      sku: "SOL-TRL-3T",
      rating: 4.3,
      reviewCount: 980,
      categorySlug: "home-kitchen",
      brandSlug: "prestige",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800",
      ],
      highlights: JSON.stringify([
        "100% Rust-proof chrome finished stainless steel",
        "3 Spacious baskets each holding up to 10kg load",
        "Smooth-rolling 360-degree wheels with safety lock",
      ]),
    },
    {
      title: "Philips Hue Smart LED Bulb Starter Kit (E27, 16 Million Colors)",
      slug: "philips-hue-smart-bulb-starter-kit",
      description: "Set the mood with millions of colors and shades of white. Sync with music, movies, and games. Control with voice via Alexa and Google Assistant.",
      price: 899900,
      discountPrice: 599900,
      discountPercent: 33,
      stock: 35,
      sku: "PHI-HUE-KIT",
      rating: 4.6,
      reviewCount: 420,
      categorySlug: "home-kitchen",
      brandSlug: "philips",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
      ],
      highlights: JSON.stringify([
        "Includes 3 E27 10W Smart Bulbs + Hue Bridge Hub",
        "16 Million Colors + tunable warm-to-cool white",
        "Voice compatible with Alexa, Google Assistant & Apple HomeKit",
      ]),
    },
    {
      title: "Milton Thermosteel Flip Lid Insulated Stainless Steel Flask (1000 ml)",
      slug: "milton-thermosteel-flask-1000ml",
      description: "Double-walled vacuum insulated flask keeps liquids hot or cold for 24 hours. Leak-proof flip lid with jacket for travel convenience.",
      price: 119900,
      discountPrice: 79900,
      discountPercent: 33,
      stock: 120,
      sku: "MILT-TS-1000",
      rating: 4.6,
      reviewCount: 5400,
      categorySlug: "home-kitchen",
      brandSlug: "prestige",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
      ],
      highlights: JSON.stringify([
        "1000 ml Capacity made with 18/8 grade stainless steel",
        "Copper coating for superior 24-hour temperature retention",
        "Fabric thermal carrying pouch included",
      ]),
    },

    // --- Beauty & Grooming (6 products) ---
    {
      title: "Philips Series 3000 Cordless Beard & Stubble Trimmer (QT4011/15)",
      slug: "philips-series-3000-beard-trimmer",
      description: "Titanium coated self-sharpening blades with 20 length settings from 0.5mm to 10mm. 90 minutes of cordless use after 1 hour charge.",
      price: 249500,
      discountPrice: 179900,
      discountPercent: 27,
      stock: 75,
      sku: "PHI-TRM-3000",
      rating: 4.5,
      reviewCount: 6200,
      categorySlug: "beauty-grooming",
      brandSlug: "philips",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800",
      ],
      highlights: JSON.stringify([
        "Titanium coated rounded skin-friendly blades",
        "20 Lock-in length settings (0.5mm to 10mm with 0.5mm precision)",
        "90 mins cordless use with Fast 1-hour USB charge",
      ]),
    },
    {
      title: "L'Oreal Paris Revitalift 1.5% Hyaluronic Acid Serum (30 ml)",
      slug: "loreal-paris-revitalift-hyaluronic-acid-serum",
      description: "Our highest concentration of Hyaluronic Acid for intensely hydrated, radiant and youthful-looking skin. Reduces fine lines by 60%.",
      price: 99900,
      discountPrice: 69900,
      discountPercent: 30,
      stock: 110,
      sku: "LOR-HA-SER-30",
      rating: 4.6,
      reviewCount: 4800,
      categorySlug: "beauty-grooming",
      brandSlug: "loreal",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
      ],
      highlights: JSON.stringify([
        "1.5% Pure Micro & Macro Hyaluronic Acid formula",
        "Ultra-lightweight non-greasy fast absorbing texture",
        "Dermatologically tested and suitable for all skin types",
      ]),
    },
    {
      title: "L'Oreal Professionnel Serie Expert Absolut Repair Hair Mask (250 ml)",
      slug: "loreal-absolut-repair-hair-mask",
      description: "Infused with Gold Quinoa and Protein, deeply nourishes damaged hair fibers, leaving hair softer, shinier and revitalized.",
      price: 95000,
      discountPrice: 79900,
      discountPercent: 15,
      stock: 90,
      sku: "LOR-AR-MASK-250",
      rating: 4.5,
      reviewCount: 2100,
      categorySlug: "beauty-grooming",
      brandSlug: "loreal",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800",
      ],
      highlights: JSON.stringify([
        "Gold Quinoa + Wheat Protein restorative treatment",
        "Reduces surface damage by 77% and brings 7x shinier hair",
        "Salon-grade deep nourishing rinse-out mask",
      ]),
    },
    {
      title: "Philips Hair Dryer with MoistureProtect Sensor (2100W, HP8280)",
      slug: "philips-moistureprotect-hair-dryer",
      description: "MoistureProtect sensor diagnoses your hair 30 times per second and adapts the temperature to preserve your hair's natural hydration.",
      price: 499500,
      discountPrice: 349900,
      discountPercent: 30,
      stock: 40,
      sku: "PHI-HD-2100W",
      rating: 4.6,
      reviewCount: 890,
      categorySlug: "beauty-grooming",
      brandSlug: "philips",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      ],
      highlights: JSON.stringify([
        "2100W salon-strength drying power",
        "Ionic conditioning for shiny, frizz-free hair",
        "ThermoProtect temperature control with 6 heat/speed settings",
      ]),
    },
    {
      title: "Skinn by Titan Raw Perfume for Men EDP (100 ml)",
      slug: "skinn-titan-raw-perfume-men-100ml",
      description: "An intoxicating blend of citrus notes, floral whispers and warm woods. Bold, fresh, masculine and distinctly captivating for all occasions.",
      price: 249500,
      discountPrice: 199500,
      discountPercent: 20,
      stock: 60,
      sku: "SKN-RAW-EDP-100",
      rating: 4.4,
      reviewCount: 1400,
      categorySlug: "beauty-grooming",
      brandSlug: "loreal",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
      ],
      highlights: JSON.stringify([
        "Eau de Parfum (EDP) with long-lasting 8+ hours sillage",
        "Top Notes: Bergamot, Mandarin, Watermelon",
        "Base Notes: Patchouli, Indonesian Woods, White Musk",
      ]),
    },
    {
      title: "Maybelline New York Colossal Waterproof Mascara (Black, 10 ml)",
      slug: "maybelline-colossal-waterproof-mascara",
      description: "Mega volume in an instant. Collagen-infused formula with the mega brush plumps lashes up to 9x volume without any clumps.",
      price: 44900,
      discountPrice: 31900,
      discountPercent: 29,
      stock: 140,
      sku: "MAY-COL-MASC",
      rating: 4.4,
      reviewCount: 3900,
      categorySlug: "beauty-grooming",
      brandSlug: "loreal",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800",
      ],
      highlights: JSON.stringify([
        "9x Volume without clumps",
        "Ophthalmologist tested, safe for contact lens wearers",
        "100% Waterproof and smudge-resistant formula",
      ]),
    },

    // --- Toys & Baby Care (6 products) ---
    {
      title: "Lego Classic Medium Creative Brick Box Building Kit (484 Pieces, 10696)",
      slug: "lego-classic-medium-brick-box-484pcs",
      description: "Designed with builders of all ages in mind, this collection of LEGO bricks in 35 different colors encourages open-ended building play.",
      price: 349900,
      discountPrice: 269900,
      discountPercent: 22,
      stock: 45,
      sku: "LEGO-10696-484",
      rating: 4.8,
      reviewCount: 1560,
      categorySlug: "toys-baby",
      brandSlug: "lego",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800",
      ],
      highlights: JSON.stringify([
        "484 Pieces in 35 bright colorful LEGO shades",
        "Includes 18 tires and wheel rims plus windows and toy eyes",
        "Comes in a handy sturdy plastic storage tub",
      ]),
    },
    {
      title: "Lego Technic Bugatti Bolide Racing Car Model Building Toy (905 Pieces)",
      slug: "lego-technic-bugatti-bolide-905pcs",
      description: "Inspire kids to build their own racing sports car with working W16 engine, steering, scissor doors, and authentic yellow-and-black livery.",
      price: 549900,
      discountPrice: 429900,
      discountPercent: 21,
      stock: 30,
      sku: "LEGO-TECH-BUG",
      rating: 4.9,
      reviewCount: 780,
      categorySlug: "toys-baby",
      brandSlug: "lego",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800",
      ],
      highlights: JSON.stringify([
        "905-piece advanced Lego Technic building challenge",
        "Working W16 engine and functional steering wheels",
        "Scissor opening doors inspired by the real hypercar",
      ]),
    },
    {
      title: "Fisher-Price Kick & Play Piano Gym with Smart Stages (Multicolor)",
      slug: "fisher-price-kick-play-piano-gym",
      description: "4 ways to play as baby grows: Lay & play, Tummy time, Sit & play, and Take along. Smart Stages technology with music, lights and phrases.",
      price: 399900,
      discountPrice: 289900,
      discountPercent: 27,
      stock: 50,
      sku: "FP-GYM-KICK",
      rating: 4.7,
      reviewCount: 1950,
      categorySlug: "toys-baby",
      brandSlug: "lego",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800",
      ],
      highlights: JSON.stringify([
        "Soft machine-washable play mat with loops for toys",
        "5 Light-up piano keys with 65+ songs and learning phrases",
        "5 Repositionable activity toys including self-discovery mirror",
      ]),
    },
    {
      title: "Remote Controlled 4WD High Speed Rock Crawler Monster Truck (1:16 Scale)",
      slug: "rc-4wd-rock-crawler-monster-truck",
      description: "All-terrain remote controlled crawler with independent suspension shocks, anti-skid rubber tires and 2.4 GHz interference-free controller.",
      price: 299900,
      discountPrice: 149900,
      discountPercent: 50,
      stock: 65,
      sku: "RC-TRK-4WD-16",
      rating: 4.3,
      reviewCount: 890,
      categorySlug: "toys-baby",
      brandSlug: "decathlon",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800",
      ],
      highlights: JSON.stringify([
        "1:16 Full Scale 4WD High Torque Motor",
        "Dual rechargeable battery packs included for 40 mins playtime",
        "Heavy-duty metal alloy chassis and shock absorbers",
      ]),
    },
    {
      title: "Hasbro Monopoly Deluxe Edition Board Game with Wooden Houses",
      slug: "hasbro-monopoly-deluxe-edition",
      description: "The classic fast-dealing property trading game. Buy, sell, dream and scheme your way to riches with deluxe golden tokens and banker tray.",
      price: 199900,
      discountPrice: 139900,
      discountPercent: 30,
      stock: 75,
      sku: "HAS-MONO-DLX",
      rating: 4.7,
      reviewCount: 2200,
      categorySlug: "toys-baby",
      brandSlug: "lego",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800",
      ],
      highlights: JSON.stringify([
        "Classic family strategy board game for 2 to 8 players",
        "Includes special golden finish die-cast tokens",
        "Heavy duty folding board with currency sorting tray",
      ]),
    },
    {
      title: "Pampers Premium Care Pants Diapers (Large, 64 Count)",
      slug: "pampers-premium-care-pants-large-64",
      description: "Cotton-like softness with 360-degree air channels for breathable dryness. Lotion with Aloe Vera to protect baby's delicate skin from rashes.",
      price: 169900,
      discountPrice: 124900,
      discountPercent: 26,
      stock: 150,
      sku: "PAMP-PREM-L64",
      rating: 4.6,
      reviewCount: 5800,
      categorySlug: "toys-baby",
      brandSlug: "loreal",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800",
      ],
      highlights: JSON.stringify([
        "Up to 12 hours night-long leak lock protection",
        "Wetness indicator turns from yellow to blue when it is time",
        "Made with ultra-soft breathable materials",
      ]),
    },

    // --- Sports & Fitness (6 products) ---
    {
      title: "Domyos by Decathlon 20 kg Cast Iron Adjustable Dumbbell & Barbell Set",
      slug: "decathlon-20kg-cast-iron-dumbbell-set",
      description: "Versatile set for weight training at home. Includes threaded bars, spinlock collars, and cast iron plates in a durable compact carry case.",
      price: 499900,
      discountPrice: 349900,
      discountPercent: 30,
      stock: 35,
      sku: "DEC-DB-20KG",
      rating: 4.7,
      reviewCount: 1420,
      categorySlug: "sports-fitness",
      brandSlug: "decathlon",
      isDealOfTheDay: true,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800",
      ],
      highlights: JSON.stringify([
        "Includes 2 threaded bars (2kg each) + 12 cast iron weight plates",
        "Spinlock collars for quick and secure plate changes",
        "Compact heavy duty carrying suitcase included",
      ]),
    },
    {
      title: "Decathlon Riverside 120 Hybrid 8-Speed Bicycle (Grey)",
      slug: "decathlon-riverside-120-hybrid-cycle",
      description: "Optimized frame geometry for road and trail. 8 indexed speeds with single chainring for simple shifting, ergonomic saddle and all-terrain tires.",
      price: 1499900,
      discountPrice: 1199900,
      discountPercent: 20,
      stock: 20,
      sku: "DEC-RIV-120-GRY",
      rating: 4.6,
      reviewCount: 890,
      categorySlug: "sports-fitness",
      brandSlug: "decathlon",
      isDealOfTheDay: false,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800",
      ],
      highlights: JSON.stringify([
        "Lifetime warranty on steel frame, rigid fork, and handlebar",
        "BTWIN 8-speed indexed derailleur with grip shifter",
        "Puncture-resistant hybrid 700x38 tires",
      ]),
    },
    {
      title: "Nivia Storm Football (Size 5, Rubberized Molded - White/Black)",
      slug: "nivia-storm-football-size-5",
      description: "Top-grade rubber outer material suitable for hard grounds, turf and wet surfaces. 32-panel stitched construction for true flight and control.",
      price: 69900,
      discountPrice: 44900,
      discountPercent: 35,
      stock: 120,
      sku: "NIV-STRM-SZ5",
      rating: 4.4,
      reviewCount: 3100,
      categorySlug: "sports-fitness",
      brandSlug: "decathlon",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
      ],
      highlights: JSON.stringify([
        "Official Match Size 5 (Senior 12+ years)",
        "Durable rubberized molded cover resistant to rough grounds",
        "High air-retention butyl bladder",
      ]),
    },
    {
      title: "Boldfit TPE Yoga Mat for Men & Women with Alignment Lines (6mm, Teal)",
      slug: "boldfit-tpe-yoga-mat-6mm",
      description: "Eco-friendly non-slip TPE material with laser-engraved alignment lines. Provides optimum 6mm cushioning for joints, knees and spine.",
      price: 249900,
      discountPrice: 119900,
      discountPercent: 52,
      stock: 85,
      sku: "BOLD-YOGA-6MM",
      rating: 4.5,
      reviewCount: 2600,
      categorySlug: "sports-fitness",
      brandSlug: "decathlon",
      isDealOfTheDay: true,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
      ],
      highlights: JSON.stringify([
        "6mm thick high-density anti-tear TPE foam",
        "Body alignment laser guide marks for proper posture",
        "Waterproof, sweat-resistant with carry strap included",
      ]),
    },
    {
      title: "Yonex Muscle Power 29 Lite Carbon Graphite Badminton Racquet (G4)",
      slug: "yonex-muscle-power-29-lite-badminton-racquet",
      description: "Isometric square head shape expands the sweet spot. Muscle Power frame locates the string on rounded archways that eliminate stress concentration.",
      price: 369000,
      discountPrice: 229900,
      discountPercent: 37,
      stock: 60,
      sku: "YNX-MP29-LITE",
      rating: 4.5,
      reviewCount: 1850,
      categorySlug: "sports-fitness",
      brandSlug: "decathlon",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
      ],
      highlights: JSON.stringify([
        "Weight: 85g (3U) with G4 grip size",
        "High Modulus Carbon Graphite shaft and head",
        "Pre-strung with Yonex BG65 string up to 24-30 lbs",
      ]),
    },
    {
      title: "Decathlon Kiprun GPS Running Watch with Heart Rate Monitor (Black)",
      slug: "decathlon-kiprun-gps-running-watch",
      description: "Built-in GPS with wrist heart rate sensor. Tracks pace, distance, elevation, intervals, and syncs directly with Strava and Apple Health.",
      price: 799900,
      discountPrice: 549900,
      discountPercent: 31,
      stock: 30,
      sku: "DEC-KIP-GPS-500",
      rating: 4.4,
      reviewCount: 340,
      categorySlug: "sports-fitness",
      brandSlug: "decathlon",
      isDealOfTheDay: false,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=800",
      ],
      highlights: JSON.stringify([
        "Instant GPS fix with 8-hour workout battery life",
        "Wrist-based optical heart rate and calorie counter",
        "50m water resistant (5 ATM) with Strava auto-export",
      ]),
    },
  ];

  const createdProducts: any[] = [];
  for (const item of productsList) {
    const { categorySlug, brandSlug, images, ...rest } = item;
    const categoryId = categories[categorySlug]?.id;
    const brandId = brands[brandSlug]?.id;

    if (!categoryId || !brandId) {
      console.warn(`Category or Brand not found for: ${item.title}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        ...rest,
        categoryId,
        brandId,
        images: {
          create: images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
            altText: `${item.title} image ${idx + 1}`,
          })),
        },
      },
    });
    createdProducts.push(product);
  }
  console.log(`Created ${createdProducts.length} products!`);

  // 6. Rahul's sample cart
  console.log("Creating sample cart for Rahul...");
  const rahulCart = await prisma.cart.create({
    data: {
      userId: rahul.id,
      items: {
        create: [
          {
            productId: createdProducts[0].id, // iPhone 15
            quantity: 1,
          },
          {
            productId: createdProducts[11].id, // boAt Airdopes
            quantity: 2,
          },
        ],
      },
    },
  });

  // 7. Seed Sample Orders with realistic snapshot items and status
  console.log("Creating sample orders for Rahul and Priya...");
  const order1Total = createdProducts[0].discountPrice * 1;
  const order1 = await prisma.order.create({
    data: {
      orderNumber: `OD${Date.now()}-1001`,
      userId: rahul.id,
      addressId: rahulHomeAddress.id,
      shippingAddress: JSON.stringify({
        name: rahulHomeAddress.name,
        phone: rahulHomeAddress.phone,
        street: rahulHomeAddress.street,
        locality: rahulHomeAddress.locality,
        city: rahulHomeAddress.city,
        state: rahulHomeAddress.state,
        pincode: rahulHomeAddress.pincode,
        landmark: rahulHomeAddress.landmark,
      }),
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.RAZORPAY,
      subtotal: createdProducts[0].price,
      discount: createdProducts[0].price - createdProducts[0].discountPrice,
      deliveryCharge: 0,
      totalAmount: order1Total,
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            title: createdProducts[0].title,
            image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
            price: createdProducts[0].discountPrice,
            mrp: createdProducts[0].price,
            quantity: 1,
            total: createdProducts[0].discountPrice,
          },
        ],
      },
      payments: {
        create: [
          {
            provider: "RAZORPAY",
            razorpayOrderId: "order_mock_test_1001",
            razorpayPaymentId: "pay_mock_test_1001",
            razorpaySignature: "sig_mock_verified_1001",
            amount: order1Total,
            status: PaymentStatus.COMPLETED,
          },
        ],
      },
    },
  });

  // 8. Sample Reviews (verified purchase)
  console.log("Creating verified customer reviews...");
  await prisma.review.create({
    data: {
      userId: rahul.id,
      productId: createdProducts[0].id,
      rating: 5,
      title: "Incredible phone, buttery smooth camera & display!",
      comment: "Switched from Android to iPhone 15 and the experience has been seamless. The Dynamic Island is super handy, and battery life easily lasts full 1.5 days. Delivered in 24 hours by ShopKart!",
      isVerifiedPurchase: true,
    },
  });

  await prisma.review.create({
    data: {
      userId: priya.id,
      productId: createdProducts[11].id, // boAt Airdopes
      rating: 4,
      title: "Value for money earbuds!",
      comment: "Super punchy bass and the battery truly lasts over 40 hours with the case. Great for workouts and calling.",
      isVerifiedPurchase: true,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("Admin credentials: admin@shopkart.com / Admin@123");
  console.log("Customer 1: rahul@gmail.com / Customer@123");
  console.log("Customer 2: priya@gmail.com / Customer@123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
