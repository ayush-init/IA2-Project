import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Book } from '../src/models/Book';
import { Member } from '../src/models/Member';
import { BorrowRecord } from '../src/models/BorrowRecord';
import { Librarian } from '../src/models/Librarian';
import { setupTestDB, teardownTestDB, clearTestDB } from './db-helper';

describe('Borrow / Issue Book REST API', () => {
  let authToken: string;
  let testBook: any;
  let testMember: any;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    await Librarian.create({
      name: 'Issue Desk',
      email: 'issue@shelflife.edu',
      password: 'IssuePassword123',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'issue@shelflife.edu', password: 'IssuePassword123' });
    authToken = loginRes.body.token;

    testBook = await Book.create({
      title: 'Database System Concepts',
      author: 'Silberschatz',
      ISBN: 'ISBN-DB-101',
      genre: 'Computer Science',
      totalCopies: 2,
      availableCopies: 2,
    });

    testMember = await Member.create({
      name: 'Bob Student',
      email: 'bob@student.edu',
      membershipId: 'STU-001',
    });
  });

  it('POST /api/borrow should reject unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/borrow')
      .send({
        bookId: testBook._id,
        memberId: testMember._id,
        dueDate: new Date(Date.now() + 7 * 86400000),
      });

    expect(res.status).toBe(401);
  });

  it('POST /api/borrow should successfully issue book and decrement availableCopies', async () => {
    const dueDate = new Date(Date.now() + 14 * 86400000);

    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bookId: testBook._id.toString(),
        memberId: testMember._id.toString(),
        dueDate,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('issued');
    expect(res.body.data.book._id.toString()).toBe(testBook._id.toString());
    expect(res.body.data.member._id.toString()).toBe(testMember._id.toString());

    // Verify book copies in DB
    const updatedBook = await Book.findById(testBook._id);
    expect(updatedBook?.availableCopies).toBe(1);

    // Verify BorrowRecord exists
    const record = await BorrowRecord.findOne({ book: testBook._id, member: testMember._id });
    expect(record).not.toBeNull();
    expect(record?.status).toBe('issued');
  });

  it('POST /api/borrow should reject when availableCopies is 0', async () => {
    // Set book copies to 0
    await Book.findByIdAndUpdate(testBook._id, { availableCopies: 0 });

    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bookId: testBook._id.toString(),
        memberId: testMember._id.toString(),
        dueDate: new Date(Date.now() + 7 * 86400000),
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('no available copies');
  });

  it('POST /api/borrow should reject when book does not exist with 404', async () => {
    const nonExistentBookId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bookId: nonExistentBookId.toString(),
        memberId: testMember._id.toString(),
        dueDate: new Date(Date.now() + 7 * 86400000),
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Book not found');
  });

  it('POST /api/borrow should reject when member does not exist with 404', async () => {
    const nonExistentMemberId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/borrow')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bookId: testBook._id.toString(),
        memberId: nonExistentMemberId.toString(),
        dueDate: new Date(Date.now() + 7 * 86400000),
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Member not found');
  });

  it('CONCURRENCY TEST: should safely prevent race condition when 2 librarians issue the last single copy', async () => {
    // Create a book with only 1 copy remaining
    const singleCopyBook = await Book.create({
      title: 'Rare Manuscript',
      author: 'Ancient Scholar',
      ISBN: 'ISBN-RARE-001',
      genre: 'History',
      totalCopies: 1,
      availableCopies: 1,
    });

    const member2 = await Member.create({
      name: 'Second Student',
      email: 'student2@campus.edu',
      membershipId: 'STU-002',
    });

    const dueDate = new Date(Date.now() + 7 * 86400000);

    // Fire 2 simultaneous borrow requests for the single available copy
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: singleCopyBook._id.toString(),
          memberId: testMember._id.toString(),
          dueDate,
        }),
      request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: singleCopyBook._id.toString(),
          memberId: member2._id.toString(),
          dueDate,
        }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    // Exactly one must be 201 (Created), and one must be 400 (Out of stock)
    expect(statuses).toEqual([201, 400]);

    // Available copies must be strictly 0, never negative
    const finalBook = await Book.findById(singleCopyBook._id);
    expect(finalBook?.availableCopies).toBe(0);

    // Exactly 1 BorrowRecord created
    const recordsCount = await BorrowRecord.countDocuments({ book: singleCopyBook._id });
    expect(recordsCount).toBe(1);
  });
});
