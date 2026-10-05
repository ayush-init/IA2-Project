import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Book } from '../src/models/Book';
import { Member } from '../src/models/Member';
import { BorrowRecord } from '../src/models/BorrowRecord';
import { Librarian } from '../src/models/Librarian';
import { setupTestDB, teardownTestDB, clearTestDB } from './db-helper';

describe('Member Borrow History REST API', () => {
  let authToken: string;
  let testMember: any;
  let book1: any;
  let book2: any;
  let book3: any;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    await Librarian.create({
      name: 'History Librarian',
      email: 'history@shelflife.edu',
      password: 'HistoryPassword123',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'history@shelflife.edu', password: 'HistoryPassword123' });
    authToken = loginRes.body.token;

    testMember = await Member.create({
      name: 'Sarah Connor',
      email: 'sarah@skynet.com',
      membershipId: 'MEM-SC-1984',
    });

    book1 = await Book.create({
      title: 'The Art of Computer Programming',
      author: 'Donald Knuth',
      ISBN: 'ISBN-KNUTH-1',
      genre: 'Computer Science',
      totalCopies: 5,
      availableCopies: 5,
    });

    book2 = await Book.create({
      title: 'Structure and Interpretation of Computer Programs',
      author: 'Abelson & Sussman',
      ISBN: 'ISBN-SICP-1',
      genre: 'Computer Science',
      totalCopies: 4,
      availableCopies: 4,
    });

    book3 = await Book.create({
      title: 'Compilers: Principles, Techniques, and Tools',
      author: 'Aho, Lam, Sethi, Ullman',
      ISBN: 'ISBN-DRAGON-1',
      genre: 'Computer Science',
      totalCopies: 3,
      availableCopies: 3,
    });
  });

  it('GET /api/members/:id/history should reject unauthenticated request with 401', async () => {
    const res = await request(app).get(`/api/members/${testMember._id}/history`);
    expect(res.status).toBe(401);
  });

  it('GET /api/members/:id/history should return 404 for non-existent member', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/members/${nonExistentId}/history`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it('GET /api/members/:id/history should return complete history and dynamically derive overdue status', async () => {
    const now = Date.now();

    // 1. Active borrow (not overdue)
    await BorrowRecord.create({
      book: book1._id,
      member: testMember._id,
      issueDate: new Date(now - 2 * 86400000),
      dueDate: new Date(now + 5 * 86400000), // Due in 5 days
      status: 'issued',
    });

    // 2. Overdue borrow (dueDate passed, still issued)
    await BorrowRecord.create({
      book: book2._id,
      member: testMember._id,
      issueDate: new Date(now - 10 * 86400000),
      dueDate: new Date(now - 3 * 86400000), // Due 3 days ago!
      status: 'issued',
    });

    // 3. Returned borrow (even if dueDate passed, it is returned)
    await BorrowRecord.create({
      book: book3._id,
      member: testMember._id,
      issueDate: new Date(now - 20 * 86400000),
      dueDate: new Date(now - 10 * 86400000),
      returnDate: new Date(now - 8 * 86400000),
      status: 'returned',
    });

    const res = await request(app)
      .get(`/api/members/${testMember._id}/history`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.member.name).toBe('Sarah Connor');
    expect(res.body.data.length).toBe(3);

    // Verify overdue dynamic calculation
    const overdueRecord = res.body.data.find(
      (r: any) => r.book._id.toString() === book2._id.toString()
    );
    expect(overdueRecord).toBeDefined();
    expect(overdueRecord.status).toBe('overdue');
    expect(overdueRecord.isOverdue).toBe(true);

    // Verify active record
    const activeRecord = res.body.data.find(
      (r: any) => r.book._id.toString() === book1._id.toString()
    );
    expect(activeRecord.status).toBe('issued');
    expect(activeRecord.isOverdue).toBe(false);

    // Verify returned record
    const returnedRecord = res.body.data.find(
      (r: any) => r.book._id.toString() === book3._id.toString()
    );
    expect(returnedRecord.status).toBe('returned');
    expect(returnedRecord.isOverdue).toBe(false);

    // Verify summary counts
    expect(res.body.summary).toEqual({
      total: 3,
      active: 1,
      returned: 1,
      overdue: 1,
    });
  });
});
