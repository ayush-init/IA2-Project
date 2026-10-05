import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-light)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          ShelfLife Library Management System &copy; {new Date().getFullYear()} — Full Stack Academic Project
        </div>
      </footer>
    </div>
  );
};
