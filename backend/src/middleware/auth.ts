import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';
import { Librarian, ILibrarian } from '../models/Librarian';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required: Missing or malformed Bearer token', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication required: No token provided', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AuthUserPayload;

    // Verify librarian still exists in DB
    const librarian = await Librarian.findById(decoded.id);
    if (!librarian) {
      throw new AppError('Authentication failed: Librarian account no longer exists', 401);
    }

    req.user = {
      id: librarian._id.toString(),
      email: librarian.email,
      name: librarian.name,
      role: librarian.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
