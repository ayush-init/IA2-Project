import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  author: z.string().trim().min(1, 'Author is required').max(100, 'Author cannot exceed 100 characters'),
  ISBN: z.string().trim().min(1, 'ISBN is required').toUpperCase(),
  genre: z.string().trim().min(1, 'Genre is required'),
  totalCopies: z.coerce.number().int('Total copies must be an integer').min(1, 'Total copies must be at least 1'),
  availableCopies: z.coerce.number().int('Available copies must be an integer').min(0, 'Available copies cannot be negative').optional(),
}).refine(
  (data) => {
    if (data.availableCopies !== undefined) {
      return data.availableCopies <= data.totalCopies;
    }
    return true;
  },
  {
    message: 'Available copies cannot exceed total copies',
    path: ['availableCopies'],
  }
);

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  genre: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type BookQueryParams = z.infer<typeof bookQuerySchema>;
