import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Book, PaginationMetadata } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';

export const BooksPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  const [pagination, setPagination] = useState<PaginationMetadata>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add Book Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    ISBN: '',
    genre: '',
    totalCopies: 3,
  });

  // Fetch Genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.books.getGenres();
        if (res.success) {
          setGenres(res.data);
        }
      } catch (err) {
        console.error('Failed to load genres', err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch Books with pagination & filter
  const fetchBooks = useCallback(async (page = pagination.page, genre = selectedGenre, search = searchTerm) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await api.books.getAll({
        page,
        limit: pagination.limit,
        genre: genre !== 'All' ? genre : undefined,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setBooks(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch book catalogue');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, selectedGenre, searchTerm, pagination.page]);

  useEffect(() => {
    fetchBooks(pagination.page, selectedGenre, searchTerm);
  }, [pagination.page, selectedGenre, searchTerm, fetchBooks]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedGenre('All');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newBook.title.trim() || !newBook.author.trim() || !newBook.ISBN.trim() || !newBook.genre.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (newBook.totalCopies < 1) {
      setFormError('Total copies must be at least 1.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.books.create({
        title: newBook.title.trim(),
        author: newBook.author.trim(),
        ISBN: newBook.ISBN.trim().toUpperCase(),
        genre: newBook.genre.trim(),
        totalCopies: Number(newBook.totalCopies),
        availableCopies: Number(newBook.totalCopies),
      });

      if (res.success) {
        setSuccessToast(`Book "${newBook.title}" added successfully!`);
        setTimeout(() => setSuccessToast(null), 4000);
        setShowAddModal(false);
        setNewBook({
          title: '',
          author: '',
          ISBN: '',
          genre: '',
          totalCopies: 3,
        });
        fetchBooks(1);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to add book');
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
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header with Title and Add Button */}
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
            Book Catalogue
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            Browse, search, and manage library books across academic disciplines.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.15rem' }}
          >
            <Plus size={18} />
            <span>Add New Book</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'space-between',
        }}>
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              flex: '1 1 320px',
              gap: '0.5rem',
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                top: '50%',
                left: '0.85rem',
                transform: 'translateY(-50%)',
              }} />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.65rem 1rem' }}>
              Search
            </button>
          </form>

          {/* Genre Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 1 240px' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select
              value={selectedGenre}
              onChange={handleGenreChange}
              style={{ width: '100%' }}
            >
              <option value="All">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || selectedGenre !== 'All') && (
            <button
              onClick={handleClearFilters}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
            >
              <RefreshCw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Content State: Loading, Error, Empty, or Table */}
      {isLoading ? (
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          gap: '1rem',
        }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Loading books from library catalog...
          </p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <AlertCircle size={36} color="var(--danger-text)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--danger-text)', marginBottom: '0.5rem' }}>
            Error Loading Catalogue
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{error}</p>
          <button onClick={() => fetchBooks()} className="btn btn-secondary">
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <BookOpen size={42} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Books Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {searchTerm || selectedGenre !== 'All'
              ? 'No books match your current search and genre criteria. Try adjusting or clearing your filters.'
              : 'The library catalog is currently empty. Authenticated librarians can add books using the button above.'}
          </p>
          {(searchTerm || selectedGenre !== 'All') && (
            <button onClick={handleClearFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <DataTable<Book>
            data={books}
            keyExtractor={(b) => b._id}
            columns={[
              {
                header: 'Title',
                cell: (book) => (
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {book.title}
                  </span>
                ),
              },
              {
                header: 'Author',
                accessorKey: 'author',
                cell: (book) => <span style={{ color: 'var(--text-secondary)' }}>{book.author}</span>,
              },
              {
                header: 'ISBN',
                cell: (book) => (
                  <code style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    backgroundColor: 'var(--bg-muted)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    {book.ISBN}
                  </code>
                ),
              },
              {
                header: 'Genre',
                cell: (book) => (
                  <span style={{
                    backgroundColor: 'var(--bg-muted)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}>
                    {book.genre}
                  </span>
                ),
              },
              {
                header: 'Total Copies',
                align: 'center',
                cell: (book) => <span style={{ fontWeight: 600 }}>{book.totalCopies}</span>,
              },
              {
                header: 'Available Copies',
                align: 'center',
                cell: (book) => {
                  const isAvailable = book.availableCopies > 0;
                  return (
                    <span style={{
                      fontWeight: 700,
                      color: isAvailable ? 'var(--success-text)' : 'var(--danger-text)',
                    }}>
                      {book.availableCopies}
                    </span>
                  );
                },
              },
              {
                header: 'Status',
                cell: (book) => {
                  const isAvailable = book.availableCopies > 0;
                  return isAvailable ? (
                    <span className="badge badge-returned" style={{ fontSize: '0.72rem' }}>
                      Available ({book.availableCopies})
                    </span>
                  ) : (
                    <span className="badge badge-overdue" style={{ fontSize: '0.72rem' }}>
                      Out of Stock
                    </span>
                  );
                },
              },
            ]}
          />

          {/* Pagination Footer */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginTop: '1.25rem',
            padding: '0.5rem 0',
          }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Showing {books.length} of {pagination.total} book{pagination.total === 1 ? '' : 's'} (Page {pagination.page} of {pagination.totalPages || 1})
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                className="btn btn-secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Book Modal */}
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
            maxWidth: '520px',
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
              Add Book to Library
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Register a new academic title with unique ISBN and inventory count.
            </p>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBook}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Algorithms"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Author(s) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    ISBN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 978-0262033848"
                    value={newBook.ISBN}
                    onChange={(e) => setNewBook({ ...newBook, ISBN: e.target.value })}
                    style={{ width: '100%' }}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Genre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                    style={{ width: '100%' }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Total Copies *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newBook.totalCopies}
                  onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value, 10) || 1 })}
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
                      <span>Saving Book...</span>
                    </>
                  ) : (
                    <span>Add to Catalogue</span>
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
