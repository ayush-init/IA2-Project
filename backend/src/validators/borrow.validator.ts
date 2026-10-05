import { z } from 'zod';
import mongoose from 'mongoose';

export const issueBookSchema = z.object({
  bookId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Book ID format',
  }),
  memberId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Member ID format',
  }),
  dueDate: z.coerce.date().refine((val) => {
    // Due date should not be in the past (allow small 1-minute buffer for request transit)
    return new Date(val).getTime() > Date.now() - 60000;
  }, {
    message: 'Due date must be in the future',
  }),
});

export type IssueBookInput = z.infer<typeof issueBookSchema>;
