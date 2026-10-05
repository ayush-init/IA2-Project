import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Book } from '../src/models/Book';
import { Member } from '../src/models/Member';
import { BorrowRecord } from '../src/models/BorrowRecord';
import { Librarian } from '../src/models/Librarian';
import { setupTestDB, teardownTestDB, clearTestDB } from './db-helper';

describe('Return Book REST API', () => {
  let authToken: string;
  let testBook: any;
  let testMember: any;
  let activeBorrowRecord: any;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    await Librarian.create({
      name: 'Return Officer',
      email: 'return@shelflife.edu',
      password: 'ReturnPassword123',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'return@shelflife.edu', password: 'ReturnPassword123' });
    authToken = loginRes.body.token;

    testBook = await Book.create({
      title: 'Modern Operating Systems',
      author: 'Andrew S. Tanenbaum',
      ISBN: 'ISBN-MOS-01',
      genre: 'Computer Science',
      totalCopies: 3,
      availableCopies: 1, // 2 copies out
    });

    testMember = await Member.create({
      name: 'Grace Hopper',
      email: 'grace@navy.mil',
      membershipId: 'MEM-GH-01',
    });

    activeBorrowRecord = await BorrowRecord.create({
      book: testBook._id,
      member: testMember._id,
      issueDate: new Date(Date.now() - 3 * 86400000),
      dueDate: new Date(Date.now() + 4 * 86400000),
      status: 'issued',
      returnDate: null,
    });
  });

  it('POST /api/return/:borrowId should reject unauthenticated request with 401', async () => {
    const res = await request(app).post(`/api/return/${activeBorrowRecord._id}`);
    expect(res.status).toBe(401);
  });

  it('POST /api/return/:borrowId should successfully return book, set returnDate, and increment availableCopies', async () => {
    const res = await request(app)
      .post(`/api/return/${activeBorrowRecord._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('returned');
    expect(res.body.data.returnDate).not.toBeNull();

    // Check updated book copies in DB
    const updatedBook = await Book.findById(testBook._id);
    expect(updatedBook?.availableCopies).toBe(2);

    // Verify record in DB
    const updatedRecord = await BorrowRecord.findById(activeBorrowRecord._id);
    expect(updatedRecord?.status).toBe('returned');
    expect(updatedRecord?.returnDate).toBeInstanceOf(Date);
  });

  it('POST /api/return/:borrowId should reject returning an already returned book with 400', async () => {
    // First return
    await request(app)
      .post(`/api/return/${activeBorrowRecord._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Second return attempt
    const res = await request(app)
      .post(`/api/return/${activeBorrowRecord._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already been returned');
  });

  it('POST /api/return/:borrowId should return 400 for invalid ID format', async () => {
    const res = await request(app)
      .post('/api/return/invalid-id-xyz')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid borrow record ID format');
  });

  it('POST /api/return/:borrowId should return 404 for non-existent borrow record', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/return/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Borrow record not found');
  });
});
