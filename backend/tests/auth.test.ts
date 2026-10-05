import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { Librarian } from '../src/models/Librarian';
import { setupTestDB, teardownTestDB, clearTestDB } from './db-helper';
import { seedDefaultLibrarian } from '../src/utils/seed';

describe('Librarian Authentication API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    await Librarian.create({
      name: 'Test Librarian',
      email: 'testlib@shelflife.edu',
      password: 'SecurePassword123',
      role: 'librarian',
    });
  });

  it('POST /api/auth/login should log in with valid credentials and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testlib@shelflife.edu',
        password: 'SecurePassword123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('testlib@shelflife.edu');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('POST /api/auth/login should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testlib@shelflife.edu',
        password: 'WrongPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('POST /api/auth/login should reject non-existent librarian email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@shelflife.edu',
        password: 'SecurePassword123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('POST /api/auth/login should validate missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
  });

  it('GET /api/auth/me should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('GET /api/auth/me should reject request with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_garbage_token');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid authentication token');
  });

  it('GET /api/auth/me should return user details with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testlib@shelflife.edu',
        password: 'SecurePassword123',
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.email).toBe('testlib@shelflife.edu');
  });

  it('seedDefaultLibrarian should successfully create default librarian', async () => {
    await clearTestDB();
    await seedDefaultLibrarian();
    const count = await Librarian.countDocuments();
    expect(count).toBe(1);
  });
});
