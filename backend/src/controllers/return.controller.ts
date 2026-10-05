import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BorrowRecord } from '../models/BorrowRecord';
import { Book } from '../models/Book';
import { AppError } from '../middleware/errorHandler';

export async function returnBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { borrowId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(borrowId)) {
      throw new AppError('Invalid borrow record ID format', 400);
    }

    const record = await BorrowRecord.findById(borrowId);
    if (!record) {
      throw new AppError('Borrow record not found', 404);
    }

    if (record.status === 'returned') {
      throw new AppError('This book has already been returned', 400);
    }

    const book = await Book.findById(record.book);
    if (!book) {
      throw new AppError('Associated book record not found', 404);
    }

    // Atomic increment of availableCopies with condition that availableCopies < totalCopies
    // to strictly preserve availableCopies <= totalCopies invariant
    const updatedBook = await Book.findOneAndUpdate(
      { _id: book._id, availableCopies: { $lt: book.totalCopies } },
      { $inc: { availableCopies: 1 } },
      { new: true }
    );

    if (!updatedBook) {
      // If already at totalCopies, keep at totalCopies
      await Book.findByIdAndUpdate(book._id, { availableCopies: book.totalCopies });
    }

    record.returnDate = new Date();
    record.status = 'returned';
    await record.save();

    const populatedRecord = await BorrowRecord.findById(record._id)
      .populate('book', 'title author ISBN genre availableCopies totalCopies')
      .populate('member', 'name email membershipId');

    res.status(200).json({
      success: true,
      message: `Book "${book.title}" successfully returned`,
      data: populatedRecord,
    });
  } catch (error) {
    next(error);
  }
}
