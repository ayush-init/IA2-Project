import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  History,
  Mail,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Member, PaginationMetadata } from '../types';
import { api } from '../services/api';

export const MembersPage: React.FC = () => {
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', membershipId: '' });

  const fetchMembers = useCallback(async (page = pagination.page, search = searchTerm) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.members.getAll({
        page,
        limit: pagination.limit,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setMembers(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load member records');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, searchTerm, pagination.page]);

  useEffect(() => {
    fetchMembers(pagination.page, searchTerm);
  }, [pagination.page, searchTerm, fetchMembers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newMember.name.trim() || !newMember.email.trim() || !newMember.membershipId.trim()) {
      setFormError('All fields are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.members.create({
        name: newMember.name.trim(),
        email: newMember.email.trim().toLowerCase(),
        membershipId: newMember.membershipId.trim().toUpperCase(),
      });

      if (res.success && res.data) {
        setSuccessToast(`Member "${res.data.name}" registered successfully!`);
        setTimeout(() => setSuccessToast(null), 4000);
        setShowAddModal(false);
        setNewMember({ name: '', email: '', membershipId: '' });
        fetchMembers(1);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to register member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {successToast && (
        <div className="alert alert-success" style={{
          position: 'fixed',
          top: '5rem',
          right: '1.5rem',
          zIndex: 9999,
          boxShadow: 'var(--shadow-lg)',
        }}>
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Library Members Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            Manage registered students and faculty members or inspect their borrowing histories.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.15rem' }}
        >
          <Plus size={18} />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '480px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" style={{
              position: 'absolute',
              top: '50%',
              left: '0.85rem',
              transform: 'translateY(-50%)',
            }} />
            <input
              type="text"
              placeholder="Search by name, email, or Membership ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearchTerm(''); }}
              className="btn btn-secondary"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Members Table */}
      {isLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading members directory...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <AlertCircle size={36} color="var(--danger-text)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--danger-text)', marginBottom: '1rem' }}>{error}</p>
          <button onClick={() => fetchMembers()} className="btn btn-secondary">
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Users size={42} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Members Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {searchTerm
              ? `No members match search query "${searchTerm}".`
              : 'No library members registered yet. Click "Register New Member" above.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Membership ID</th>
                <th>Email Address</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'center' }}>Borrow History</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.name}
                  </td>
                  <td>
                    <code style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      backgroundColor: 'var(--bg-muted)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                    }}>
                      {m.membershipId}
                    </code>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <span>{m.email}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    {new Date(m.joinedDate).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/members/${m._id}/history`)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                    >
                      <History size={15} color="var(--primary)" />
                      <span>View History</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Registration Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div className="card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                color: 'var(--text-muted)',
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Register Member
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Enrolls student or staff member into the ShelfLife library database.
            </p>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMember}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya.lin@campus.edu"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Membership ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MEM-2026-088"
                  value={newMember.membershipId}
                  onChange={(e) => setNewMember({ ...newMember, membershipId: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register Member</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
