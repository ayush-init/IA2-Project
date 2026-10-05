import { Request, Response, NextFunction } from 'express';
import { Book } from '../models/Book';
import { createBookSchema, bookQuerySchema } from '../validators/book.validator';
import { AppError } from '../middleware/errorHandler';

export async function createBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = createBookSchema.parse(req.body);

    // Check duplicate ISBN explicitly
    const existing = await Book.findOne({ ISBN: validatedData.ISBN });
    if (existing) {
      throw new AppError(`A book with ISBN ${validatedData.ISBN} already exists`, 409);
    }

    const availableCopies = validatedData.availableCopies !== undefined
      ? validatedData.availableCopies
      : validatedData.totalCopies;

    const book = await Book.create({
      ...validatedData,
      availableCopies,
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBooks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = bookQuerySchema.parse(req.query);
    const { page, limit, genre, search } = query;

    const filter: any = {};

    if (genre && genre.trim() !== '' && genre.toLowerCase() !== 'all') {
      filter.genre = { $regex: new RegExp(`^${genre.trim()}$`, 'i') };
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { author: { $regex: term, $options: 'i' } },
        { ISBN: { $regex: term, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Book.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

export async function getGenres(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const genres = await Book.distinct('genre');
    res.status(200).json({
      success: true,
      data: genres.sort(),
    });
  } catch (error) {
    next(error);
  }
}
