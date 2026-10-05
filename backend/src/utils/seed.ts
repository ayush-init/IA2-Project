import { Librarian } from '../models/Librarian';
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
