import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { MemberHistoryResponse, BorrowRecord, Book } from '../types';
import { api } from '../services/api';
import { DataTable } from '../components/common/DataTable';

export const MemberHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [historyData, setHistoryData] = useState<MemberHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.members.getHistory(id);
      if (res.success) {
        setHistoryData(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch member borrowing history');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleReturnBook = async (borrowId: string) => {
    try {
      setReturningId(borrowId);
      setActionSuccess(null);
      const res = await api.borrow.returnBook(borrowId);
      if (res.success) {
        setActionSuccess(res.message || 'Book returned successfully!');
        setTimeout(() => setActionSuccess(null), 4000);
        await fetchHistory();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to process return');
    } finally {
      setReturningId(null);
    }
  };

  // Helper to determine whether a record is overdue
  const isRecordOverdue = (record: BorrowRecord): boolean => {
    if (record.status === 'overdue') return true;
    if (record.status === 'returned') return false;
    return new Date(record.dueDate).getTime() < Date.now();
  };

  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading member borrow history...</p>
      </div>
    );
  }

  if (error || !historyData) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <AlertTriangle size={36} color="var(--danger-text)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.2rem', color: 'var(--danger-text)', marginBottom: '0.5rem' }}>
          Unable to Load Borrow History
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/members')} className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Members</span>
          </button>
          <button onClick={fetchHistory} className="btn btn-primary">
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const { member, data: records, summary } = historyData;

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/members')}
        className="btn btn-secondary"
        style={{ marginBottom: '1.25rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Members Directory</span>
      </button>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Member Profile Card & Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}>
        {/* Profile Card */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <User size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{member.name}</h2>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                backgroundColor: 'var(--bg-muted)',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}>
                {member.membershipId}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={15} color="var(--text-muted)" />
              <span>{member.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={15} color="var(--text-muted)" />
              <span>Joined: {new Date(member.joinedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Borrowing Statistics */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Borrowing Summary
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            textAlign: 'center',
          }}>
            <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {summary.total}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</div>
            </div>

            <div style={{ padding: '0.65rem', backgroundColor: 'var(--info-bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--info-text)' }}>
                {summary.active}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--info-text)' }}>Active</div>
            </div>

            <div style={{ padding: '0.65rem', backgroundColor: 'var(--success-bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-text)' }}>
                {summary.returned}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success-text)' }}>Returned</div>
            </div>

            <div style={{
              padding: '0.65rem',
              backgroundColor: summary.overdue > 0 ? 'var(--danger-bg)' : 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: summary.overdue > 0 ? 'var(--danger-text)' : 'var(--text-muted)',
              }}>
                {summary.overdue}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: summary.overdue > 0 ? 'var(--danger-text)' : 'var(--text-muted)',
                fontWeight: summary.overdue > 0 ? 700 : 500,
              }}>
                Overdue
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Records Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Borrow Records History
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Full timeline of issued, returned, and overdue volumes for this member.
          </p>
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <BookOpen size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>
              This member has no past or active borrow transactions recorded.
            </p>
          </div>
        ) : (
          <DataTable<BorrowRecord>
            data={records}
            keyExtractor={(r) => r._id}
            rowStyle={(r) => ({
              backgroundColor: isRecordOverdue(r) ? 'rgba(254, 242, 242, 0.45)' : undefined,
            })}
            columns={[
              {
                header: 'Book Information',
                cell: (r) => {
                  const book = typeof r.book === 'object' ? (r.book as Book) : null;
                  return (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {book ? book.title : 'Book Title Unavailable'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        by {book ? book.author : 'Unknown'} • ISBN: {book ? book.ISBN : 'N/A'}
                      </div>
                    </div>
                  );
                },
              },
              {
                header: 'Issue Date',
                cell: (r) => (
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {new Date(r.issueDate).toLocaleDateString()}
                  </span>
                ),
              },
              {
                header: 'Due Date',
                cell: (r) => {
                  const overdue = isRecordOverdue(r);
                  return (
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: overdue ? 700 : 500,
                      color: overdue ? 'var(--danger-text)' : 'var(--text-secondary)',
                    }}>
                      {new Date(r.dueDate).toLocaleDateString()}
                    </span>
                  );
                },
              },
              {
                header: 'Return Date',
                cell: (r) => (
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    {r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '—'}
                  </span>
                ),
              },
              {
                header: 'Status',
                cell: (r) => {
                  const overdue = isRecordOverdue(r);
                  if (overdue) {
                    return (
                      <span
                        className="badge badge-overdue"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                        }}
                      >
                        <AlertTriangle size={13} />
                        <span>OVERDUE</span>
                      </span>
                    );
                  }
                  if (r.status === 'returned') {
                    return (
                      <span className="badge badge-returned">
                        <CheckCircle2 size={13} />
                        <span>RETURNED</span>
                      </span>
                    );
                  }
                  return (
                    <span className="badge badge-issued">
                      <Clock size={13} />
                      <span>ACTIVE</span>
                    </span>
                  );
                },
              },
              {
                header: 'Action',
                align: 'center',
                cell: (r) => {
                  if (r.status === 'returned') {
                    return <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed</span>;
                  }
                  return (
                    <button
                      onClick={() => handleReturnBook(r._id)}
                      disabled={returningId === r._id}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      title="Return this book"
                    >
                      {returningId === r._id ? (
                        <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                      ) : (
                        <>
                          <RotateCcw size={13} />
                          <span>Return</span>
                        </>
                      )}
                    </button>
                  );
                },
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};
