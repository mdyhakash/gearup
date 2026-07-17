# GearUp 🏋️ — Rent Sports & Outdoor Gear Instantly

GearUp is a backend REST API for a sports and outdoor equipment rental platform. Customers browse and rent gear, providers manage their inventory and fulfil orders, and admins moderate the platform.

---

## 🛠️ Tech Stack

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Runtime          | Node.js + TypeScript                              |
| Framework        | Express 5                                         |
| Database         | PostgreSQL                                        |
| ORM              | Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| Auth             | JWT (access + refresh tokens), httpOnly cookies   |
| Password hashing | bcryptjs                                          |
| Payments         | SSLCommerz (`sslcommerz-lts`)                     |
| Dev tooling      | tsx (dev server), tsc (build)                     |

---

## ERD Diagram

> [View ERD on drawSql](https://drawsql.app/teams/mdyhakash/diagrams/gearup)

## 📂 Project Structure

Flat modular structure — one resource = 4 files (`interface`, `service`, `controller`, `route`):

```
src/
├── app.ts                     # Express app + route mounting
├── server.ts                  # Entry point, DB connect + listen
├── config/                    # Env config
├── lib/prisma.ts              # Prisma client instance
├── middleware/
│   ├── auth.ts                 # JWT verification + role guard
│   ├── globalErrorHandler.ts
│   └── notFoundRoute.ts
├── utils/
│   ├── catchAsync.ts
│   ├── sendResponse.ts
│   ├── jwt.ts
│   └── sslcommerz.ts
└── modules/
    ├── auth/
    ├── category/
    ├── gear/
    ├── rental/
    ├── payment/
    ├── review/
    └── admin/
prisma/
├── schema/                     # Multi-file Prisma schema (user, gear, category, rental, payment, review, enum)
└── migrations/
```

---

## 👥 Roles & Permissions

| Role         | Description                                                                           |
| ------------ | ------------------------------------------------------------------------------------- |
| **CUSTOMER** | Browses gear, places rental orders, pays, tracks orders, leaves reviews after return  |
| **PROVIDER** | Manages own gear inventory, views incoming orders, updates order status               |
| **ADMIN**    | Manages all users (suspend/activate), oversees all gear & rentals, manages categories |

Role is selected at registration (`role` field on `POST /api/auth/register`).

---

## ⚙️ Setup & Installation

### 1. Clone & install

```bash
git clone <https://github.com/mdyhakash/gearup.git>
cd gearup
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
PORT=5000
APP_URL=http://localhost:3000

DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>

BCRYPT_SALT_ROUNDS=12

JWT_ACCESS_SECRET=<your-access-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

SSLCOMMERZ_STORE_ID=<your-sslcommerz-store-id>
SSLCOMMERZ_STORE_PASSWORD=<your-sslcommerz-store-password>
```

### 3. Run migrations & generate client

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run the dev server

```bash
npm run dev
```

Server starts at `http://localhost:${PORT}`.

### 5. Build for production

```bash
npm run build
npm start
```

---

## 🔑 Admin Credentials

There is no seed script yet — create the first admin manually via the register endpoint, then use those credentials for grading/testing:

```
POST /api/auth/register
{
  "name": "Admin",
  "email": "admin@gearup.com",
  "password": "Admin@1234",
  "role": "ADMIN"
}
```

**Admin Email:** `admin@gmail.com`
**Admin Password:** `12345`

---

## 📡 Authentication

- On login (`POST /api/auth/login`) and refresh (`POST /api/auth/refresh-token`), the API sets `accessToken` / `refreshToken` as httpOnly cookies **and** returns them in the JSON body.
- Protected routes accept **either**:
  - the `accessToken` cookie (automatic in browser/Postman with cookie jar enabled), **or**
  - an `Authorization: Bearer <accessToken>` header.
- A `BLOCKED` user (suspended by an admin) is rejected at both login and on every subsequent authenticated request.

---

## 📦 Standard Response Shape

**Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Gear item fetched successfully.",
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

**Error:**

```json
{
  "success": false,
  "statusCode": 400,
  "name": "PrismaClientKnownRequestError",
  "message": "Duplicate Key Error",
  "error": "<stack trace>"
}
```

---

## 🔗 API Reference

> [View Postman API Docs:](https://documenter.getpostman.com/view/55148432/2sBY4PMzPM)

Base URL: `/api`

### Auth

| Method | Endpoint              | Auth                    | Description                          |
| ------ | --------------------- | ----------------------- | ------------------------------------ |
| POST   | `/auth/register`      | Public                  | Register (customer/provider/admin)   |
| POST   | `/auth/login`         | Public                  | Login, sets cookies + returns tokens |
| POST   | `/auth/refresh-token` | Public (refresh cookie) | Issue new access token               |
| GET    | `/auth/me`            | Any authenticated       | Get current user profile             |

### Categories

| Method | Endpoint          | Auth   | Description         |
| ------ | ----------------- | ------ | ------------------- |
| POST   | `/categories`     | Admin  | Create category     |
| GET    | `/categories`     | Public | List all categories |
| GET    | `/categories/:id` | Public | Get category by id  |
| PATCH  | `/categories/:id` | Admin  | Update category     |
| DELETE | `/categories/:id` | Admin  | Delete category     |

### Gear

| Method | Endpoint    | Auth                    | Description                                                                                                                                          |
| ------ | ----------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/gear`     | Provider                | Add gear to inventory                                                                                                                                |
| GET    | `/gear`     | Public                  | List gear — filters: `searchTerm`, `categoryId`, `brand`, `minPrice`, `maxPrice`, `condition`, `isAvailable`, `sortBy`, `sortOrder`, `page`, `limit` |
| GET    | `/gear/:id` | Public                  | Get gear details                                                                                                                                     |
| PUT    | `/gear/:id` | Owning provider / Admin | Update gear                                                                                                                                          |
| DELETE | `/gear/:id` | Owning provider / Admin | Delete gear                                                                                                                                          |

### Rentals

| Method | Endpoint               | Auth                              | Description                                                             |
| ------ | ---------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| POST   | `/rentals`             | Customer                          | Create rental order                                                     |
| GET    | `/rentals`             | Customer                          | List own rental orders (filter: `status`, `page`, `limit`)              |
| GET    | `/rentals/:id`         | Owner / involved provider / Admin | Get rental order details                                                |
| PATCH  | `/rentals/:id/cancel`  | Customer (owner)                  | Cancel a `PLACED` order                                                 |
| GET    | `/provider/orders`     | Provider                          | List incoming orders for the provider's gear                            |
| PATCH  | `/provider/orders/:id` | Provider (owning) / Admin         | Update order status (`CONFIRMED`, `PICKED_UP`, `RETURNED`, `CANCELLED`) |

**Status flow:** `PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED` (or `CANCELLED` from `PLACED`/`CONFIRMED`). `PAID` is set automatically by the payment module, not via the provider status-update endpoint.

### Payments (SSLCommerz)

| Method   | Endpoint            | Auth                | Description                                             |
| -------- | ------------------- | ------------------- | ------------------------------------------------------- |
| POST     | `/payments/create`  | Customer            | Create an SSLCommerz payment session for a rental order |
| POST/GET | `/payments/confirm` | SSLCommerz callback | Validates payment, redirects; moves order to `PAID`     |
| GET      | `/payments`         | Customer            | Payment history                                         |
| GET      | `/payments/:id`     | Owner / Admin       | Get payment details                                     |

### Reviews

| Method | Endpoint               | Auth     | Description                                                           |
| ------ | ---------------------- | -------- | --------------------------------------------------------------------- |
| POST   | `/reviews`             | Customer | Create review — only for gear in a `RETURNED` order the customer owns |
| GET    | `/reviews/:gearItemId` | Public   | Paginated reviews for a gear item + average rating                    |
| GET    | `/reviews/my-reviews`  | Customer | Reviews written by the logged-in customer                             |

### Admin

| Method | Endpoint           | Auth  | Description                                                           |
| ------ | ------------------ | ----- | --------------------------------------------------------------------- |
| GET    | `/admin/users`     | Admin | List users — filters: `role`, `status`, `searchTerm`, `page`, `limit` |
| PATCH  | `/admin/users/:id` | Admin | Suspend/activate a user                                               |
| GET    | `/admin/gear`      | Admin | List all gear listings                                                |
| GET    | `/admin/rentals`   | Admin | List all rental orders (filter: `status`)                             |

---

## 🗄️ Database Schema (summary)

- **User** — auth + role + status, has one `Profile`
- **Category** — gear categories
- **GearItems** — belongs to a `User` (provider) and a `Category`
- **RentalOrder** — belongs to a `User` (customer), has many `RentalOrderItem`, `Payment`, `Review`
- **RentalOrderItem** — join of `RentalOrder` ↔ `GearItems` with quantity/rate/subtotal
- **Payment** — belongs to `RentalOrder` and `User`, tracks `transactionId`, `status`, `paidAt`
- **Review** — belongs to `User` (customer), `GearItems`, and `RentalOrder`; unique per `(customer, gearItem, rentalOrder)`

Full schema lives in `prisma/schema/*.prisma`.

---

## 🎥 Postman Collection

Import `GearUp.postman_collection.json` (included in the repo/submission). It's organized into folders matching the modules above, with:

- Collection variables for `baseUrl` and per-role tokens (`customerAccessToken`, `providerAccessToken`, `adminAccessToken`)
- Test scripts on the three login requests that auto-save the returned token into the right variable
- Every request pre-filled with a working example body

Run order for a full demo: **Register (x3 roles) → Login (x3) → Create Category (admin) → Create Gear (provider) → Create Rental (customer) → Create Payment (customer) → Confirm Payment → Update Order Status (provider) → Create Review (customer) → Admin endpoints.**

---

## 📝 Known Limitations / TODO

- No seed script yet — admin account must be created manually (see above).
- No dedicated request-validation middleware (e.g. Zod/Joi) is wired in yet — most rules are enforced ad hoc inside services.
