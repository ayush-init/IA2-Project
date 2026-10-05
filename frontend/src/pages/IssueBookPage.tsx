import React, { useState, useEffect } from 'react';
import {
  BookUp,
  RotateCcw,
  Calendar,
  User,
  Book,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  X,
} from 'lucide-react';
import { Book as BookType, Member, BorrowRecord } from '../types';
import { api } from '../services/api';

export const IssueBookPage: React.FC = () => {
  // Tab state: 'issue' or 'return'
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue');

  // Available Data
  const [availableBooks, setAvailableBooks] = useState<BookType[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Form State (Issue)
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(() => {
    // Default to 14 days from today
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  // Return Form State
  const [returnBorrowId, setReturnBorrowId] = useState<string>('');

  // Quick Member Registration Modal State
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', membershipId: '' });
  const [isRegisteringMember, setIsRegisteringMember] = useState<boolean>(false);
  const [memberModalError, setMemberModalError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentTransaction, setRecentTransaction] = useState<BorrowRecord | null>(null);

  // Fetch initial books & members
  const loadFormData = async () => {
    try {
      setIsLoadingData(true);
      const [booksRes, membersRes] = await Promise.all([
        api.books.getAll({ limit: 100 }),
        api.members.getAll({ limit: 100 }),
      ]);

      if (booksRes.success) {
        // Show all books, highlighting those with available copies
        setAvailableBooks(booksRes.data);
      }
      if (membersRes.success) {
        setMembers(membersRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load form prerequisites', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  // Set Due Date helper presets
  const setPresetDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  // Handle Book Issue Submit
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setRecentTransaction(null);

    if (!selectedBookId) {
      setErrorMessage('Please select a book to issue.');
      return;
    }

    if (!selectedMemberId) {
      setErrorMessage('Please select a library member.');
      return;
    }

    if (!dueDate) {
      setErrorMessage('Please specify a return due date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.borrow.issue({
        bookId: selectedBookId,
        memberId: selectedMemberId,
        dueDate: new Date(dueDate).toISOString(),
      });

      if (res.success && res.data) {
        setSuccessMessage(res.message || 'Book successfully issued!');
        setRecentTransaction(res.data);

        // Reset form selections
        setSelectedBookId('');
        // Reload data to reflect decremented available copies
        loadFormData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to issue book. Please check availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Book Return Submit
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setRecentTransaction(null);

    const borrowId = returnBorrowId.trim();
    if (!borrowId) {
      setErrorMessage('Please enter a valid Borrow Record ID.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.borrow.returnBook(borrowId);

      if (res.success && res.data) {
        setSuccessMessage(res.message || 'Book returned successfully!');
        setRecentTransaction(res.data);
        setReturnBorrowId('');
        // Reload data to reflect incremented available copies
        loadFormData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to return book. Please verify the ID.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Member Registration
  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberModalError(null);

    if (!newMember.name.trim() || !newMember.email.trim() || !newMember.membershipId.trim()) {
      setMemberModalError('Please fill in all member fields.');
      return;
    }

    try {
      setIsRegisteringMember(true);
      const res = await api.members.create({
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        membershipId: newMember.membershipId.trim().toUpperCase(),
      });

      if (res.success && res.data) {
        setShowMemberModal(false);
        setNewMember({ name: '', email: '', membershipId: '' });
        await loadFormData();
        setSelectedMemberId(res.data._id);
        setSuccessMessage(`Member "${res.data.name}" registered and selected!`);
      }
    } catch (err: any) {
      setMemberModalError(err.message || 'Failed to register member');
    } finally {
      setIsRegisteringMember(false);
    }
  };

  const selectedBook = availableBooks.find((b) => b._id === selectedBookId);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Circulation Desk
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
          Issue library books to students or process return transactions with atomic inventory checks.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '1.5rem',
      }}>
        <button
          onClick={() => { setActiveTab('issue'); setErrorMessage(null); setSuccessMessage(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'issue' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'issue' ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
        >
          <BookUp size={18} />
          <span>Issue Book</span>
        </button>

        <button
          onClick={() => { setActiveTab('return'); setErrorMessage(null); setSuccessMessage(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'return' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'return' ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={18} />
          <span>Return Book</span>
        </button>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Success: </strong>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Transaction Error: </strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* ISSUE BOOK FORM */}
      {activeTab === 'issue' && (
        <div className="card">
          <form onSubmit={handleIssueSubmit}>
            {/* Step 1: Select Member */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  <User size={16} color="var(--primary)" />
                  <span>Select Library Member *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowMemberModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: 'var(--primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <PlusCircle size={14} />
                  <span>Register New Member</span>
                </button>
              </div>

              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                style={{ width: '100%' }}
                disabled={isLoadingData || isSubmitting}
                required
              >
                <option value="">-- Choose Member from Directory --</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.membershipId}) — {m.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Book */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                <Book size={16} color="var(--primary)" />
                <span>Select Book from Catalogue *</span>
              </label>

              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                style={{ width: '100%' }}
                disabled={isLoadingData || isSubmitting}
                required
              >
                <option value="">-- Choose Book from Catalogue --</option>
                {availableBooks.map((b) => (
                  <option
                    key={b._id}
                    value={b._id}
                    disabled={b.availableCopies <= 0}
                  >
                    {b.title} by {b.author} [ISBN: {b.ISBN}] — ({b.availableCopies}/{b.totalCopies} available)
                    {b.availableCopies <= 0 ? ' [OUT OF STOCK]' : ''}
                  </option>
                ))}
              </select>

              {selectedBook && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Genre: <strong>{selectedBook.genre}</strong></span>
                  <span style={{
                    fontWeight: 700,
                    color: selectedBook.availableCopies > 0 ? 'var(--success-text)' : 'var(--danger-text)',
                  }}>
                    {selectedBook.availableCopies} copy remaining
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Due Date */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.4rem',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Calendar size={16} color="var(--primary)" />
                  <span>Due Return Date *</span>
                </label>

                {/* Quick presets */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate(7)}
                    className="btn btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                  >
                    7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate(14)}
                    className="btn btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                  >
                    14 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDueDate(30)}
                    className="btn btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                  >
                    30 Days
                  </button>
                </div>
              </div>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%' }}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isLoadingData}
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} />
                  <span>Processing Issue Transaction...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Issue Book</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* RETURN BOOK FORM */}
      {activeTab === 'return' && (
        <div className="card">
          <form onSubmit={handleReturnSubmit}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Enter the unique Borrow Record ID to return a book, mark it returned, and restore the book copy to available inventory.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                Borrow Record ID *
              </label>
              <input
                type="text"
                placeholder="e.g. 660f1b2c4d5e6f7a8b9c0d1e"
                value={returnBorrowId}
                onChange={(e) => setReturnBorrowId(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                disabled={isSubmitting}
                required
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Tip: You can also copy a Record ID directly from the Member History page.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px' }} />
                  <span>Processing Book Return...</span>
                </>
              ) : (
                <>
                  <RotateCcw size={18} />
                  <span>Process Book Return</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Transaction Summary Card */}
      {recentTransaction && (
        <div className="card" style={{ marginTop: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--primary)" />
            <span>Last Completed Transaction</span>
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            fontSize: '0.88rem',
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Record ID:</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{recentTransaction._id}</code>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Status:</span>
              <span className={`badge badge-${recentTransaction.status}`}>
                {recentTransaction.status}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Issue Date:</span>
              <strong>{new Date(recentTransaction.issueDate).toLocaleDateString()}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Due Date:</span>
              <strong>{new Date(recentTransaction.dueDate).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Quick Member Registration Modal */}
      {showMemberModal && (
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
              onClick={() => setShowMemberModal(false)}
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
              Register Library Member
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Create a member record to issue books immediately.
            </p>

            {memberModalError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{memberModalError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterMember}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={isRegisteringMember}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john.doe@campus.edu"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={isRegisteringMember}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Membership ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MEM-2026-001"
                  value={newMember.membershipId}
                  onChange={(e) => setNewMember({ ...newMember, membershipId: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={isRegisteringMember}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="btn btn-secondary"
                  disabled={isRegisteringMember}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isRegisteringMember}
                >
                  {isRegisteringMember ? (
                    <>
                      <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                      <span>Saving Member...</span>
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
