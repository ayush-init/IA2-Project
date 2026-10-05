import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { Book } from '../src/models/Book';
import { Member } from '../src/models/Member';
import { BorrowRecord } from '../src/models/BorrowRecord';

describe('Mongoose Models Validation', () => {
  describe('Book Model Validation', () => {
    it('should fail validation if required fields are missing', async () => {
      const book = new Book({});
      let error: any;
      try {
        await book.validate();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.author).toBeDefined();
      expect(error.errors.ISBN).toBeDefined();
      expect(error.errors.genre).toBeDefined();
      expect(error.errors.totalCopies).toBeDefined();
      expect(error.errors.availableCopies).toBeDefined();
    });

    it('should fail if availableCopies > totalCopies', async () => {
      const book = new Book({
        title: 'Clean Code',
        author: 'Robert C. Martin',
        ISBN: '978-0132350884',
        genre: 'Computer Science',
        totalCopies: 5,
        availableCopies: 10,
      });

      let error: any;
      try {
        await book.validate();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors.availableCopies).toBeDefined();
    });

    it('should pass validation with valid attributes', async () => {
      const book = new Book({
        title: 'Design Patterns',
        author: 'Erich Gamma et al.',
        ISBN: '978-0201633610',
        genre: 'Software Engineering',
        totalCopies: 5,
        availableCopies: 5,
      });

      const error = await book.validate();
      expect(error).toBeUndefined();
    });
  });

  describe('Member Model Validation', () => {
    it('should fail validation with invalid email format', async () => {
      const member = new Member({
        name: 'Alice Johnson',
        email: 'invalid-email-address',
        membershipId: 'MEM-001',
      });

      let error: any;
      try {
        await member.validate();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should pass validation with valid member data', async () => {
      const member = new Member({
        name: 'Alice Johnson',
        email: 'alice@campus.edu',
        membershipId: 'MEM-1001',
      });

      const error = await member.validate();
      expect(error).toBeUndefined();
      expect(member.joinedDate).toBeDefined();
    });
  });

  describe('BorrowRecord Model Validation', () => {
    it('should fail validation with invalid status', async () => {
      const record = new BorrowRecord({
        book: new mongoose.Types.ObjectId(),
        member: new mongoose.Types.ObjectId(),
        dueDate: new Date(Date.now() + 86400000),
        status: 'invalid_status' as any,
      });

      let error: any;
      try {
        await record.validate();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });

    it('should pass validation with valid borrow record data', async () => {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const record = new BorrowRecord({
        book: new mongoose.Types.ObjectId(),
        member: new mongoose.Types.ObjectId(),
        issueDate: now,
        dueDate: nextWeek,
        status: 'issued',
      });

      const error = await record.validate();
      expect(error).toBeUndefined();
    });
  });
});
