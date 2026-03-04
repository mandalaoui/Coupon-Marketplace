# Coupon-Marketplace

Frontend for a digital marketplace that sells coupon-based products (Shop + Admin Dashboard).

> **Current status:** The UI can run fully with **mock data** until the backend API is connected.

---

## Features (Frontend)

- **Customer Shop**
  - View available coupons/products
  - Purchase flow UI (purchase modal + reveal screen)
- **Admin**
  - Login page UI
  - Admin dashboard UI
  - Create / Edit / Delete coupons (UI flow + forms)
- **Mock mode**
  - Temporary data source in `src/mock/products.js`
  - Used to render products before connecting to the API

---

## Tech Stack

- **Vite** (React build tool)
- **React** (UI)
- **React Router** (`react-router-dom`) for routing
- **CSS** (custom design system in `src/styles.css`)
- **Docker** (multi-stage build)
  - Build with Node
  - Serve with Nginx

---

## Project Structure (Frontend)

frontend/
└── src/
    ├── api/
    │   └── client.js        # API client (will be used when backend is connected)
    ├── components/
    │   ├── Alert.jsx
    │   ├── Header.jsx
    │   ├── Modal.jsx
    │   ├── ProductCard.jsx
    │   └── Spinner.jsx
    ├── mock/
    │   └── products.js      # mock data (temporary)
    ├── pages/
    │   ├── CustomerShop.jsx
    │   ├── AdminLogin.jsx
    │   ├── AdminDashboard.jsx
    │   └── App.jsx
    ├── main.jsx
    ├── styles.css
    └── ...
nginx.conf
Dockerfile
index.html

---

## Prerequisites

- **Node.js** 18+
- **npm**
- (Optional) **Docker Desktop** (for Docker runs)

---

## Run Locally (No Docker)

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

Vite dev server:  
http://localhost:5173

**Build + Preview (No Docker)**

```bash
cd frontend
npm run build
npm run preview
```

Preview URL:  
http://localhost:4173

---

## Run with Docker (Frontend Only)

1) Build image

```bash
cd frontend
docker build -t coupon-frontend .
```

2) Run container

```bash
docker rm -f coupon_frontend 2>nul
docker run --name coupon_frontend --rm -p 3000:80 coupon-frontend
```

Open in browser:  
http://localhost:3000

If you get a “container name already in use” error, remove the old container:

```bash
docker rm -f coupon_frontend
```

---

## Mock Data (Temporary)

Until the backend API is connected, the frontend uses mock products.

- File: `frontend/src/mock/products.js`
- Purpose: render products and test UI flows without MongoDB/backend.

When the API is ready, the mock layer should be removed and `src/api/client.js` should be used for:

- `GET /api/shop/products`
- `POST /api/shop/purchase/:id`
- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- Admin products CRUD

---

## Environment Variables (Later)

When connecting to backend:  
`VITE_API_BASE_URL` will be used at build time (Vite) to point the frontend to the API.

Example (when API exists):

```
VITE_API_BASE_URL=http://localhost:12345
```

Note: In production builds, Vite env variables are baked into the build. Changing them requires rebuilding the image/app unless you implement runtime config.

---

## Common Issues

**Missing react-router-dom**

If you see:
```
Failed to resolve import "react-router-dom"
```
Install it:
```bash
cd frontend
npm i react-router-dom
```

**Nginx + React Router (404 on refresh)**

Make sure `nginx.conf` includes a SPA fallback to `index.html`.  
(If refresh on `/admin` returns 404, the nginx config needs adjustment.)

---

## Roadmap

- Connect frontend to backend API (remove mock)
- Add authentication persistence + route guards (already partially implemented)
- Add admin validations + better error handling
- Add UI polish: skeletons, empty states, toasts

---


Backend
Tech Stack

Node.js + Express (REST API)

MongoDB + Mongoose (persistence)

JWT authentication (Admin)

Joi validation

Structured layers: routes → controllers/services → repositories → models

Domain & Business Rules (as required)

Coupon = Product (type: COUPON)
Main fields:

name, description, image_url

Pricing (admin-defined): cost_price, margin_percentage

Derived server-side only: minimum_sell_price = cost_price * (1 + margin_percentage / 100)

is_sold boolean (default: false)

Coupon value: value_type (STRING | IMAGE) + value

Rules enforced:

cost_price >= 0

margin_percentage >= 0

minimum_sell_price is calculated on the server and must not be accepted from clients

Coupon value is returned only after successful purchase

Purchase must be atomic (no double-sell)

API Overview
Health

GET /api/health → { status, timestamp }

Admin Auth

POST /api/admin/auth/login
Returns JWT token for admin usage.

(Optional, if implemented) GET /api/admin/auth/me

Admin Products (CRUD)

Base: /api/admin/products
Requires header: Authorization: Bearer <ADMIN_JWT>

GET /api/admin/products → list all coupons (sold + unsold)

POST /api/admin/products → create coupon
Admin provides: cost_price, margin_percentage, image_url, value_type, value

PUT /api/admin/products/:id → update coupon
Security note: value is not prefilled; on update you may omit value to keep it unchanged

DELETE /api/admin/products/:id → delete coupon

Customer Shop (Frontend channel)

Base: /api/shop

GET /api/shop/products → list unsold coupons with price = minimum_sell_price

POST /api/shop/products/:id/purchase
Validates: exists + not sold, then marks as sold atomically, returns coupon value

Reseller Channel (what it is)

Reseller is an external client (not your frontend) that integrates via REST API.
They can buy a coupon using an API request and specify a reseller_price.

Rules:

reseller_price >= minimum_sell_price
otherwise reject with RESELLER_PRICE_TOO_LOW

Must be atomic: coupon can’t be sold twice

On success: mark as sold and return coupon value (same as customer purchase)

Note: Reseller purchases do not show “higher price” on your website.
The reseller sells to their own customers outside your system.

Error Format (consistent)

All errors follow:

{
  "error_code": "ERROR_NAME",
  "message": "Human readable message"
}

Common expected codes:

PRODUCT_NOT_FOUND (404)

PRODUCT_ALREADY_SOLD (409)

RESELLER_PRICE_TOO_LOW (400)

UNAUTHORIZED (401)

Running Backend (No Docker)
1) Install
cd backend
npm install
2) Environment Variables

Create backend/.env:

PORT=12345
MONGO_URI=mongodb://localhost:27017/coupon_marketplace

JWT_SECRET=dev_secret_change_me
JWT_EXPIRES_IN=7d

# Used by seed (optional)
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=Admin1234!

# Optional reseller tokens (comma-separated) if reseller API is enabled
RESELLER_TOKENS=token1,token2
3) Start
npm start

Expected:

Mongo connects

seed creates admin (first run)

server listens on http://localhost:12345

If you get Missing required env var: MONGO_URI → you forgot .env or its key.

Running Backend (With Docker)
Start Mongo + Backend (docker compose)

From project root:

docker compose up --build

Stop:

docker compose down -v
Testing the Backend (REST Client)

A ready-to-run REST file is included (or should be created):
backend/api/coupon-marketplace.rest

Recommended VS Code extension: REST Client
Open the .rest file and click Send Request on each request.

Tests included:

Health check

Admin login + token

Admin CRUD (create/update/delete)

Customer list + purchase

Atomic “Sell” Guarantee

Purchases use an atomic DB operation to prevent race conditions (double-sell).
Implementation relies on a “match unsold + update” pattern (e.g., findOneAndUpdate({is_sold:false})), ensuring only one buyer can mark the same coupon as sold.

Additional Backend Capabilities
Reseller API (External Integration)

In addition to the customer shop, the system exposes a Reseller API for external partners.

Resellers can purchase coupons programmatically via REST API and resell them on their own platforms.

Reseller endpoints are protected using Bearer tokens configured in the environment.

Example header:

Authorization: Bearer <RESELLER_TOKEN>
Reseller Endpoints

Base path:

/api/v1/products
List Available Products
GET /api/v1/products

Returns all unsold coupons.

Response example:

[
  {
    "id": "uuid",
    "name": "Amazon $100 Coupon",
    "description": "Gift card",
    "image_url": "...",
    "price": 100.00
  }
]

Sensitive fields such as cost_price, margin_percentage, and value are never returned.

Get Product by ID
GET /api/v1/products/:productId

Returns public product information.

Purchase Coupon (Reseller)
POST /api/v1/products/:productId/purchase

Body:

{
  "reseller_price": 120
}

Server validations:

Product exists

Product not sold

reseller_price >= minimum_sell_price

On success:

{
  "product_id": "uuid",
  "final_price": 120,
  "value_type": "STRING",
  "value": "ABCD-1234"
}

The coupon value is revealed only after a successful purchase.

Atomic Purchase Guarantee

The system prevents double-selling of coupons using an atomic database operation.

Instead of:

1. Read product
2. Check is_sold
3. Update

The backend performs a single atomic operation:

findOneAndUpdate(
  { _id: id, is_sold: false },
  { $set: { is_sold: true } }
)

This ensures:

Only one request can mark the coupon as sold

All concurrent requests receive either success or PRODUCT_ALREADY_SOLD

This behavior applies to both Customer and Reseller purchases.

Backend Architecture

The backend follows a layered architecture:

routes
  ↓
controllers
  ↓
services (business logic)
  ↓
repositories (database access)
  ↓
models (Mongoose schemas)

Responsibilities:

Layer	Responsibility
Routes	Define API endpoints
Controllers	Handle HTTP requests
Services	Business logic & validation
Repositories	Database operations
Models	MongoDB schemas

This separation improves testability and maintainability.

Environment Variables (Backend)

Example .env:

PORT=12345

MONGO_URI=mongodb://localhost:27017/coupon_marketplace

JWT_SECRET=dev_secret_change_me
JWT_EXPIRES_IN=7d

ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=Admin1234!

RESELLER_TOKENS=reseller_dev_token

Multiple reseller tokens can be provided:

RESELLER_TOKENS=token1,token2,token3
Running Backend with Docker (Standalone)

The backend can run independently using its Dockerfile.

Build the image
cd backend
docker build -t coupon-backend .
Start MongoDB
docker run -d -p 27017:27017 --name mongo mongo:7
Run Backend Container
docker run -p 12345:12345 \
-e MONGO_URI=mongodb://host.docker.internal:27017/coupon_marketplace \
-e JWT_SECRET=dev_secret_change_me \
-e ADMIN_SEED_EMAIL=admin@example.com \
-e ADMIN_SEED_PASSWORD=Admin1234! \
-e RESELLER_TOKENS=reseller_dev_token \
coupon-backend

Backend will be available at:

http://localhost:12345

Health check:

GET /api/health
UUID Implementation Note

The project uses UUID identifiers for products.

To ensure compatibility with CommonJS and Docker builds, the project uses:

uuid@8

Example usage:

const { v4: uuidv4 } = require("uuid");

Newer versions of uuid are ESM-only and may break CommonJS environments.

Security Considerations

The system ensures the following security guarantees:

Coupon value is never returned in product listings

Coupon value is revealed only after purchase

Admin authentication uses JWT

Reseller authentication uses Bearer tokens

Pricing fields cannot be manipulated by external clients

All input is validated using Joi schemas

Concurrency Safety

All purchase operations are protected against race conditions.

If multiple clients attempt to purchase the same coupon simultaneously:

Only the first request succeeds

All others receive:

PRODUCT_ALREADY_SOLD

This is enforced via atomic MongoDB operations.

Testing the Reseller API

Example REST requests:

GET /api/v1/products
Authorization: Bearer reseller_dev_token
POST /api/v1/products/{id}/purchase
Authorization: Bearer reseller_dev_token
Content-Type: application/json

Body:

{
  "reseller_price": 120
}
Recommended VS Code Extensions

For development and testing:

REST Client – API testing from .rest files

Docker – container management

MongoDB for VS Code – database inspection

Future Improvements

Potential enhancements:

Product inventory (multiple coupons per product)

Payment integration

Order tracking

Rate limiting for reseller API

API versioning strategy

Audit logs for purchases

Caching product listings