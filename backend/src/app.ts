import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const app: Application = express();

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'ShelfLife Library Management System API',
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
import authRoutes from './routes/auth.routes';
app.use('/api/auth', authRoutes);

// Book routes
import bookRoutes from './routes/book.routes';
app.use('/api/books', bookRoutes);

// Member routes
import memberRoutes from './routes/member.routes';
app.use('/api/members', memberRoutes);

// 404 Fallback for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
