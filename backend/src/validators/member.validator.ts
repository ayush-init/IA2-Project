import { z } from 'zod';

export const createMemberSchema = z.object({
  name: z.string().trim().min(1, 'Member name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Please provide a valid email address').toLowerCase(),
  membershipId: z.string().trim().min(1, 'Membership ID is required').toUpperCase(),
  joinedDate: z.coerce.date().optional(),
});

export const memberQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type MemberQueryParams = z.infer<typeof memberQuerySchema>;
