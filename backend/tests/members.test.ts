import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { Member } from '../src/models/Member';
import { Librarian } from '../src/models/Librarian';
import { setupTestDB, teardownTestDB, clearTestDB } from './db-helper';

describe('Member REST APIs', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    await Librarian.create({
      name: 'Member Admin',
      email: 'memberadmin@shelflife.edu',
      password: 'AdminPassword123',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'memberadmin@shelflife.edu', password: 'AdminPassword123' });
    authToken = loginRes.body.token;
  });

  it('POST /api/members should reject unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/members')
      .send({
        name: 'John Doe',
        email: 'john@campus.edu',
        membershipId: 'MEM-2026-001',
      });

    expect(res.status).toBe(401);
  });

  it('POST /api/members should register a new member with valid data', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'John Doe',
        email: 'john@campus.edu',
        membershipId: 'MEM-2026-001',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('John Doe');
    expect(res.body.data.email).toBe('john@campus.edu');
    expect(res.body.data.membershipId).toBe('MEM-2026-001');
    expect(res.body.data.joinedDate).toBeDefined();
  });

  it('POST /api/members should reject duplicate email with 409', async () => {
    await Member.create({
      name: 'Existing Member',
      email: 'john@campus.edu',
      membershipId: 'MEM-2026-001',
    });

    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Another Name',
        email: 'john@campus.edu',
        membershipId: 'MEM-2026-002',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('POST /api/members should reject duplicate membershipId with 409', async () => {
    await Member.create({
      name: 'First Member',
      email: 'first@campus.edu',
      membershipId: 'MEM-SAME-ID',
    });

    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Second Member',
        email: 'second@campus.edu',
        membershipId: 'MEM-SAME-ID',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('POST /api/members should validate invalid email format with 400', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Invalid Email Member',
        email: 'not-an-email',
        membershipId: 'MEM-VALID-1',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/members should return paginated list of members', async () => {
    await Member.create([
      { name: 'Alice Smith', email: 'alice@campus.edu', membershipId: 'MEM-001' },
      { name: 'Bob Jones', email: 'bob@campus.edu', membershipId: 'MEM-002' },
    ]);

    const res = await request(app)
      .get('/api/members')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('GET /api/members should search by name or membershipId', async () => {
    await Member.create([
      { name: 'Charlie Brown', email: 'charlie@campus.edu', membershipId: 'MEM-003' },
      { name: 'Diana Prince', email: 'diana@campus.edu', membershipId: 'MEM-004' },
    ]);

    const res = await request(app)
      .get('/api/members?search=diana')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Diana Prince');
  });
});
