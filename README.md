# Chirpy

A RESTful backend API for a small social platform where users can create, manage, and interact with short text posts called **chirps**.

Chirpy is built with **TypeScript, Node.js, Express, PostgreSQL, and Drizzle ORM**, with a focus on backend fundamentals such as authentication, authorization, database design, API structure, error handling, and layered architecture.

> This project was originally built as part of the [Boot.dev](https://www.boot.dev/) Chirpy course and was later refactored and reorganized to practice production-oriented backend architecture and code organization.

---

## ✨ Features

### User Management

* User registration
* User login
* Password hashing with Argon2
* Update user profile and password
* Chirpy Red account upgrades

### Authentication & Authorization

* JWT-based authentication
* Refresh token authentication
* Refresh token revocation
* Protected API routes
* User ownership checks for protected resources
* API key authentication for webhooks

### Chirps

* Create chirps
* Get all chirps
* Get a chirp by ID
* Filter chirps by author
* Sort chirps in ascending or descending order
* Delete your own chirps
* Automatic profanity filtering
* 140-character limit

### Webhooks

* Polka webhook integration
* Idempotent Chirpy Red upgrades
* API key verification

### Admin

* File server metrics
* Development-only database reset endpoint

### Developer Experience

* TypeScript with strict mode
* Drizzle ORM migrations
* PostgreSQL
* Unit tests with Vitest
* Docker-compatible database setup
* Layered backend architecture
* Centralized error handling
* Environment-based configuration

---

## 🛠️ Tech Stack

| Category            | Technology  |
| ------------------- | ----------- |
| Language            | TypeScript  |
| Runtime             | Node.js     |
| Framework           | Express     |
| Database            | PostgreSQL  |
| ORM                 | Drizzle ORM |
| Authentication      | JWT         |
| Password Hashing    | Argon2      |
| Testing             | Vitest      |
| Package Manager     | npm         |
| Development         | WSL / Linux |
| Database Migrations | Drizzle Kit |

---

## 🏗️ Architecture

The application follows a layered structure to keep HTTP handling, business logic, and database access separated.

```text
Request
   │
   ▼
Routes
   │
   ▼
Middleware
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Database Queries
   │
   ▼
PostgreSQL
```

### Project Structure

```text
src/
├── app/
│   ├── assets/
│   │   └── logo.png
│   └── index.html
│
├── controllers/
│   ├── admin.controller.ts
│   ├── auth.controller.ts
│   ├── chirps.controller.ts
│   ├── users.controller.ts
│   └── webhooks.controller.ts
│
├── db/
│   ├── migrations/
│   ├── queries/
│   │   ├── chirps.ts
│   │   ├── refreshTokens.ts
│   │   └── users.ts
│   ├── index.ts
│   └── schema.ts
│
├── errors/
│   └── http-errors.ts
│
├── middleware/
│   ├── auth.ts
│   ├── error-handler.ts
│   ├── logging.ts
│   └── metrics.ts
│
├── routes/
│   ├── admin.routes.ts
│   ├── auth.routes.ts
│   ├── chirps.routes.ts
│   ├── users.routes.ts
│   └── webhooks.routes.ts
│
├── services/
│   ├── auth.service.ts
│   ├── chirp.service.ts
│   └── user.service.ts
│
├── auth.ts
├── config.ts
├── index.ts
└── auth.test.ts
```

The main goal of this structure is to avoid putting business logic directly inside route handlers.

For example:

* **Routes** define endpoints and middleware.
* **Controllers** handle HTTP requests and responses.
* **Services** contain application/business logic.
* **Database queries** handle persistence.
* **Middleware** handles cross-cutting concerns such as authentication, logging, metrics, and errors.

---

## 🔐 Authentication Flow

Chirpy uses short-lived JWT access tokens together with long-lived refresh tokens.

```text
Login
  │
  ├── Verify email + password
  │
  ├── Generate JWT
  │
  └── Create refresh token
          │
          ▼
      Client receives
      access + refresh token
```

Protected requests use the access token:

```http
Authorization: Bearer <access-token>
```

When the access token expires, the refresh token can be used to obtain a new access token.

Refresh tokens are stored in PostgreSQL and can be revoked.

---

## 🔑 API Overview

### Health

```http
GET /healthz
```

Returns the health status of the API.

### Users

```http
POST /api/users
PUT /api/users
```

Create a user or update the authenticated user's profile.

### Authentication

```http
POST /api/login
POST /api/refresh
POST /api/revoke
```

Handles login, access-token refresh, and refresh-token revocation.

### Chirps

```http
POST   /api/chirps
GET    /api/chirps
GET    /api/chirps/:chirpId
DELETE /api/chirps/:chirpId
```

Chirps can also be filtered and sorted:

```http
GET /api/chirps?authorId=<user-id>
GET /api/chirps?sort=desc
```

### Admin

```http
GET  /admin/metrics
POST /admin/reset
```

The reset endpoint is restricted to the development environment.

### Webhooks

```http
POST /api/polka/webhooks
```

Handles supported Polka webhook events using API key authentication.

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js 22+
* npm
* PostgreSQL
* Git

### 1. Clone the repository

```bash
git clone https://github.com/WafaaAlshaikh/chirpy.git
cd chirpy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=8080
PLATFORM=dev
DB_URL=postgres://username:password@localhost:5432/chirpy
JWT_SECRET=your-secret-key
POLKA_KEY=your-polka-api-key
```

Do not commit your `.env` file to Git.

### 4. Run database migrations

```bash
npx drizzle-kit migrate
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:8080
```

---

## 🧪 Testing

Run the test suite with:

```bash
npm run test
```

The project currently includes tests for authentication functionality such as:

* JWT creation and validation
* Expired JWT rejection
* Invalid JWT secret rejection
* Password hashing
* Password verification
* Bearer token extraction

---

## 📚 What I Practiced

This project provided hands-on practice with several backend concepts:

* REST API design
* Express.js
* TypeScript
* PostgreSQL
* Relational database design
* Database migrations
* Drizzle ORM
* JWT authentication
* Refresh tokens
* Password hashing
* Authorization
* Middleware
* Error handling
* Webhooks
* Unit testing
* Layered architecture
* Git and GitHub
* Environment configuration

---
## 📄 License

This project is intended for educational and portfolio purposes.
