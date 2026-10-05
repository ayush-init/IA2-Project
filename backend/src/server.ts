import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/db';
import { seedInitialData } from './utils/seed';

async function bootstrap() {
  try {
    await connectDatabase(config.mongoUri);
    await seedInitialData();

    const server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`  ShelfLife API Server Running!`);
      console.log(`  Environment : ${config.nodeEnv}`);
      console.log(`  Port        : ${config.port}`);
      console.log(`  Health Check: http://localhost:${config.port}/api/health`);
      console.log(`===============================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Failed to initialize server:', error);
    process.exit(1);
  }
}

// Start server if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
