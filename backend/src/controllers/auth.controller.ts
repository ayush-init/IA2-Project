import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Librarian } from '../models/Librarian';
import { loginSchema } from '../validators/auth.validator';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/env';

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Search librarian including password
    const librarian = await Librarian.findOne({ email: email.toLowerCase() }).select('+password');
    if (!librarian) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await librarian.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: librarian._id.toString(),
        email: librarian.email,
        name: librarian.name,
        role: librarian.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: librarian._id.toString(),
        name: librarian.name,
        email: librarian.email,
        role: librarian.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}
