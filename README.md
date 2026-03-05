# 🎫 Coupon Marketplace — Full Stack

> A full-stack digital marketplace for coupon-based products, featuring a customer-facing shop, a protected Admin Dashboard, and a Reseller API for third-party integrations.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#️-configuration-environment-variables)
- [Backend Architecture](#️-backend-architecture)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [Business Logic & Rules](#-business-logic--rules)
- [Security Model](#-security-model)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)

---

## 🌟 Overview

Coupon Marketplace is a full-stack web application that allows:

- **Customers** to browse and purchase digital coupon codes via a clean storefront.
- **Admins** to manage inventory (create, update, delete coupons) via a protected dashboard.
- **Resellers** to integrate programmatically via a versioned REST API using static Bearer Tokens.

Purchases are **atomic** — using MongoDB's `findOneAndUpdate` with `{ is_sold: false }` to guarantee a coupon can never be sold twice.

---

## 🛠 Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React (Vite), React Router, Custom CSS Design System |
| Backend    | Node.js, Express, Joi Validation                    |
| Database   | MongoDB + Mongoose                                  |
| Auth       | JWT (Admin), Static Bearer Tokens (Reseller)        |
| DevOps     | Docker (Multi-stage), Nginx (SPA routing support)   |

---

## 📂 Project Structure

```
coupon-marketplace/

├── backend/
│   ├── config/
│   │   └── env.js                    # Environment variable loader
│   ├── controllers/
│   │   ├── AdminAuthController.js    # Admin login logic
│   │   ├── AdminProductsController.js# CRUD for coupons (admin)
│   │   ├── CustomerController.js     # Customer shop logic
│   │   └── ResellerProductsController.js # Reseller purchase flow
│   ├── db/
│   │   └── mongoose.js               # MongoDB connection setup
│   ├── middleware/
│   │   ├── authAdmin.js              # JWT verification for admins
│   │   ├── authReseller.js           # Bearer token verification
│   │   ├── errorHandler.js           # Global error handler
│   │   └── validate.js               # Joi request validation
│   ├── models/
│   │   ├── Product.js                # Coupon/Product Mongoose model
│   │   └── User.js                   # Admin user Mongoose model
│   ├── repositories/
│   │   ├── ProductRepository.js      # DB queries for products
│   │   └── UserRepository.js         # DB queries for users
│   ├── routes/
│   │   ├── adminAuth.js              # POST /api/admin/auth/login
│   │   ├── adminProducts.js          # CRUD /api/admin/products
│   │   ├── customerShop.js           # GET & purchase /api/shop
│   │   ├── health.js                 # GET /api/health
│   │   └── resellerProductsV1.js     # POST /api/v1/products/:id/purchase
│   ├── seed/
│   │   └── seed.js                   # DB seeder (admin user + sample data)
│   ├── services/
│   │   ├── AuthService.js            # JWT creation & verification
│   │   └── ProductService.js         # Business logic for products
│   ├── utils/
│   │   ├── AppError.js               # Custom error class
│   │   └── schemas.js                # Joi validation schemas
│   ├── validation/
│   │   └── Coupon.js                 # Coupon-specific validation rules
│   ├── .env                          # Backend environment variables
│   ├── api_requests.rest             # HTTP test file (REST Client)
│   ├── app.js                        # Express app setup & middleware
│   ├── Dockerfile                    # Backend Docker image
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Axios instance with base URL
│   │   ├── components/
│   │   │   ├── Alert.jsx             # Reusable alert/notification
│   │   │   ├── Header.jsx            # Top navigation bar
│   │   │   ├── Modal.jsx             # Generic modal wrapper
│   │   │   ├── ProductCard.jsx       # Coupon card for the shop
│   │   │   └── Spinner.jsx           # Loading indicator
│   │   ├── mock/
│   │   │   └── products.js           # Mock data for local dev
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # Admin CRUD dashboard
│   │   │   ├── AdminLogin.jsx        # Admin login page
│   │   │   └── CustomerShop.jsx      # Public storefront
│   │   ├── App.jsx                   # Router + route definitions
│   │   ├── main.jsx                  # React entry point
│   │   └── styles.css                # Global CSS design system
│   ├── .env                          # Frontend environment variables
│   ├── Dockerfile                    # Nginx + Vite build image
│   ├── index.html                    # HTML entry point
│   ├── nginx.conf                    # Nginx SPA config
│   └── vite.config.js                # Vite build configuration
│
├── .env                              # Root-level env (optional)
├── docker-compose.yml                # Full stack orchestration
└── README.md
```

---

## 🚀 Quick Start

The fastest way to launch the entire ecosystem — Frontend, Backend, and MongoDB — is via Docker Compose.

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose installed

### Run with Docker

```bash
# Clone the repository
git clone <repository-url>
cd coupon-marketplace

# Start all services
docker-compose up --build
```

### Default URLs

| Service              | URL                                              |
|----------------------|--------------------------------------------------|
| Frontend (Shop & Admin) | http://localhost:3000                         |
| Backend API          | http://localhost:12345                           |
| API Health Check     | http://localhost:12345/api/health                |
| MongoDB              | `mongodb://localhost:27017/coupon_marketplace`   |

### Run Without Docker (Local Development)

**Backend:**
```bash
cd backend
npm install
npm run dev     # or: node app.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Configuration (Environment Variables)

Create `.env` files in the appropriate directories before running.

### Backend — `/backend/.env`
```env
PORT=12345
MONGO_URI=mongodb://mongo:27017/coupon_marketplace
JWT_SECRET=dev_secret_change_me
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=Admin1234!
RESELLER_TOKENS=token1,token2
```

| Variable             | Description                                        |
|----------------------|----------------------------------------------------|
| `PORT`               | Port the Express server listens on                 |
| `MONGO_URI`          | MongoDB connection string                          |
| `JWT_SECRET`         | Secret used to sign/verify admin JWTs              |
| `ADMIN_SEED_EMAIL`   | Email for the seeded admin account                 |
| `ADMIN_SEED_PASSWORD`| Password for the seeded admin account              |
| `RESELLER_TOKENS`    | Comma-separated list of valid reseller tokens      |

### Frontend — `/frontend/.env`
```env
# Development
VITE_API_BASE_URL=http://localhost:12345

# Docker / Production (leave empty if Nginx proxies /api)
# VITE_API_BASE_URL=
```

> ⚠️ All frontend environment variables **must** be prefixed with `VITE_` to be exposed to the browser by Vite.

---

## 🏗️ Backend Architecture

The backend follows a strict **layered architecture**:

```
HTTP Request
    │
    ▼
[ Routes ]          → Defines endpoints, applies middleware
    │
    ▼
[ Middleware ]      → Auth (JWT / Bearer), Validation (Joi), Error Handler
    │
    ▼
[ Controllers ]     → Handles req/res, delegates to services
    │
    ▼
[ Services ]        → Business logic (pricing, availability checks)
    │
    ▼
[ Repositories ]    → All DB queries (Mongoose)
    │
    ▼
[ Models ]          → Mongoose schemas (Product, User)
```

### Key Design Decisions

- **`AppError`**: A custom error class that carries an HTTP status code, enabling the global `errorHandler` middleware to send consistent JSON error responses.
- **`validate` middleware**: Accepts a Joi schema and validates `req.body` before the request reaches the controller.
- **Atomic Purchase**: `ProductRepository` uses `findOneAndUpdate` with `{ is_sold: false }` as the filter to prevent race conditions on concurrent purchases.

---

## 🔌 API Reference

### Health Check

```http
GET /api/health
```
Returns `200 OK` if the server is running.

---

### Admin Authentication

#### Login

```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin1234!"
}
```

**Response:**
```json
{
  "token": "<JWT>"
}
```

---

### Admin — Coupon Management

> All routes require `Authorization: Bearer <JWT>` header.

#### List All Coupons

```http
GET /api/admin/products
Authorization: Bearer <JWT>
```

#### Create a Coupon

```http
POST /api/admin/products
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "name": "Netflix 1 Month",
  "value": "NFLX-XXXX-YYYY",
  "cost_price": 30,
  "margin_percentage": 20,
  "category": "Streaming"
}
```

#### Update a Coupon

```http
PATCH /api/admin/products/:id
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "margin_percentage": 25
}
```

> **Note:** Omit `value` in the request body to keep the existing coupon code unchanged.

#### Delete a Coupon

```http
DELETE /api/admin/products/:id
Authorization: Bearer <JWT>
```

---

### Customer Shop

#### Browse Available Coupons

```http
GET /api/shop/products
```
> The `value` (coupon code) and `cost_price` are **never** returned in public listings.

#### Purchase a Coupon

```http
POST /api/shop/products/:id/purchase
```

On success, the response includes the revealed `value` (coupon code). The product is atomically marked as `is_sold: true`.

---

### Reseller API (v1)

#### Purchase a Coupon

```http
POST /api/v1/products/:id/purchase
Authorization: Bearer <reseller_token>
Content-Type: application/json

{
  "reseller_price": 36
}
```

The `reseller_price` must be ≥ the calculated `minimum_sell_price`. Otherwise the request is rejected with `403 Forbidden`.

---

## 🖥 Frontend Pages

| Route        | Component              | Description                              |
|--------------|------------------------|------------------------------------------|
| `/`          | `CustomerShop.jsx`     | Public storefront — browse & buy coupons |
| `/admin`     | `AdminLogin.jsx`       | Admin login form                         |
| `/admin/dashboard` | `AdminDashboard.jsx` | Protected CRUD interface for admins  |

### Shared Components

| Component       | Purpose                              |
|-----------------|--------------------------------------|
| `Header.jsx`    | Navigation bar with branding         |
| `ProductCard.jsx` | Displays a coupon with purchase CTA |
| `Modal.jsx`     | Generic overlay for forms/confirmations |
| `Alert.jsx`     | Success/error notification banners   |
| `Spinner.jsx`   | Loading state indicator              |

---

## 📐 Business Logic & Rules

### Pricing Formula

The selling price is calculated **server-side** to prevent tampering:

$$\text{minimum\_sell\_price} = \text{cost\_price} \times \left(1 + \frac{\text{margin\_percentage}}{100}\right)$$

**Example:** A coupon with `cost_price: 30` and `margin_percentage: 20` has a `minimum_sell_price` of **36**.

### Data Visibility Rules

| Field          | Customer (browse) | Customer (after purchase) | Admin | Reseller |
|----------------|:-----------------:|:------------------------:|:-----:|:--------:|
| `name`         | ✅                | ✅                        | ✅    | ✅        |
| `sell_price`   | ✅                | ✅                        | ✅    | ✅        |
| `value` (code) | ❌                | ✅                        | ✅    | ✅        |
| `cost_price`   | ❌                | ❌                        | ✅    | ❌        |
| `margin_%`     | ❌                | ❌                        | ✅    | ❌        |

### Atomic Purchase Guarantee

To prevent double-selling in concurrent environments, the purchase query uses:

```js
Product.findOneAndUpdate(
  { _id: id, is_sold: false },  // atomic filter
  { $set: { is_sold: true } },
  { new: true }
)
```

If the product is already sold, the query returns `null` and a `409 Conflict` is returned.

---

## 🔒 Security Model

| Actor    | Auth Method                     | Scope                              |
|----------|---------------------------------|------------------------------------|
| Admin    | JWT (signed with `JWT_SECRET`)  | Full CRUD on products, user mgmt   |
| Reseller | Static Bearer Token (env-based) | Purchase only, price-gated         |
| Customer | None (public)                   | Browse & purchase at listed price  |

---

## ⚠️ Troubleshooting

| Issue                     | Potential Cause               | Solution                                                                 |
|---------------------------|-------------------------------|--------------------------------------------------------------------------|
| `500` on Create/Update    | Missing `Content-Type` header | Ensure frontend sends `Content-Type: application/json`                   |
| `404` on page refresh     | Nginx SPA config              | Ensure `nginx.conf` contains `try_files $uri /index.html`                |
| CORS errors               | Mismatched origins            | Check CORS middleware configuration in `backend/app.js`                  |
| Vite env vars not loading | Missing `VITE_` prefix        | All frontend env vars must start with `VITE_`                            |
| DB connection failure     | Docker networking             | Ensure `MONGO_URI` uses the service name `mongo` (not `localhost`) in Docker |
| Token rejected (reseller) | Token not in env list         | Check `RESELLER_TOKENS` in `/backend/.env` includes the token used       |
| Coupon already sold `409` | Race condition or stale UI    | Refresh the product list; another purchase completed first               |

---

## 🚀 Roadmap

- [ ] Stripe integration for real payments
- [ ] Email delivery system for purchased coupon codes
- [ ] Support for multiple stock quantities per product
- [ ] Dark Mode UI toggle
- [ ] Reseller dashboard with purchase history
- [ ] Rate limiting on purchase endpoints
- [ ] Pagination for large product catalogs

---

## 🌱 Database Seeding

To populate the database with an initial admin user and sample coupons:

```bash
cd backend
node seed/seed.js
```

The seed script uses `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` from your `.env` file.

---

> ⚠️ **Educational Project Disclaimer:** This system is built for demonstration purposes. Do **not** use default passwords, hardcoded secrets, or static tokens in a production environment.
