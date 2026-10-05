import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, BookUp, Users, LogOut, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          textDecoration: 'none',
          color: 'var(--text-primary)',
          fontWeight: 800,
          fontSize: '1.25rem',
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <BookOpen size={20} />
          </div>
          <span>Shelf<span style={{ color: 'var(--primary)' }}>Life</span></span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <NavLink
            to="/books"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.92rem',
              textDecoration: 'none',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <BookOpen size={17} />
            <span>Catalogue</span>
          </NavLink>

          <NavLink
            to="/borrow"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.92rem',
              textDecoration: 'none',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <BookUp size={17} />
            <span>Issue & Return</span>
          </NavLink>

          <NavLink
            to="/members"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.92rem',
              textDecoration: 'none',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <Users size={17} />
            <span>Members</span>
          </NavLink>
        </nav>

        {/* User / Authentication status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-muted)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>
                <Shield size={14} color="var(--primary)" />
                <span>{user.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                title="Log out of librarian account"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.88rem' }}
            >
              <LogIn size={15} />
              <span>Librarian Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
