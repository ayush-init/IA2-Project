# ShelfLife — College Library Management System

[![Build Status](https://img.shields.io/badge/Backend%20Tests-53%20Passing-success?style=flat-square&logo=vitest)](backend)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript%20%2B%20Vite-blue?style=flat-square&logo=react)](frontend)
[![UI Theme](https://img.shields.io/badge/Theme-Light%20UI%20Mode-informational?style=flat-square)](frontend)
[![System Design](https://img.shields.io/badge/Architecture-Enterprise%20Multi--Campus-purple?style=flat-square)](system-design/system-design.md)

ShelfLife is a full-stack, enterprise-grade College Library Management System engineered to streamline book cataloguing, member management, and atomic circulation transactions (issue & return) across academic institutions.

Built strictly in compliance with the **Information Assurance 2 (IA2) Full-Stack Examination Specification**, this repository features a robust Node.js/Express/TypeScript backend, an accessible light-themed React/TypeScript frontend, comprehensive integration test suites, and extensive system architecture documentation.

---

## 1. Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Backend API** | Node.js (v18+), Express.js, TypeScript 5.6, Mongoose 8.9, MongoDB |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing, Bearer auth middleware |
| **Validation** | Zod (strict schema validation on params, query, body) |
| **Logging & Utils** | Morgan request logging, custom centralized `AppError` and `errorHandler` |
| **Automated Testing** | Vitest 3.0, Supertest 7.0, `mongodb-memory-server` 10.1 (in-memory test DB) |
| **Frontend Client** | React 18, TypeScript 5.6, Vite 6, React Router DOM 7, Lucide Icons |
| **UI Design System** | Modern Light Theme (CSS Variables, high-contrast typography, accessible status badges) |
| **System Architecture** | Mermaid diagrams, CDN, ALB, Horizontal Express, Redis Caching, Sharded MongoDB |

---

## 2. Repository Layout

```text
IA2-Project/
├── backend/                         # Section A: Express / TypeScript / MongoDB Backend (20 Marks)
│   ├── src/
│   │   ├── config/                  # Database connection and environment loaders
│   │   ├── controllers/             # Auth, Books, Members, Borrow controllers
│   │   ├── middleware/              # JWT auth guard, request logger, centralized error handler, Zod validator
│   │   ├── models/                  # Mongoose models: Book, Member, BorrowRecord, Librarian
│   │   ├── routes/                  # Express route definitions
│   │   ├── utils/                   # Database seed utilities (default librarian, books, members)
│   │   ├── validators/              # Zod validation schemas
│   │   ├── app.ts                   # Express app configuration and middleware mounting
│   │   └── server.ts                # Server bootstrap and graceful shutdown handler
│   ├── tests/                       # 53 comprehensive integration and unit tests (9 test files)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md                    # Detailed backend API documentation and curl samples
│
├── frontend/                        # Section B: React / TypeScript / Vite Client (20 Marks)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                # ProtectedRoute guard
│   │   │   ├── common/              # Generic Reusable Component: DataTable<T>
│   │   │   └── layout/              # Navbar and Master Layout
│   │   ├── context/                 # AuthContext (JWT session lifecycle and login state)
│   │   ├── pages/                   # BooksPage, IssueBookPage, MembersPage, MemberHistoryPage, LoginPage
│   │   ├── services/                # Typed REST API client with auto-injected Bearer tokens
│   │   ├── types/                   # TypeScript domain contracts
│   │   ├── App.tsx                  # Client-side router tree
│   │   ├── index.css                # Polished Light Theme CSS design system
│   │   └── main.tsx                 # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md                    # Detailed frontend documentation and state management note
│
├── system-design/                   # Section C: Scalability & Architecture (10 Marks)
│   └── system-design.md             # In-depth architectural analysis covering Q3(a) through Q3(e)
│
├── IA2_FullStack_Exam.pdf           # Authoritative assignment specification
└── README.md                        # Master repository guide and evaluation rubric mapping
```

---

## 3. Quick Start Guide

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- MongoDB: The backend includes an **automatic in-memory fallback** via `mongodb-memory-server` if no local MongoDB service is running at `127.0.0.1:27017`. You can also configure an external MongoDB or Atlas connection URI via `MONGODB_URI` in `backend/.env`.

---

### Step 1: Start the Backend API

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env from template (defaults to port 5000 and localhost MongoDB)
cp .env.example .env

# 4. Run automated test suite (53 tests across 9 test files)
npm test

# 5. Start the backend development server
npm run dev
```

The backend API will start on:
```
http://localhost:5000
```
*(On startup, an evaluation librarian account `librarian@shelflife.edu` / `Admin@12345`, 5 academic books, and 3 members are automatically seeded).*

---

### Step 2: Start the Frontend Client

Open a second terminal window:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start Vite development server
npm run dev
```

The frontend application will be live at:
```
http://localhost:3000
```

---

## 4. Evaluation Credentials

For testing librarian actions (adding books, registering members, issuing books, returning books):

- **Email**: `librarian@shelflife.edu`
- **Password**: `Admin@12345`

*(On the `/login` page, click **"Fill default credentials"** for instant 1-click evaluation).*

---

## 5. Assignment Traceability Matrix (IA2 PDF Mapping)

This repository fulfills the requirements specified in `IA2_FullStack_Exam.pdf`:

### Section A: Backend Development (20 Marks)

| Question | Exam Requirement | Implementation File(s) | Verification Status |
| :--- | :--- | :--- | :--- |
| **Q1(a)** | **Data Models / Schemas**: Mongoose schemas for Book, Member, and BorrowRecord with data types, validation rules, unique constraints, and copy invariants (`availableCopies <= totalCopies`). | [`Book.ts`](backend/src/models/Book.ts), [`Member.ts`](backend/src/models/Member.ts), [`BorrowRecord.ts`](backend/src/models/BorrowRecord.ts) | Verified via [`models.test.ts`](backend/tests/models.test.ts) |
| **Q1(b)** | **REST Endpoints**: `POST /api/books`, `GET /api/books` (pagination & filter), `POST /api/members`, `POST /api/borrow`, `POST /api/return/:borrowId`, `GET /api/members/:id/history`. | [`books.controller.ts`](backend/src/controllers/books.controller.ts), [`members.controller.ts`](backend/src/controllers/members.controller.ts), [`borrow.controller.ts`](backend/src/controllers/borrow.controller.ts) | Verified via [`books.test.ts`](backend/tests/books.test.ts), [`members.test.ts`](backend/tests/members.test.ts), [`borrow.test.ts`](backend/tests/borrow.test.ts) |
| **Q1(c)** | **Middleware**: Centralized error handling, request logging (Morgan), and input validation (Zod). | [`errorHandler.ts`](backend/src/middleware/errorHandler.ts), [`logger.ts`](backend/src/middleware/logger.ts), [`validate.ts`](backend/src/middleware/validate.ts) | Verified via [`errorHandler.test.ts`](backend/tests/errorHandler.test.ts) |
| **Q1(d)** | **Authentication Layer**: `/api/auth/login` route issuing JWT, and `requireAuth` middleware protecting write/borrow/return routes. | [`auth.controller.ts`](backend/src/controllers/auth.controller.ts), [`auth.ts`](backend/src/middleware/auth.ts), [`Librarian.ts`](backend/src/models/Librarian.ts) | Verified via [`auth.test.ts`](backend/tests/auth.test.ts) |
| **Q1(e)** | **Concurrency & Race Condition Prevention**: Note / explanation and implementation on preventing two librarians from issuing the last copy simultaneously. | [`borrow.controller.ts`](backend/src/controllers/borrow.controller.ts), [`backend/README.md`](backend/README.md#concurrency-control-strategy-q1e) | Verified via [`borrow.test.ts`](backend/tests/borrow.test.ts) |

---

### Section B: Frontend Development (20 Marks)

| Question | Exam Requirement | Implementation File(s) | Verification Status |
| :--- | :--- | :--- | :--- |
| **Q2(a)** | **TypeScript Interfaces & Typed API Client**: Typed models for Book, Member, BorrowRecord matching backend schema, and typed API client (`api.ts`). | [`types/index.ts`](frontend/src/types/index.ts), [`api.ts`](frontend/src/services/api.ts) | Verified via `npm run build` |
| **Q2(b)** | **Book List Page**: Display books in table/grid, title search, genre dropdown, useState/useEffect, loading and error states. | [`BooksPage.tsx`](frontend/src/pages/BooksPage.tsx) | Interactive & functional in browser |
| **Q2(c)** | **Issue Book Form**: Member and book selector, submit to `POST /api/borrow`, success/error toast, and disabled submit button while in flight. | [`IssueBookPage.tsx`](frontend/src/pages/IssueBookPage.tsx) | Interactive & functional in browser |
| **Q2(d)** | **Member History Page**: Member's BorrowRecord list with visually distinct badge for overdue items (`dueDate < today` and not returned). | [`MemberHistoryPage.tsx`](frontend/src/pages/MemberHistoryPage.tsx) | Interactive & functional in browser |
| **Q2(e)** | **Generic Reusable Component**: Typed generic component `<DataTable<T>>` reused across Book catalogue, Members directory, and Member History. | [`DataTable.tsx`](frontend/src/components/common/DataTable.tsx) | Verified generic polymorphism |
| **Q2(f)** | **Client-Side Route Protection**: Protected route wrapper redirecting unauthenticated users to `/login` via React Router. | [`ProtectedRoute.tsx`](frontend/src/components/auth/ProtectedRoute.tsx) | Verified route redirect |
| **Deliverable** | **State Management Note**: Written rationale explaining local state vs Context vs libraries (Redux). | [`frontend/README.md`](frontend/README.md#5-state-management-architecture-rationale--q2d) | Detailed technical note |

---

### Section C: System Design (10 Marks)

| Question | Exam Requirement | Implementation Document | Details Included |
| :--- | :--- | :--- | :--- |
| **Q3(a)** | **System Architecture**: High-level architecture with client, API layer, database, cache, load balancing and other relevant components. | [`system-design/system-design.md`](system-design/system-design.md) | Mermaid architecture diagram and architecture explanation |
| **Q3(b)** | **Database Scaling & Sharding**: Single MongoDB cluster vs sharding, with shard keys for Book and BorrowRecord and justification. | [`system-design/system-design.md`](system-design/system-design.md) | Sharding strategy and query-pattern justification |
| **Q3(c)** | **Caching Strategy**: Identify the most read-heavy operation and explain cached data, invalidation and TTL. | [`system-design/system-design.md`](system-design/system-design.md) | Redis caching strategy, cache keys, TTL and invalidation |
| **Q3(d)** | **Concurrency Control**: Prevent `availableCopies` from becoming negative during concurrent issue operations. | [`system-design/system-design.md`](system-design/system-design.md) | Atomic conditional update / concurrency strategy and trade-offs |
| **Q3(e)** | **10× Traffic Spike**: Handle semester traffic spikes without permanently over-provisioning infrastructure. | [`system-design/system-design.md`](system-design/system-design.md) | Autoscaling, caching, load balancing and traffic management |

---

## 6. System Design

The complete scalable system design, including the architecture diagram, database scaling, caching strategy, concurrency control, and 10× traffic handling, is available here:

[View System Design](system-design/system-design.md)

---

## 7. Atomic Concurrency Implementation

The critical checkout operation (`POST /api/borrow`) is protected against race conditions using MongoDB's atomic conditional compare-and-swap (CAS) mechanics:

```typescript
// Atomically decrement ONLY IF availableCopies > 0
const updatedBook = await Book.findOneAndUpdate(
  {
    _id: bookId,
    availableCopies: { $gt: 0 }, // Atomic precondition check
  },
  {
    $inc: { availableCopies: -1 }, // Atomic decrement
  },
  {
    new: true,
    runValidators: true,
  }
);

if (!updatedBook) {
  // If another concurrent request took the last copy, updatedBook is null
  throw new AppError('This book is currently out of stock or has no available copies.', 400);
}
```

This guarantee is tested in [`borrow.test.ts`](backend/tests/borrow.test.ts):
- Concurrent requests compete for a book with only 1 available copy.
- Exactly 1 request succeeds (HTTP 201).
- Subsequent competing requests fail immediately with HTTP 400 (Out of Stock).
- Zero overselling occurs, and `availableCopies` ends at exactly 0.

---

## 8. Sample API cURL Commands

### 1. Librarian Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"librarian@shelflife.edu","password":"Admin@12345"}'
```

### 2. Search Books Catalogue
```bash
curl -X GET "http://localhost:5000/api/books?page=1&limit=5&genre=Computer+Science"
```

### 3. Add a New Book (Requires Token)
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

### 4. Register a New Member (Requires Token)
```bash
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "name": "Sarah Connor",
    "email": "sarah.connor@campus.edu",
    "membershipId": "MEM-2026-042"
  }'
```

### 5. Issue a Book Atomically (Requires Token)
```bash
curl -X POST http://localhost:5000/api/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "bookId": "<BOOK_ID>",
    "memberId": "<MEMBER_ID>",
    "dueDate": "2026-11-01T00:00:00.000Z"
  }'
```

### 6. Return a Book (Requires Token)
```bash
curl -X POST http://localhost:5000/api/return/<BORROW_RECORD_ID> \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 7. View Member Borrow History (Dynamic Overdue Calculation)
```bash
curl -X GET http://localhost:5000/api/members/<MEMBER_ID>/history \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 9. Verification & Test Execution

Run the complete backend integration test suite:

```bash
cd backend
npm test
```

Expected Output:
```text
 ✓ tests/models.test.ts (7 tests)
 ✓ tests/errorHandler.test.ts (5 tests)
 ✓ tests/health.test.ts (2 tests)
 ✓ tests/member-history.test.ts (3 tests)
 ✓ tests/return.test.ts (5 tests)
 ✓ tests/auth.test.ts (8 tests)
 ✓ tests/borrow.test.ts (6 tests)
 ✓ tests/members.test.ts (7 tests)
 ✓ tests/books.test.ts (10 tests)

 Test Files  9 passed (9)
      Tests  53 passed (53)
   Duration  ~4s
```

Compile the frontend production bundle:

```bash
cd frontend
npm run build
```

Expected Output:
```text
vite v6.4.3 building for production...
✓ 1922 modules transformed.
dist/index.html                   0.80 kB
dist/assets/index-YU0wNk5g.css    4.78 kB
dist/assets/index-9RXiCDFZ.js   233.76 kB
✓ built in ~6s
```

---

## 10. License

This project is created for academic submission and examination under the Information Assurance 2 (IA2) curriculum.
