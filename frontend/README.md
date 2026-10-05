# ShelfLife — Frontend Web Application

The frontend client for **ShelfLife**, a modern College Library Management System built with **React**, **TypeScript**, and **Vite**, featuring an accessible, modern **Light Theme UI** and strict type safety.

---

## 1. Technology Stack

- **React 18**: Component-driven UI library
- **TypeScript 5.6**: End-to-end static type enforcement
- **Vite 6**: Ultra-fast build tool and development server with hot module replacement (HMR)
- **React Router DOM 7**: Declarative client-side routing and protected route architecture
- **Lucide React**: Modern, consistent icon set
- **CSS3 Variables**: Custom light-theme design system (clean typography, crisp slate text, soft surfaces, elevated cards, accessible status badges)

---

## 2. Light Theme Design System

Per the project design specifications, ShelfLife uses a **light, high-contrast palette** optimized for daylight academic library operations:

- **Background Canvas**: `#f8fafc` (Slate-50)
- **Surface & Cards**: `#ffffff` (Pure White) with subtle `#e2e8f0` borders and soft elevation
- **Typography**: `#0f172a` (Primary text), `#475569` (Secondary text), `#64748b` (Muted labels)
- **Primary Brand Accent**: `#4f46e5` (Indigo-600) with `#eef2ff` subtle active backgrounds
- **Status Badges**:
  - **Available / Returned**: `#ecfdf5` emerald background with `#065f46` text
  - **Issued / Active**: `#f0f9ff` sky background with `#0369a1` text
  - **Overdue**: `#fef2f2` ruby background with `#991b1b` text and glowing warning halo for immediate visual identification

---

## 3. Project Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx      # Route guard redirecting unauthenticated users to /login
│   │   ├── common/
│   │   │   └── DataTable.tsx          # Reusable Generic TypeScript Component: DataTable<T>
│   │   └── layout/
│   │       ├── Layout.tsx             # Master page wrapper with sticky navigation and footer
│   │       └── Navbar.tsx             # Global navigation bar with brand, routes, and auth status
│   ├── context/
│   │   └── AuthContext.tsx            # Global authentication state, session validation, JWT lifecycle
│   ├── pages/
│   │   ├── BooksPage.tsx              # Book catalogue with search, genre filter, pagination, add modal
│   │   ├── IssueBookPage.tsx          # Issue book & quick return desk with atomic copy tracking
│   │   ├── LoginPage.tsx              # Librarian login portal with demo credential helper
│   │   ├── MemberHistoryPage.tsx      # Member profile, stats, overdue badges, return actions
│   │   └── MembersPage.tsx            # Member directory, search, registration modal
│   ├── services/
│   │   └── api.ts                     # Fully typed REST API client with auto JWT bearer injection
│   ├── types/
│   │   └── index.ts                   # Domain interfaces (Book, Member, BorrowRecord, Pagination)
│   ├── App.tsx                        # Router tree and context provider mounting
│   ├── index.css                      # Global light theme stylesheet
│   ├── main.tsx                       # React DOM entry point
│   └── vite-env.d.ts                  # Vite client environment types
├── package.json
├── tsconfig.json
└── vite.config.ts                     # Vite config with API proxy to Express backend
```

---

## 4. Reusable Generic Component (`DataTable<T>`) — Q2(e)

The application implements a genuinely polymorphic table component [`DataTable<T>`](src/components/common/DataTable.tsx) that enforces strict type safety without resorting to `any`:

```tsx
export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  emptyMessage,
  onRowClick,
  rowStyle,
}: DataTableProps<T>): React.ReactElement { ... }
```

### Usages Across the Application:
1. **`BooksPage`**: `<DataTable<Book> ... />` with title, author, formatted ISBN code, genre badge, stock counts, and availability badge.
2. **`MembersPage`**: `<DataTable<Member> ... />` with member name, membership ID badge, email link, joined date, and navigation button.
3. **`MemberHistoryPage`**: `<DataTable<BorrowRecord> ... />` with dynamic row styling (`rowStyle`), formatted dates, glowing **OVERDUE** badges, and in-row return action buttons.

---

## 5. State Management Architecture Rationale — Q2(d)

As required by the assignment evaluation rubric, the following architectural analysis details the state management strategy adopted for ShelfLife:

### 1. Why Redux Was NOT Chosen
- **Unnecessary Overhead & Boilerplate**: Redux (or Redux Toolkit) requires slices, action creators, reducers, and selectors. For an application with four domain resources (Books, Members, BorrowRecords, Auth), introducing Redux would add considerable complexity without architectural benefit.
- **Academic & Maintenance Clarity**: A clean React architecture utilizing idiomatic React primitives (`createContext`, `useContext`, `useState`, `useCallback`) is significantly easier for examiners to evaluate, trace, and audit.
- **Avoiding Stale Local State**: Much of the library's data (book stock counts, borrow statuses) changes via server-side transactions. Managing large global normalized state trees in Redux often leads to synchronization drift between client cache and MongoDB inventory.

### 2. How Context + Local State Satisfies Current Scope
- **`AuthContext` for Global Identity**: Authentication state (current librarian user, JWT token, login/logout methods, session verification) is truly global application state. Storing this in `AuthContext` guarantees every route, layout component, and API request has instant, reactive access to librarian credentials and permissions.
- **Local State for View-Specific Lifecycles**:
  - Book search queries, active page numbers, genre filters, and modal toggles belong exclusively to `BooksPage`.
  - Issue form inputs (selected member, selected book, due date) belong exclusively to `IssueBookPage`.
  - Storing view state locally ensures clean teardown when navigating between views and prevents memory leaks.

### 3. Conditions Under Which Advanced State Tooling Would Be Justified
If ShelfLife expands from a single-desk college library application to a multi-campus enterprise system, the following tools would be justified:
1. **TanStack Query (React Query)**:
   - *Trigger*: When 500+ campus librarians simultaneously modify book records, necessitating automated server-state caching, background revalidation (`stale-while-revalidate`), optimistic UI updates, and request deduplication.
2. **Zustand or Redux Toolkit**:
   - *Trigger*: If complex offline draft carts (e.g., bulk batch checkout of 50 books for an entire classroom) or multi-step wizard workflows with undo/redo capability are required.
3. **WebSockets / Server-Sent Events (SSE)**:
   - *Trigger*: Real-time push notifications when a reserved book is checked in by another desk.

---

## 6. Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Running ShelfLife Backend API on `http://localhost:5000`

### Installation & Run

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at:
```
http://localhost:3000
```

### Production Build

```bash
npm run build
```
The output will be generated in `frontend/dist/`.

---

## 7. Demo Librarian Credentials

For evaluation and testing:
- **Email**: `librarian@shelflife.edu`
- **Password**: `Admin@12345`
*(A quick-fill button is provided on the `/login` page for instant authentication).*
