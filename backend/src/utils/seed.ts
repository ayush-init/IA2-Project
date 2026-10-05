import { Librarian } from '../models/Librarian';
import { Book } from '../models/Book';
import { Member } from '../models/Member';
import { config } from '../config/env';

export async function seedDefaultLibrarian(): Promise<void> {
  try {
    const existing = await Librarian.findOne({ email: config.defaultLibrarian.email.toLowerCase() });
    if (!existing) {
      await Librarian.create({
        name: config.defaultLibrarian.name,
        email: config.defaultLibrarian.email.toLowerCase(),
        password: config.defaultLibrarian.password,
        role: 'librarian',
      });
      console.log(`[Seed] Created default librarian: ${config.defaultLibrarian.email}`);
    }
  } catch (error) {
    console.error('[Seed] Failed to seed default librarian:', error);
  }
}

export async function seedInitialData(): Promise<void> {
  await seedDefaultLibrarian();

  try {
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      await Book.insertMany([
        {
          title: 'Introduction to Algorithms, Fourth Edition',
          author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
          ISBN: '978-0262046305',
          genre: 'Computer Science',
          totalCopies: 5,
          availableCopies: 5,
        },
        {
          title: 'Designing Data-Intensive Applications',
          author: 'Martin Kleppmann',
          ISBN: '978-1449373320',
          genre: 'Software Engineering',
          totalCopies: 4,
          availableCopies: 4,
        },
        {
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          author: 'Robert C. Martin',
          ISBN: '978-0132350884',
          genre: 'Software Engineering',
          totalCopies: 3,
          availableCopies: 3,
        },
        {
          title: 'Artificial Intelligence: A Modern Approach',
          author: 'Stuart Russell, Peter Norvig',
          ISBN: '978-0134610993',
          genre: 'Computer Science',
          totalCopies: 4,
          availableCopies: 4,
        },
        {
          title: 'Calculus: Early Transcendentals',
          author: 'James Stewart',
          ISBN: '978-1285741550',
          genre: 'Mathematics',
          totalCopies: 6,
          availableCopies: 6,
        },
      ]);
      console.log('[Seed] Populated library catalogue with 5 foundational academic books.');
    }

    const memberCount = await Member.countDocuments();
    if (memberCount === 0) {
      await Member.insertMany([
        {
          name: 'Alex Rivera',
          email: 'alex.rivera@campus.edu',
          membershipId: 'MEM-2026-001',
          joinedDate: new Date('2026-01-15'),
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@campus.edu',
          membershipId: 'MEM-2026-002',
          joinedDate: new Date('2026-02-01'),
        },
        {
          name: 'Jordan Lee',
          email: 'jordan.lee@campus.edu',
          membershipId: 'MEM-2026-003',
          joinedDate: new Date('2026-02-20'),
        },
      ]);
      console.log('[Seed] Registered 3 initial student/faculty members.');
    }
  } catch (error) {
    console.error('[Seed] Failed to seed initial data:', error);
  }
}
