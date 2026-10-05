import { Request, Response, NextFunction } from 'express';
import { Book } from '../models/Book';
import { Member } from '../models/Member';
import { BorrowRecord } from '../models/BorrowRecord';
import { issueBookSchema } from '../validators/borrow.validator';
import { AppError } from '../middleware/errorHandler';

/**
 * CONCURRENCY CONTROL EXPLANATION (Q1.e & Q3.d):
 * To prevent two librarians from issuing the last copy of the same book simultaneously (a race condition),
 * we avoid naive read-modify-write (finding the book, checking availableCopies in JS, and calling save()).
 * Instead, we execute an atomic conditional update using MongoDB's findOneAndUpdate with filter { _id, availableCopies: { $gt: 0 } }
 * and update { $inc: { availableCopies: -1 } }.
 * MongoDB guarantees document-level write atomicity: the first concurrent operation successfully decrements
 * availableCopies from 1 to 0; the second operation finds 0 matching documents (since availableCopies is no longer > 0)
 * and safely fails immediately, completely eliminating over-issuing or negative inventory counts.
 */
export async function issueBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = issueBookSchema.parse(req.body);
    const { bookId, memberId, dueDate } = validatedData;

    // 1. Verify Member exists
    const member = await Member.findById(memberId);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    // 2. Check Book existence before attempting decrement
    const existingBook = await Book.findById(bookId);
    if (!existingBook) {
      throw new AppError('Book not found', 404);
    }

    // 3. Atomic conditional decrement of availableCopies
    // Only decrements if availableCopies > 0 at execution time
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      throw new AppError(
        `Unable to issue book: "${existingBook.title}" has no available copies remaining`,
        400
      );
    }

    // 4. Create BorrowRecord with rollback compensation if creation fails
    try {
      const borrowRecord = await BorrowRecord.create({
        book: bookId,
        member: memberId,
        issueDate: new Date(),
        dueDate,
        status: 'issued',
        returnDate: null,
      });

      // Populate references for client response
      const populatedRecord = await BorrowRecord.findById(borrowRecord._id)
        .populate('book', 'title author ISBN genre availableCopies totalCopies')
        .populate('member', 'name email membershipId');

      res.status(201).json({
        success: true,
        message: `Book "${existingBook.title}" successfully issued to ${member.name}`,
        data: populatedRecord,
      });
    } catch (recordError) {
      // Compensating transaction rollback: restore the decremented copy
      await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
      throw recordError;
    }
  } catch (error) {
    next(error);
  }
}
