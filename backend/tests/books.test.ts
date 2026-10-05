import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { Book } from '../src/models/Book';
import { Librarian } from '../src/models/Librarian';
import { setupTestDB, teardownTestDB, clearTestDB } from './db-helper';

describe('Book REST APIs', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create librarian and generate auth token
    await Librarian.create({
      name: 'Book Admin',
      email: 'books@shelflife.edu',
      password: 'Password123',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'books@shelflife.edu', password: 'Password123' });
    authToken = loginRes.body.token;
  });

  it('POST /api/books should reject unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        ISBN: '978-0262033848',
        genre: 'Computer Science',
        totalCopies: 5,
      });

    expect(res.status).toBe(401);
  });

  it('POST /api/books should successfully create a new book with auth token', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        ISBN: '978-0262033848',
        genre: 'Computer Science',
        totalCopies: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Introduction to Algorithms');
    expect(res.body.data.availableCopies).toBe(5);
    expect(res.body.data.totalCopies).toBe(5);
  });

  it('POST /api/books should reject duplicate ISBN with 409', async () => {
    await Book.create({
      title: 'Existing Book',
      author: 'Author A',
      ISBN: '978-1111111111',
      genre: 'Science',
      totalCopies: 3,
      availableCopies: 3,
    });

    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Another Book',
        author: 'Author B',
        ISBN: '978-1111111111',
        genre: 'Science',
        totalCopies: 2,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('POST /api/books should validate availableCopies cannot exceed totalCopies', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Invalid Book',
        author: 'Author X',
        ISBN: '978-2222222222',
        genre: 'Math',
        totalCopies: 3,
        availableCopies: 5,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/books should return paginated books', async () => {
    // Seed 15 books
    const books = [];
    for (let i = 1; i <= 15; i++) {
      books.push({
        title: `Book Title ${i}`,
        author: `Author ${i}`,
        ISBN: `ISBN-TEST-${1000 + i}`,
        genre: i % 2 === 0 ? 'Science' : 'Fiction',
        totalCopies: 4,
        availableCopies: 4,
      });
    }
    await Book.insertMany(books);

    const res = await request(app).get('/api/books?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(10);
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      totalPages: 2,
    });
  });

  it('GET /api/books should filter by genre', async () => {
    await Book.create([
      {
        title: 'Physics Mechanics',
        author: 'Newton',
        ISBN: 'ISBN-P1',
        genre: 'Physics',
        totalCopies: 2,
        availableCopies: 2,
      },
      {
        title: 'Hamlet',
        author: 'Shakespeare',
        ISBN: 'ISBN-L1',
        genre: 'Literature',
        totalCopies: 2,
        availableCopies: 2,
      },
    ]);

    const res = await request(app).get('/api/books?genre=Physics');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].genre).toBe('Physics');
  });

  it('GET /api/books should search by title and author', async () => {
    await Book.create([
      {
        title: 'Quantum Computing for Beginners',
        author: 'John Bell',
        ISBN: 'ISBN-Q1',
        genre: 'Science',
        totalCopies: 3,
        availableCopies: 3,
      },
      {
        title: 'Organic Chemistry',
        author: 'Morrison Boyd',
        ISBN: 'ISBN-C1',
        genre: 'Chemistry',
        totalCopies: 3,
        availableCopies: 3,
      },
    ]);

    const res = await request(app).get('/api/books?search=quantum');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toContain('Quantum Computing');
  });

  it('GET /api/books/:id should return single book details', async () => {
    const book = await Book.create({
      title: 'Operating System Concepts',
      author: 'Silberschatz',
      ISBN: 'ISBN-OS1',
      genre: 'Computer Science',
      totalCopies: 4,
      availableCopies: 4,
    });

    const res = await request(app).get(`/api/books/${book._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Operating System Concepts');
  });

  it('GET /api/books/:id with invalid id should return 400', async () => {
    const res = await request(app).get('/api/books/invalid-id-format');
    expect(res.status).toBe(400);
  });

  it('GET /api/books/genres should return distinct genres', async () => {
    await Book.create([
      { title: 'B1', author: 'A1', ISBN: 'I1', genre: 'History', totalCopies: 1, availableCopies: 1 },
      { title: 'B2', author: 'A2', ISBN: 'I2', genre: 'Art', totalCopies: 1, availableCopies: 1 },
      { title: 'B3', author: 'A3', ISBN: 'I3', genre: 'History', totalCopies: 1, availableCopies: 1 },
    ]);

    const res = await request(app).get('/api/books/genres');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(['Art', 'History']);
  });
});
