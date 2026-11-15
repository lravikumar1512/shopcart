# ShopKart 🛍️ — Production-Grade Flipkart-Style E-Commerce Platform

ShopKart is a modern, high-performance, full-stack e-commerce web application inspired by Flipkart. Built with Next.js 14+ (App Router, Server Components & Server Actions), TypeScript, PostgreSQL with Prisma ORM, Tailwind CSS, secure JWT authentication with httpOnly cookies, and a swappable payment architecture with Razorpay (INR) and Cash on Delivery (COD).

---

## 📑 Table of Contents
- [Tech Stack](#-tech-stack)
- [Architecture & Diagrams](#-architecture--diagrams)
  - [Entity-Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
  - [Razorpay Payment Lifecycle](#razorpay-payment-lifecycle)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Database Setup & Seeding](#database-setup--seeding)
  - [Starting the Application](#starting-the-application)
- [Default Demo Credentials](#-default-demo-credentials)
- [Razorpay Setup & Test Credentials](#-razorpay-setup--test-credentials)
- [API Documentation](#-api-documentation)
- [Unit Testing](#-unit-testing)
- [Security Implementations](#-security-implementations)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14+ (App Router, React 18, TypeScript) |
| **Styling** | Tailwind CSS (Custom Flipkart theme: `#2874f0`, `#ff9f00`, `#fb641b`) |
| **Database & ORM** | PostgreSQL & SQLite with Prisma ORM |
| **Authentication** | JWT (Signed HS256, stored in `httpOnly` secure cookies), bcryptjs (cost factor 12) |
| **Payments** | Razorpay (Primary gateway with HMAC-SHA256 verification), Stripe-ready interface, Cash on Delivery |
| **State Management** | TanStack React Query (Server state), Zustand (Cart UI & guest persistence) |
| **Validation** | Zod schemas for all API route payloads and user input |
| **Invoice Engine** | jsPDF (Client-side professional tax invoice generator) |
| **Testing** | Vitest unit test suite (Cart calculations, delivery tiers, stock validation, cryptographic verification) |

---

## 🏗 Architecture & Diagrams

### Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Address : "has"
    User ||--o| Cart : "owns"
    User ||--o{ Order : "places"
    User ||--o{ Review : "writes"

    Category ||--o{ Category : "subCategories"
    Category ||--o{ Product : "contains"
    Brand ||--o{ Product : "manufactures"

    Product ||--o{ ProductImage : "has"
    Product ||--o{ ProductVariant : "has"
    Product ||--o{ CartItem : "in"
    Product ||--o{ OrderItem : "ordered_in"
    Product ||--o{ Review : "reviewed_by"

    Cart ||--o{ CartItem : "contains"

    Order ||--o{ OrderItem : "contains"
    Order ||--o{ Payment : "has"
    Order }o--|| Address : "delivered_to"

    User {
        string id PK
        string email UK
        string name
        string password
        enum role "CUSTOMER | ADMIN"
        string phone
    }

    Address {
        string id PK
        string userId FK
        string name
        string phone
        string street
        string city
        string state
        string pincode
        enum addressType "HOME | WORK | OTHER"
        boolean isDefault
    }

    Product {
        string id PK
        string title
        string slug UK
        int price "MRP in paise"
        int discountPrice "Selling in paise"
        int discountPercent
        int stock
        float rating
        int reviewCount
        string categoryId FK
        string brandId FK
        boolean isFeatured
        boolean isDealOfTheDay
    }

    Cart {
        string id PK
        string userId FK
    }

    CartItem {
        string id PK
        string cartId FK
        string productId FK
        int quantity
    }

    Order {
        string id PK
        string orderNumber UK
        string userId FK
        string addressId FK
        string shippingAddress "JSON snapshot"
        int totalAmount "in paise"
        int subtotal "in paise"
        int discount "in paise"
        int deliveryCharge "in paise"
        enum status "PLACED|PAID|PACKED|SHIPPED|DELIVERED|CANCELLED|REFUNDED"
        enum paymentMethod "RAZORPAY|COD|STRIPE"
    }

    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        string title "Snapshot"
        int price "Snapshot paise"
        int mrp "Snapshot paise"
        int quantity
        int total "in paise"
    }

    Payment {
        string id PK
        string orderId FK
        string provider "RAZORPAY | COD | STRIPE"
        string razorpayOrderId
        string razorpayPaymentId
        string razorpaySignature
        int amount "in paise"
        enum status "PENDING|COMPLETED|FAILED|REFUNDED"
    }

    Review {
        string id PK
        string userId FK
        string productId FK
        int rating "1 to 5"
        string title
        string comment
        boolean isVerifiedPurchase
    }
```

---

### Razorpay Payment Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Browser)
    participant Client as Next.js Client
    participant Server as ShopKart API
    participant DB as Database (Prisma)
    participant RZP as Razorpay Gateway

    Customer->>Client: Clicks "PLACE ORDER"
    Client->>Server: POST /api/orders (addressId, method=RAZORPAY)
    Note over Server: Server reads cart from DB<br/>Recalculates price & validates stock
    Server->>RZP: Create Order (amount in paise, INR, receipt)
    RZP-->>Server: Return razorpay_order_id
    Server->>DB: Create Order (PLACED) & Payment (PENDING)
    Server-->>Client: { order, razorpayOrder, keyId }
    Client->>RZP: Open Razorpay Checkout modal
    Customer->>RZP: Enters Card / UPI / NetBanking details
    RZP-->>Client: Returns { razorpay_payment_id, razorpay_signature }
    Client->>Server: POST /api/payments/verify (orderId, rzpOrderId, rzpPayId, signature)
    Note over Server: Computes HMAC-SHA256 signature<br/>crypto.createHmac(secret).update(order_id + '|' + pay_id)
    alt Signature Matches & Valid
        Server->>DB: Interactive Transaction:<br/>1. Check idempotency<br/>2. Decrement product stock<br/>3. Payment status -> COMPLETED<br/>4. Order status -> PAID<br/>5. Clear user cart
        Server-->>Client: { success: true, order }
        Client-->>Customer: Redirect to /orders/[id] with confetti
    else Signature Invalid
        Server->>DB: Payment status -> FAILED
        Server-->>Client: 400 Bad Request
    end
```

---

## 🚀 Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **Token Security:** Signed JSON Web Token (JWT) in HTTP-only, SameSite=Lax, Secure cookie.
- **Passwords:** Hashed with bcrypt cost 12.
- **Roles:** `CUSTOMER` and `ADMIN`.
- **Middleware Protection:** Route guards for `/admin/*`, `/checkout`, `/orders`, `/account`.
- **Brute Force Protection:** In-memory sliding-window rate limiting on `/api/auth/login` and `/api/auth/register`.

### 2. High-Fidelity Flipkart Storefront
- **Home Page:** Hero banner carousel, horizontal category strip, "Deals of the Day" with countdown timer, and featured products.
- **Product Listing:** Debounced search, multi-faceted filtering (categories, brands, price range slider, ratings 4+ stars, in-stock only), sorting (Relevance, Price Low to High, Price High to Low, Newest, Popularity), and pagination.
- **Product Details:** Multi-image gallery with zoom/thumbnail selector, discount percentage badge, Flipkart Assured tag, bank offers strip, highlights list, specifications key-value table, stock warnings, and verified customer reviews.

### 3. Smart Cart & Multi-Device Persistence
- Persisted in PostgreSQL database for authenticated users.
- Guest cart stored in `localStorage` with automatic server synchronization and stock revalidation upon login.
- Flipkart delivery fee policy: **FREE delivery** for orders ₹500 and above, otherwise ₹40 delivery fee.

### 4. Checkout & Financial Calculations
- **Address Management:** Add, edit, delete, and set default delivery address.
- **Tamper-Proof Pricing:** Final charges computed strictly server-side from database prices.
- **Payment Options:**
  - **Razorpay (INR):** HMAC-SHA256 verification, webhook processing, sandbox test simulator.
  - **Cash on Delivery (COD):** Direct transactional stock decrement upon order confirmation.

### 5. Orders & Post-Purchase Services
- Comprehensive order history with status timeline: `PLACED` ➔ `PAID` ➔ `PACKED` ➔ `SHIPPED` ➔ `DELIVERED`.
- Self-service **Order Cancellation** before shipping with automated inventory restoration and Razorpay refund trigger.
- **Invoice Download:** Generates professional tax invoice PDF using `jsPDF`.

### 6. Verified Customer Reviews
- Restricted strictly to buyers who have purchased and paid for the item.
- Automatic recalculation of product average rating upon submission.

### 7. Administrative Backoffice (`/admin`)
- **Executive Overview:** Real-time Gross Sales (₹), today's order count, registered customers, 30-day interactive sales chart, and low-stock alerts.
- **Product Management:** Full CRUD catalog, price modifiers, stock editing, and image URL assignments.
- **Order Management:** Status transition controls (`PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`), Razorpay refund dispatch.
- **Customer Insights:** User listing with lifetime orders and gross spend.
- **Banner Engine:** Hero banner carousel management.

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database (or use built-in SQLite development configuration)

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Review or edit `.env`:
```env
# Database connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shopkart?schema=public"

# Auth / JWT
JWT_SECRET="shopkart-super-secret-jwt-key-min-32-chars-long-random-string-2024"
JWT_EXPIRES_IN="7d"

# Razorpay Test Mode Credentials
RAZORPAY_KEY_ID="rzp_test_shopkart12345"
RAZORPAY_KEY_SECRET="shopkart_secret_key_mock_123456"
RAZORPAY_WEBHOOK_SECRET="shopkart_webhook_secret_12345"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_shopkart12345"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Database Setup & Seeding

```bash
# Install dependencies
npm install

# For zero-setup local SQLite development (pre-configured)
npm run prisma:push
npm run prisma:seed

# OR for PostgreSQL (when PostgreSQL server is running)
npm run prisma:push:pg
npm run prisma:seed
```

### Starting the Application

```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Default Demo Credentials

The seed script creates the following pre-configured accounts:

| Role | Email | Password | Pre-loaded Data |
|---|---|---|---|
| **ADMIN** | `admin@shopkart.com` | `Admin@123` | Full dashboard access, product & order management |
| **CUSTOMER 1** | `rahul@gmail.com` | `Customer@123` | Saved Bengaluru addresses, sample orders, active cart |
| **CUSTOMER 2** | `priya@gmail.com` | `Customer@123` | Saved Mumbai address, verified reviews |

> *Tip: The login page includes 1-click quick-fill buttons for both Admin and Customer!*

---

## 💳 Razorpay Setup & Test Credentials

### Using Razorpay Test Mode
1. Sign up at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Switch to **Test Mode** in the dashboard toggle.
3. Navigate to **Settings ➔ API Keys ➔ Generate Key**.
4. Copy `Key Id` and `Key Secret` to your `.env` file:
   ```env
   RAZORPAY_KEY_ID="rzp_test_YourKeyId"
   RAZORPAY_KEY_SECRET="YourKeySecret"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YourKeyId"
   ```

### Test Payment Instruments (Razorpay Sandbox)
When testing Razorpay checkout:

| Method | Test Details |
|---|---|
| **Test Card (Success)** | `4111 1111 1111 1111`, Any future expiry (e.g. `12/28`), CVV `123`, OTP `123456` |
| **Test Card (Failure)** | `4000 0000 0000 0002` |
| **Test UPI** | `success@razorpay` |
| **Test NetBanking** | Select **HDFC** or **ICICI** and choose "Success" on test gateway page |

> *Note: In test or dev mode, the checkout dialog also provides an instant "Simulate Successful Payment" button to test server-side HMAC validation and database transaction decrement without network delays.*

---

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Create new customer account.
- `POST /api/auth/login` - Authenticate user, receive signed JWT in httpOnly cookie.
- `POST /api/auth/logout` - Clear authentication cookie.
- `GET /api/auth/me` - Retrieve current session and profile.

### Catalog & Products
- `GET /api/products` - Filter, search and paginate products.
  - Params: `q`, `category`, `brand`, `minPrice`, `maxPrice`, `minRating`, `inStock`, `sort`, `page`, `limit`
- `GET /api/products/[slug]` - Retrieve product details and reviews.
- `GET /api/categories` - Retrieve category tree and brand directory.

### Cart
- `GET /api/cart` - Retrieve current user's cart summary and totals.
- `POST /api/cart` - Add item (`productId`, `quantity`) with stock check.
- `PUT /api/cart` - Update quantity or remove if quantity is 0.
- `DELETE /api/cart?productId=...` - Remove item or clear cart.
- `POST /api/cart/merge` - Merge guest items into account cart.

### Addresses
- `GET /api/addresses` - List customer saved addresses.
- `POST /api/addresses` - Save new delivery address.
- `PUT /api/addresses/[id]` - Edit address or set as default.
- `DELETE /api/addresses/[id]` - Remove address.

### Orders & Payments
- `GET /api/orders` - List customer's orders.
- `POST /api/orders` - Create order (`addressId`, `paymentMethod: "RAZORPAY" | "COD"`).
- `GET /api/orders/[id]` - Get order timeline, items, and shipping status.
- `PUT /api/orders/[id]` - Cancel order (`{ action: "cancel" }`).
- `POST /api/payments/verify` - HMAC SHA256 verification and atomic inventory decrement.
- `POST /api/payments/webhook` - Razorpay webhook listener for `payment.captured` & `payment.failed`.

### Reviews
- `POST /api/reviews` - Submit rating (1-5) and comment (Verified buyers only).

### Admin (`/api/admin/*`)
- `GET /api/admin/overview` - KPI metrics, low-stock warnings, 30-day sales volume.
- `GET /api/admin/products` - Admin product catalog.
- `POST /api/admin/products` - Create product.
- `PUT /api/admin/products/[id]` - Update product price, stock, images.
- `DELETE /api/admin/products/[id]` - Remove product.
- `GET /api/admin/orders` - Filtered orders listing.
- `PUT /api/admin/orders/[id]` - Update fulfillment status or issue Razorpay refund.
- `GET /api/admin/users` - Customer accounts list and lifetime spend.
- `GET /api/admin/banners` - Banners list.
- `POST /api/admin/banners` - Add carousel banner.
- `DELETE /api/admin/banners?id=...` - Remove banner.

---

## 🧪 Unit Testing

Run the Vitest test suite:
```bash
npm test
```

Test coverage includes:
- Razorpay HMAC SHA256 cryptographic signature calculation and verification.
- Tampered signature rejection.
- Cart subtotal, discount, and ₹500 free-delivery threshold calculations.
- Stock availability and out-of-stock validation rules.
- Bcrypt cost-12 hashing and JWT payload integrity.

---

## 🛡️ Security Implementations
- **HTTP-Only Cookies:** Tokens cannot be read by JavaScript (mitigating XSS).
- **Server-Side Price Calculation:** Client never sends prices; prices are fetched and multiplied directly from the database inside server transactions.
- **Cryptographic Timing-Safe Comparison:** `crypto.timingSafeEqual` prevents timing attacks on HMAC payment and webhook signatures.
- **Ownership Verification:** Users can only view or cancel their own orders and addresses.
- **Database Transactions:** Product stock updates and payment status changes execute within isolated atomic transactions (`db.$transaction`).
- **HTTP Security Headers:** X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy configured via Next.js headers.
