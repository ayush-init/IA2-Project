import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  defaultLibrarian: {
    email: string;
    password: string;
    name: string;
  };
}

export const config: Config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shelflife',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_shelflife_jwt_key_ia2_exam_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  defaultLibrarian: {
    email: process.env.DEFAULT_LIBRARIAN_EMAIL || 'librarian@shelflife.edu',
    password: process.env.DEFAULT_LIBRARIAN_PASSWORD || 'Admin@12345',
    name: process.env.DEFAULT_LIBRARIAN_NAME || 'Head Librarian',
  },
};
