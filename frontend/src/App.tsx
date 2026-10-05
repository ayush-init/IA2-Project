import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/books" replace />} />
            <Route path="books" element={<div className="card"><h2>Book Catalogue</h2></div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
