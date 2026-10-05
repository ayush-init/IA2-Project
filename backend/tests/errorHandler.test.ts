import { describe, it, expect } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { z } from 'zod';
import mongoose from 'mongoose';
import { errorHandler, AppError } from '../src/middleware/errorHandler';

describe('Centralized Error Handler Middleware', () => {
  const setupTestApp = () => {
    const testApp = express();
    testApp.use(express.json());

    testApp.get('/test/app-error', (_req: Request, _res: Response, next: NextFunction) => {
      next(new AppError('Custom forbidden action', 403, { code: 'FORBIDDEN_CUSTOM' }));
    });

    testApp.post('/test/zod-error', (req: Request, _res: Response, next: NextFunction) => {
      try {
        const schema = z.object({ requiredField: z.string() });
        schema.parse(req.body);
      } catch (err) {
        next(err);
      }
    });

    testApp.get('/test/cast-error', (_req: Request, _res: Response, next: NextFunction) => {
      const castErr = new mongoose.Error.CastError('ObjectId', 'invalid-id', '_id');
      next(castErr);
    });

    testApp.get('/test/duplicate-error', (_req: Request, _res: Response, next: NextFunction) => {
      const dupErr: any = new Error('E11000 duplicate key error');
      dupErr.code = 11000;
      dupErr.keyValue = { email: 'duplicate@test.com' };
      next(dupErr);
    });

    testApp.get('/test/generic-error', (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error('Unexpected system explosion'));
    });

    testApp.use(errorHandler);
    return testApp;
  };

  const app = setupTestApp();

  it('should handle AppError with custom status and details', async () => {
    const res = await request(app).get('/test/app-error');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Custom forbidden action');
    expect(res.body.details).toEqual({ code: 'FORBIDDEN_CUSTOM' });
  });

  it('should format ZodError into 400 with field details', async () => {
    const res = await request(app).post('/test/zod-error').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('should handle Mongoose CastError with 400', async () => {
    const res = await request(app).get('/test/cast-error');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid ID format');
  });

  it('should handle Mongo duplicate key error with 409', async () => {
    const res = await request(app).get('/test/duplicate-error');
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Duplicate value');
  });

  it('should handle unexpected generic error with 500', async () => {
    const res = await request(app).get('/test/generic-error');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unexpected system explosion');
  });
});
