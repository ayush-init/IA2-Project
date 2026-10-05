import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { BooksPage } from './pages/BooksPage';
import { IssueBookPage } from './pages/IssueBookPage';
import { MembersPage } from './pages/MembersPage';
import { MemberHistoryPage } from './pages/MemberHistoryPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/books" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="books" element={<BooksPage />} />

            {/* Authenticated Librarian Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="borrow" element={<IssueBookPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="members/:id/history" element={<MemberHistoryPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/books" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
