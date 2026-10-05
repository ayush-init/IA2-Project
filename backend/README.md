# ShelfLife — Backend REST API (Node.js, Express, TypeScript & MongoDB)

The backend service for **ShelfLife**, a college library management platform designed to manage books, members, borrowing transactions, and librarian authentication with atomic concurrency controls.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [API Documentation](#api-documentation)
- [Sample curl Requests](#sample-curl-requests)
- [Concurrency & Race-Condition Strategy](#concurrency--race-condition-strategy)
- [Middleware & Error Handling](#middleware--error-handling)

---

## 🌟 Overview

The ShelfLife API provides a RESTful interface for college librarians to:
1. Register and search books with pagination and genre filters.
2. Register and search library members.
3. Issue books to members safely without double-allocation race conditions.
4. Process returns and restore inventory counts.
5. Retrieve comprehensive borrowing histories for members with dynamic overdue computation.
6. Authenticate librarians using industry-standard JSON Web Tokens (JWT) and bcrypt password hashing.

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: v5.0 or higher (local instance or MongoDB Atlas URI)

---

## 🔐 Environment Configuration

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default Value |
|---|---|---|
| `PORT` | Port for the Express server to listen on | `5000` |
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection connection string | `mongodb://127.0.0.1:27017/shelflife` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `super_secret_shelflife_jwt_key_ia2_exam_2026` |
| `JWT_EXPIRES_IN` | Token expiration duration | `24h` |
| `DEFAULT_LIBRARIAN_EMAIL` | Auto-seeded librarian login email | `librarian@shelflife.edu` |
| `DEFAULT_LIBRARIAN_PASSWORD` | Auto-seeded librarian login password | `Admin@12345` |
| `DEFAULT_LIBRARIAN_NAME` | Auto-seeded librarian display name | `Campus Librarian` |

> **Note**: On server boot, if no librarian account exists with `DEFAULT_LIBRARIAN_EMAIL`, the server will automatically seed the default librarian account so the application is ready for immediate evaluation.

---

## 📦 Installation & Setup

```bash
cd backend
npm install
```

---

## 🚀 Running the Application

### Development Mode (with hot-reload via tsx)
```bash
npm run dev
```

### Production Build & Execution
```bash
npm run build
npm start
```

The server will boot and display:
```text
===============================================
  ShelfLife API Server Running!
  Environment : development
  Port        : 5000
  Health Check: http://localhost:5000/api/health
===============================================
```

---

## 🧪 Running Tests

The test suite uses **Vitest**, **Supertest**, and **MongoMemoryServer** for in-memory, zero-dependency database integration testing.

```bash
# Run all unit and integration tests
npm test

# Run type-checking without emitting files
npm run typecheck
```

---

## 📁 Architecture & Folder Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── db.ts               # Mongoose connection & disconnect lifecycle
│   │   └── env.ts              # Strongly-typed environment variables
│   ├── controllers/
│   │   ├── auth.controller.ts  # Login and profile handlers
│   │   ├── book.controller.ts  # Book creation, listing, search & genres
│   │   ├── member.controller.ts# Member registration, search & history
│   │   ├── borrow.controller.ts# Atomic issue book logic
│   │   └── return.controller.ts# Safe book return logic
│   ├── middleware/
│   │   ├── auth.ts             # JWT Bearer token authentication guard
│   │   ├── errorHandler.ts     # Centralized error handler & AppError
│   │   ├── logger.ts           # Morgan HTTP request logging
│   │   └── validate.ts         # Generic Zod request schema validator
│   ├── models/
│   │   ├── Book.ts             # Book schema, copy invariants & indexes
│   │   ├── Member.ts           # Member schema, email validation & indexes
│   │   ├── BorrowRecord.ts     # Borrow transaction schema & refs
│   │   ├── Librarian.ts        # Librarian auth schema & bcrypt methods
│   │   └── index.ts            # Barrel export for models
│   ├── routes/
│   │   ├── auth.routes.ts      # /api/auth routes
│   │   ├── book.routes.ts      # /api/books routes
│   │   ├── member.routes.ts    # /api/members routes
│   │   ├── borrow.routes.ts    # /api/borrow routes
│   │   └── return.routes.ts    # /api/return routes
│   ├── utils/
│   │   └── seed.ts             # Automatic initial admin seeder
│   ├── validators/
│   │   ├── auth.validator.ts   # Zod schema for login
│   │   ├── book.validator.ts   # Zod schema for book creation & query
│   │   ├── member.validator.ts # Zod schema for member creation & query
│   │   └── borrow.validator.ts # Zod schema for issuing books
│   ├── app.ts                  # Express application setup & middleware chain
│   └── server.ts               # HTTP server bootstrap & graceful shutdown
├── tests/
│   ├── auth.test.ts            # Authentication integration tests
│   ├── books.test.ts           # Book creation, search & pagination tests
│   ├── borrow.test.ts          # Issue book & concurrency race condition tests
│   ├── db-helper.ts            # MongoMemoryServer lifecycle helper
│   ├── errorHandler.test.ts    # Centralized error handler unit tests
│   ├── health.test.ts          # Health check & 404 handler tests
│   ├── member-history.test.ts  # Member borrow history & dynamic overdue tests
│   ├── members.test.ts         # Member registration & duplicate check tests
│   └── models.test.ts          # Mongoose schema validation tests
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📡 API Documentation

### 1. Health Check
- **`GET /api/health`**
  - Public
  - Returns server health status and timestamp.

### 2. Authentication
- **`POST /api/auth/login`**
  - Public
  - Body: `{ "email": "...", "password": "..." }`
  - Returns: JWT token and librarian details.
- **`GET /api/auth/me`**
  - Protected (`Bearer <token>`)
  - Returns currently authenticated librarian.

### 3. Books
- **`GET /api/books`**
  - Public
  - Query parameters:
    - `page` (default: 1)
    - `limit` (default: 10)
    - `genre` (optional filter)
    - `search` (optional search across title, author, and ISBN)
  - Returns: Paginated book list and pagination metadata.
- **`GET /api/books/genres`**
  - Public
  - Returns distinct list of book genres.
- **`GET /api/books/:id`**
  - Public
  - Returns details of a specific book.
- **`POST /api/books`**
  - Protected (`Bearer <token>`)
  - Body: `{ "title": "...", "author": "...", "ISBN": "...", "genre": "...", "totalCopies": 5, "availableCopies": 5 }`
  - Returns: Created book (201 Created).

### 4. Members
- **`GET /api/members`**
  - Protected (`Bearer <token>`)
  - Query parameters: `page`, `limit`, `search`
  - Returns: Paginated member list.
- **`GET /api/members/:id`**
  - Protected (`Bearer <token>`)
  - Returns single member details.
- **`POST /api/members`**
  - Protected (`Bearer <token>`)
  - Body: `{ "name": "...", "email": "...", "membershipId": "..." }`
  - Returns: Created member (201 Created).
- **`GET /api/members/:id/history`**
  - Protected (`Bearer <token>`)
  - Returns member's full borrowing history with dynamic overdue calculation and summary statistics.

### 5. Borrowing & Returning
- **`POST /api/borrow`**
  - Protected (`Bearer <token>`)
  - Body: `{ "bookId": "...", "memberId": "...", "dueDate": "YYYY-MM-DD" }`
  - Returns: Created `BorrowRecord` (201 Created) and decrements book inventory atomically.
- **`POST /api/return/:borrowId`**
  - Protected (`Bearer <token>`)
  - Returns: Updated `BorrowRecord` with `returnDate`, `status: "returned"`, and increments book inventory.

---

## 💻 Sample curl Requests

### 1. Authenticate Librarian
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"librarian@shelflife.edu","password":"Admin@12345"}'
```

*Response:*
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "67a21f8...",
    "name": "Campus Librarian",
    "email": "librarian@shelflife.edu",
    "role": "librarian"
  }
}
```

### 2. Add a New Book
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "title": "Design Patterns: Elements of Reusable Object-Oriented Software",
    "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    "ISBN": "978-0201633610",
    "genre": "Software Engineering",
    "totalCopies": 5,
    "availableCopies": 5
  }'
```

### 3. List Books with Pagination & Filters
```bash
curl -X GET "http://localhost:5000/api/books?page=1&limit=10&genre=Software%20Engineering&search=Patterns"
```

### 4. Register a New Member
```bash
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "name": "Alex Morgan",
    "email": "alex.morgan@campus.edu",
    "membershipId": "MEM-2026-1042"
  }'
```

### 5. Issue a Book (Atomic Operation)
```bash
curl -X POST http://localhost:5000/api/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "bookId": "<BOOK_ID>",
    "memberId": "<MEMBER_ID>",
    "dueDate": "2026-10-25T00:00:00.000Z"
  }'
```

### 6. Return a Book
```bash
curl -X POST http://localhost:5000/api/return/<BORROW_ID> \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 7. View Member Borrowing History
```bash
curl -X GET http://localhost:5000/api/members/<MEMBER_ID>/history \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 🔒 Concurrency & Race-Condition Strategy

### The Problem
If two librarians simultaneously issue the last available copy of a book (`availableCopies = 1`), a naive implementation:
1. Thread A: Finds book (`availableCopies = 1`)
2. Thread B: Finds book (`availableCopies = 1`)
3. Thread A: Sets `availableCopies = 0` and saves
4. Thread B: Sets `availableCopies = -1` and saves

This causes negative inventory and duplicate book issuance.

### The Solution: Atomic Conditional Update
ShelfLife uses MongoDB's atomic document-level locking via `findOneAndUpdate`:

```typescript
const updatedBook = await Book.findOneAndUpdate(
  { _id: bookId, availableCopies: { $gt: 0 } },
  { $inc: { availableCopies: -1 } },
  { new: true }
);

if (!updatedBook) {
  throw new AppError("No available copies remaining for this book", 400);
}
```

1. **Atomic Check & Decrement**: The criteria `availableCopies: { $gt: 0 }` is evaluated inside the database write lock simultaneously with `$inc: -1`.
2. **Race Immunity**: The first request decrements `availableCopies` from `1` to `0`. The second request finds `0` matches because `availableCopies` is no longer `> 0`. It returns `null` immediately and aborts with a HTTP 400 error.
3. **Transaction Rollback Compensation**: If the subsequent `BorrowRecord.create()` step encounters any error, a compensating update (`$inc: { availableCopies: 1 }`) is triggered to maintain database integrity.

---

## 🛡️ Middleware & Error Handling

- **`errorHandler`**: Centralized middleware mapping errors to standard JSON payloads:
  - `ZodError` → 400 Bad Request with field-level issues
  - `ValidationError` → 400 Bad Request
  - `CastError` (invalid ObjectId) → 400 Bad Request
  - `MongoError (11000)` → 409 Conflict with duplicate field name
  - `JsonWebTokenError` / `TokenExpiredError` → 401 Unauthorized
  - `AppError` → Custom status code and operational message
- **`requestLogger`**: Morgan-powered structured console logger capturing HTTP method, path, response status, and response latency while omitting secrets.
- **`requireAuth`**: Validates JWT Bearer tokens from the `Authorization` header and attaches the authenticated librarian identity to `req.user`.
