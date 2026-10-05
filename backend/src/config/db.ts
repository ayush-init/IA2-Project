import mongoose from 'mongoose';
import { config } from './env';

let memoryServerInstance: any = null;

export async function connectDatabase(uri: string = config.mongoUri): Promise<typeof mongoose> {
  try {
    // Attempt standard connection with 2.5s timeout for fast fallback in dev
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    if (config.nodeEnv !== 'test') {
      console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    }
    return conn;
  } catch (error: any) {
    // In development or test, if local MongoDB daemon is not running, fall back to embedded in-memory MongoDB
    const isConnectionRefused =
      error?.name === 'MongooseServerSelectionError' ||
      error?.message?.includes('ECONNREFUSED') ||
      error?.message?.includes('connect ECONNREFUSED');

    if (isConnectionRefused && config.nodeEnv !== 'production') {
      console.warn(`\n[Database] Advisory: No running MongoDB daemon found at ${uri}`);
      console.log(`[Database] Spinning up embedded in-memory MongoDB instance for zero-setup evaluation...`);

      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const fallbackUri = memoryServerInstance.getUri();

        const conn = await mongoose.connect(fallbackUri);
        console.log(`[Database] Embedded in-memory MongoDB is ready: ${fallbackUri}`);
        console.log(`[Database] You can also connect to external MongoDB or Atlas by configuring MONGODB_URI in backend/.env\n`);
        return conn;
      } catch (memError) {
        console.error('[Database] Failed to start embedded in-memory MongoDB:', memError);
      }
    }

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
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
    if (config.nodeEnv !== 'test') {
      console.log('[Database] MongoDB disconnected cleanly.');
    }
  } catch (error) {
    console.error('[Database] MongoDB disconnect error:', error);
  }
}
