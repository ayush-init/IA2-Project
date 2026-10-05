import mongoose from 'mongoose';
import { config } from './env';

export async function connectDatabase(uri: string = config.mongoUri): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(uri);
    if (config.nodeEnv !== 'test') {
      console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    }
    return conn;
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    if (config.nodeEnv !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (config.nodeEnv !== 'test') {
      console.log('[Database] MongoDB disconnected cleanly.');
    }
  } catch (error) {
    console.error('[Database] MongoDB disconnect error:', error);
  }
}
