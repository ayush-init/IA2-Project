export interface Book {
  _id: string;
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  membershipId: string;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export type BorrowStatus = 'issued' | 'returned' | 'overdue';

export interface BorrowRecord {
  _id: string;
  book: Book | string;
  member: Member | string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowStatus;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Librarian {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: Librarian;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMetadata;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  details?: any;
}

export interface MemberHistoryResponse {
  success: boolean;
  member: {
    id: string;
    name: string;
    email: string;
    membershipId: string;
    joinedDate: string;
  };
  data: BorrowRecord[];
  summary: {
    total: number;
    active: number;
    returned: number;
    overdue: number;
  };
}
