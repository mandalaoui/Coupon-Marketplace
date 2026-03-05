# 🎫 Coupon Marketplace — Full Stack

> A full-stack digital marketplace for coupon-based products, featuring a customer-facing shop, a protected Admin Dashboard, and a Reseller API for third-party integrations.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
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

## ✨ Key Features

- Full coupon lifecycle management (Admin CRUD)
- Secure Admin authentication with JWT
- Public storefront for browsing and purchasing coupons
- Reseller API for programmatic integrations
- Atomic coupon purchase to prevent double-selling
- Input validation using Joi
- Dockerized full-stack deployment

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
│   ├── Dockerfile                    # Nginx + Vite build image
│   ├── index.html                    # HTML entry point
│   ├── nginx.conf                    # Nginx SPA config
│   └── vite.config.js                # Vite build configuration
│
├── .env                              # Root-level environment variables
├── docker-compose.yml                # Full stack orchestration
└── README.md
```

---

## 🚀 Quick Start

> Get up and running with the full-stack Coupon Marketplace. Follow the instructions for **either Docker Compose (recommended)** or **Local Development (no Docker)**.

### 🚦 Pre-flight Checklist

- [Docker Desktop](https://www.docker.com/products/docker-desktop) **installed** (for Docker flow).
- **Ports 3000, 12345, 27017** are **free** (not used by other apps).
- **Environment file(s) created** — see steps below.

---

### 🐳 A) Run with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd coupon-marketplace
   ```

2. **Create the root `.env` file:**
   - Copy the example if provided, or create a new `.env` at the project root:
     ```bash
     cp .env.example .env   # If .env.example exists
     # OR create a new .env file
     ```
   - **Edit `.env` and set values for at least:**
     - `JWT_SECRET` — a long random string
     - `RESELLER_TOKENS` — comma-separated tokens (e.g., `token1,token2`)
     - `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` — credentials for first admin user
     - Other fields as needed (see "Configuration" below)

3. **Start all services (frontend, backend, MongoDB):**
   ```bash
   docker compose up --build
   # If you have older Docker, use: docker-compose up --build
   ```

4. **Access the application:**

   | Service               | URL                                         |
   |-----------------------|---------------------------------------------|
   | Frontend (Shop/Admin) | http://localhost:3000                       |
   | Backend API           | http://localhost:12345                      |
   | API Health Check      | http://localhost:12345/api/health           |
   | MongoDB               | mongodb://localhost:27017/coupon_marketplace |


### 💻 B) Run Locally (No Docker)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd coupon-marketplace
   ```

2. **Set up backend environment:**
   - Create `/backend/.env` (see example in `backend/.env.example` if provided).
   - At minimum, fill in:
     - `PORT=12345`
     - `MONGO_URI=mongodb://127.0.0.1:27017/coupon_marketplace`
     - `JWT_SECRET` / `RESELLER_TOKENS` / `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`
     - And any other required settings below.

3. **Install and run the backend:**
   ```bash
   cd backend
   npm install
   npm run dev    # or: node app.js
   ```

4. **Install and run the frontend (new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Start MongoDB locally** if not running already.

6. **Access the application:**

   | Service               | URL                                         |
   |-----------------------|---------------------------------------------|
   | Frontend (Shop/Admin) | http://localhost:3000                       |
   | Backend API           | http://localhost:12345                      |
   | API Health Check      | http://localhost:12345/api/health           |
   | MongoDB               | mongodb://127.0.0.1:27017/coupon_marketplace |

---

### 🛠 Common Troubleshooting

- **App crashes at startup**?  
  → Confirm required `.env` file(s) exist with all necessary keys filled in.
- **Ports already in use**?  
  → Ensure ports 3000 (frontend), 12345 (backend), 27017 (MongoDB) are not occupied by other processes.
- **Frontend can't reach backend** in local dev?  
  → Check `VITE_API_BASE_URL` in frontend and CORS/backend port settings.

---

## ⚙️ Configuration (Environment Variables)

### ✅ What to put in your `.env` files (ready-to-use samples)

#### 🐳 A) Docker Compose (`/.env` file in the project root)

```dotenv
# ===== Backend =====
PORT=12345
NODE_ENV=development

# ===== Mongo (Docker service name is "mongo") =====
MONGO_URI=mongodb://mongo:27017/coupon_marketplace

# If you defined MongoDB credentials in docker-compose.yml, set them here:
MONGO_USER=admin
MONGO_PASS=admin123

# ===== Auth =====
JWT_SECRET=change_this_to_a_very_long_random_string_32_chars_min
JWT_EXPIRES_IN=7d

# Tokens for reseller API (comma-separated, no spaces)
RESELLER_TOKENS=token1,token2,token3

# ===== Admin seed (created on first run) =====
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=Admin12345!

# ===== Frontend =====
VITE_API_BASE_URL=http://localhost:12345
```

**Important for Docker:**  
- `MONGO_URI` uses `mongo` because that is the service name inside the Docker network.  
- `MONGO_USER`/`MONGO_PASS` are required only if MongoDB authentication is enabled in `docker-compose.yml`. If Mongo authentication is not enabled, remove them or leave them empty.

---

#### 💻 B) Local Run (without Docker) (`backend/.env`):

```dotenv
PORT=12345
NODE_ENV=development

# Local Mongo (running on your machine)
MONGO_URI=mongodb://127.0.0.1:27017/coupon_marketplace

JWT_SECRET=change_this_to_a_very_long_random_string_32_chars_min
JWT_EXPIRES_IN=7d

RESELLER_TOKENS=token1,token2,token3

ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=Admin12345!
```

In this case there is **no** `MONGO_USER` / `MONGO_PASS`, unless you manually enabled authentication in your local MongoDB installation.

---

### 🔥 Golden Rules (avoid 90% of bugs)

- **JWT_SECRET** must be long and random (minimum 32 characters).
- **RESELLER_TOKENS** must be comma-separated with **no spaces**:  
  - Correct: `token1,token2,token3`  
  - Incorrect: `token1, token2`
- **VITE_API_BASE_URL** belongs to the frontend, but with Docker it is convenient to keep it in the root `.env`.

---

**🚩 _If you run with Docker Compose, use `mongo` as the host in `MONGO_URI`. If you run locally, use `127.0.0.1`._**

> **Frontend env variable note:** All frontend (`/frontend`) variables exposed to the browser **must** be prefixed with `VITE_`.




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

| Method | Endpoint | Description |
|------|------|------|
| GET | /api/health | Health check |
| POST | /api/admin/auth/login | Admin login |
| GET | /api/admin/products | List coupons |
| POST | /api/admin/products | Create coupon |
| PATCH | /api/admin/products/:id | Update coupon |
| DELETE | /api/admin/products/:id | Delete coupon |
| GET | /api/shop/products | Public listing |
| POST | /api/shop/products/:id/purchase | Purchase coupon |
| POST | /api/v1/products/:id/purchase | Reseller purchase |

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
  "description": "Gift card",
  "image_url": "https://...",
  "cost_price": 30,
  "margin_percentage": 20,
  "value_type": "STRING",
  "value": "NFLX-XXXX-YYYY"
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

#### List Available Coupons

```http
GET /api/v1/products
Authorization: Bearer <reseller_token>
```
> **All reseller endpoints require:**  
> `Authorization: Bearer <reseller_token>`

Returns a list of unsold coupons available for resellers to purchase. The response includes relevant product metadata, calculated `minimum_sell_price`, but never exposes the secret coupon `value` or `cost_price`.

#### Get Coupon Details

```http
GET /api/v1/products/:id
Authorization: Bearer <reseller_token>
```
> **All reseller endpoints require:**  
> `Authorization: Bearer <reseller_token>`

Returns detailed information for a single coupon product, including all public fields and `minimum_sell_price` (but **never** the coupon `value` itself).

#### Purchase a Coupon

```http
POST /api/v1/products/:id/purchase
Authorization: Bearer <reseller_token>
Content-Type: application/json

{
  "reseller_price": 36
}
```
> **All reseller endpoints require:**  
> `Authorization: Bearer <reseller_token>`

The `reseller_price` must be greater than or equal to the calculated `minimum_sell_price`. Otherwise, the request is rejected with `400 Bad Request`:

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

## Screenshots

### Admin & Shop Screenshots

**Shop Page**

<img width="1217" height="863" alt="shop_page" src="https://github.com/user-attachments/assets/c92e8d23-1e01-4f40-9563-6ebe3019c569" />

**Admin Login**

<img width="1160" height="782" alt="admin_login" src="https://github.com/user-attachments/assets/6dfbe68f-a598-478c-98d0-5e379487abd3" />

**Admin Dashboard**

<img width="1161" height="820" alt="admin_dashboard" src="https://github.com/user-attachments/assets/909e9b16-ecd3-4ac3-8c3e-5661e4aad577" />

**Create Coupon (Admin)**

<img width="1200" height="861" alt="create_coupon" src="https://github.com/user-attachments/assets/2d3411de-8168-418b-98cf-d997bfdd7c62" />

**Edit Coupon (Admin)**

<img width="1200" height="862" alt="edit_coupon" src="https://github.com/user-attachments/assets/6760a6b8-a5a1-4371-b634-c9aca21ce935" />

---

## 📐 Business Logic & Rules

### Pricing Formula

The product price is calculated **server-side** to prevent manipulation by clients.
```
minimum_sell_price = cost_price × (1 + margin_percentage / 100)
```
**Example:** A coupon with `cost_price: 30` and `margin_percentage: 20` has a `minimum_sell_price` of **36**.

### Data Visibility Rules

| Field            | Customer (browse) | Customer (after purchase) | Admin | Reseller (browse) | Reseller (after purchase) |
|------------------|:-----------------:|:------------------------:|:-----:|:-----------------:|:--------------------------:|
| `name`           | ✅                | ✅                        | ✅    | ✅                | ✅                         |
| `price`     | ✅                | ✅                        | ✅    | ✅                | ✅                         |
| `value` (code)   | ❌                | ✅                        | ❌    | ❌                | ✅                         |
| `cost_price`     | ❌                | ❌                        | ✅    | ❌                | ❌                         |
| `margin_%`       | ❌                | ❌                        | ✅    | ❌                | ❌                         |

- Coupon `value` (the redeemable code) is never exposed in product listings.
- It is returned only after a successful purchase (for both customers and resellers).
- Sensitive pricing fields (`cost_price`, `margin_percentage`) are visible only to Admin APIs.

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

## 🌱 Database Seeding

To populate the database with an initial admin user and sample coupons:

```bash
cd backend
node seed/seed.js
```

The seed script uses `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` from your `.env` file.

---

> ⚠️ **Educational Project Disclaimer:** This system is built for demonstration purposes. Do **not** use default passwords, hardcoded secrets, or static tokens in a production environment.

---

## License

This project is provided for educational purposes.

## Author

Omer Mandalaoui  
Full-Stack Developer
