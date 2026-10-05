import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/books" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="books" element={<div className="card"><h2>Book Catalogue</h2></div>} />

            {/* Authenticated Librarian Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="borrow" element={<div className="card"><h2>Issue Book</h2></div>} />
              <Route path="members" element={<div className="card"><h2>Members Directory</h2></div>} />
              <Route path="members/:id/history" element={<div className="card"><h2>Member History</h2></div>} />
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
