import {
  Book,
  Member,
  BorrowRecord,
  LoginResponse,
  PaginatedResponse,
  MemberHistoryResponse,
  ApiResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('shelflife_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data?.details);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    getMe: () =>
      request<{ success: boolean; user: any }>('/auth/me', {
        method: 'GET',
      }),
  },

  books: {
    getAll: (params: { page?: number; limit?: number; genre?: string; search?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());
      if (params.genre && params.genre !== 'All') query.set('genre', params.genre);
      if (params.search) query.set('search', params.search);
      const qs = query.toString();
      return request<PaginatedResponse<Book>>(`/books${qs ? `?${qs}` : ''}`);
    },

    getGenres: () =>
      request<{ success: boolean; data: string[] }>('/books/genres'),

    getById: (id: string) =>
      request<{ success: boolean; data: Book }>(`/books/${id}`),

    create: (bookData: {
      title: string;
      author: string;
      ISBN: string;
      genre: string;
      totalCopies: number;
      availableCopies?: number;
    }) =>
      request<ApiResponse<Book>>('/books', {
        method: 'POST',
        body: JSON.stringify(bookData),
      }),
  },

  members: {
    getAll: (params: { page?: number; limit?: number; search?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());
      if (params.search) query.set('search', params.search);
      const qs = query.toString();
      return request<PaginatedResponse<Member>>(`/members${qs ? `?${qs}` : ''}`);
    },

    getById: (id: string) =>
      request<{ success: boolean; data: Member }>(`/members/${id}`),

    create: (memberData: { name: string; email: string; membershipId: string }) =>
      request<ApiResponse<Member>>('/members', {
        method: 'POST',
        body: JSON.stringify(memberData),
      }),

    getHistory: (id: string) =>
      request<MemberHistoryResponse>(`/members/${id}/history`),
  },

  borrow: {
    issue: (payload: { bookId: string; memberId: string; dueDate: string }) =>
      request<ApiResponse<BorrowRecord>>('/borrow', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    returnBook: (borrowId: string) =>
      request<ApiResponse<BorrowRecord>>(`/return/${borrowId}`, {
        method: 'POST',
      }),
  },
};

export { ApiError };
