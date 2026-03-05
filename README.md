# Coupon Marketplace — Full Stack

A full-stack platform for managing and selling digital coupon codes, featuring customer, admin, and reseller interfaces.

---

## Overview

Coupon Marketplace enables:
- **Customers:** Browse and purchase digital coupons in a public storefront.
- **Admins:** Full inventory management (CRUD) of coupons via a secure dashboard.
- **Resellers:** Third-party integrations via a REST API using static Bearer tokens.

All purchases are atomic; a coupon can never be sold more than once.

---

## Key Features

- Admin CRUD for coupons, including initial seed
- JWT-protected admin authentication
- Reseller REST API with static token access
- Public shop interface; coupon "codes" revealed only after purchase
- Input validation (Joi)
- Atomic/transactional purchase flow
- Dockerized deployment for frontend, backend, and database

---

## Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Frontend   | React (Vite), React Router, CSS Design System |
| Backend    | Node.js, Express, Joi                        |
| Database   | MongoDB (Mongoose)                           |
| Auth       | JWT (Admin), Static Bearer (Reseller)        |
| DevOps     | Docker, Docker Compose, Nginx                |

---

## Project Structure

```
coupon-marketplace/
├── backend/
│   ├── controllers/      # Request logic
│   ├── db/               # MongoDB connection
│   ├── middleware/       # Auth, validation, errors
│   ├── models/           # Mongoose schemas
│   ├── repositories/     # DB queries
│   ├── routes/           # API endpoints
│   ├── seed/             # Seeding script
│   ├── services/         # Business logic
│   ├── utils/            # Helpers, validation schemas
│   ├── .env              # Backend environment variables
│   └── app.js
├── frontend/
│   ├── src/              # React app code
│   ├── Dockerfile
│   ├── index.html
│   └── vite.config.js
├── .env                  # Root env for Docker Compose
├── docker-compose.yml    # Orchestration
└── README.md
```

---

## Quick Start

### A) With Docker Compose (Recommended)

1. **Clone and enter repo:**
   ```bash
   git clone <repository-url>
   cd coupon-marketplace
   ```
2. **Set environment variables:**
   - Copy `.env.example` to `.env` (edit as needed).
3. **Start all services:**
   ```bash
   docker compose up --build
   ```
4. **Access:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:12345](http://localhost:12345)

### B) Local Development (No Docker)

1. **Clone and enter repo:**
   ```bash
   git clone <repository-url>
   cd coupon-marketplace
   ```
2. **Backend:**
   - Make `/backend/.env` (see `.env.example`).
   - Run:
     ```bash
     cd backend
     npm install
     npm run dev
     ```
3. **Frontend (new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Ensure local MongoDB runs at `mongodb://127.0.0.1:27017/coupon_marketplace`.**
5. **Access as above.**

---

## Environment Variables (Summary)

**Required `.env` config:**

| Key                  | Example (Docker)                        | Example (Local)                              |
|----------------------|-----------------------------------------|----------------------------------------------|
| PORT                 | 12345                                   | 12345                                        |
| MONGO_URI            | mongodb://mongo:27017/coupon_marketplace| mongodb://127.0.0.1:27017/coupon_marketplace |
| JWT_SECRET           | long_random_string_of_32+_chars         | (same)                                       |
| JWT_EXPIRES_IN       | 7d                                      | 7d                                           |
| RESELLER_TOKENS      | token1,token2,token3                    | (same)                                       |
| ADMIN_SEED_EMAIL     | admin@example.com                       | (same)                                       |
| ADMIN_SEED_PASSWORD  | Admin12345!                             | (same)                                       |
| VITE_API_BASE_URL    | http://localhost:12345                  | http://localhost:12345 (frontend only)       |

Notes:
- With Docker, `MONGO_URI` uses `mongo` host; for local, use `127.0.0.1`.
- `RESELLER_TOKENS` must be comma-separated, no spaces.
- Frontend env vars must be prefixed with `VITE_`.

---

## API Overview

| Method | Endpoint                                 | Description                   | Auth          |
|--------|------------------------------------------|-------------------------------|--------------|
| GET    | /api/health                             | Health check                  | None         |
| POST   | /api/admin/auth/login                   | Admin login                   | None         |
| GET    | /api/admin/products                     | List all coupons              | Admin (JWT)  |
| POST   | /api/admin/products                     | Create coupon                 | Admin (JWT)  |
| PATCH  | /api/admin/products/:id                 | Update coupon                 | Admin (JWT)  |
| DELETE | /api/admin/products/:id                 | Delete coupon                 | Admin (JWT)  |
| GET    | /api/shop/products                      | Public coupon listing         | None         |
| POST   | /api/shop/products/:id/purchase         | Purchase coupon (customer)    | None         |
| GET    | /api/v1/products                        | List coupons (reseller)       | Reseller     |
| GET    | /api/v1/products/:id                    | Coupon details (reseller)     | Reseller     |
| POST   | /api/v1/products/:id/purchase           | Purchase coupon (reseller)    | Reseller     |

- **Admin endpoints** require: `Authorization: Bearer <JWT>`
- **Reseller endpoints** require: `Authorization: Bearer <reseller_token>`

---

## Business Logic

- **Price Formula:**  
  ```
  minimum_sell_price = cost_price × (1 + margin_percentage / 100)
  ```
- **Atomic Purchase Guarantee:**  
  Purchases use MongoDB's `findOneAndUpdate` with `{ is_sold: false }` to prevent double-selling:
  ```js
  Product.findOneAndUpdate(
    { _id: id, is_sold: false },
    { $set: { is_sold: true } },
    { new: true }
  )
  ```
- **Visibility:**  
  - Coupon `value` (the secret code) and `cost_price` are **never** exposed in public or reseller product listings.
  - Coupon code is shown only after successful purchase.
  - Admins can view/edit full product data.

---
