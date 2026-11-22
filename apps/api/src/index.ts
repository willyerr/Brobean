import express from 'express';
import cors from 'cors';
import beanRoutes from './routes/beanRoutes.js';
import preparationRoutes from './routes/preparationRoutes.js';
import brewRoutes from './routes/brewRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import requestLogger from './middlewares/requestLogger.js';
import { runMigrations } from './database/migrate.js';
import db from './config/database.js';
import logger from './utils/logger.js';

const app = express();

// Middleware
app.use(requestLogger);
app.use(cors());

// Foto 5 MB dalam Base64 membutuhkan sekitar 6.7 MB.
app.use(express.json({ limit: '8mb' }));

// API routes
app.use('/api/beans', beanRoutes);
app.use('/api/preparations', preparationRoutes);
app.use('/api/brews', brewRoutes);

// Error handler harus berada setelah seluruh routes.
app.use(errorHandler);

// JSON response untuk endpoint yang tidak ditemukan.
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

const PORT = Number(process.env.PORT || 3000);

try {
  // Jalankan migration sebelum server menerima request.
  runMigrations();

  const server = app.listen(PORT, () => {
    logger.info('Brobean API server started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      processId: process.pid
    });
  });

  let isShuttingDown = false;

  const shutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info('Graceful shutdown requested', { signal });
    server.close(() => {
      db.close();
      logger.info('Brobean API server stopped', { signal });
      void logger.close().then(() => process.exit(0));
    });

    setTimeout(() => {
      logger.fatal('Graceful shutdown timed out; forcing process exit', { signal });
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (error) => {
    logger.fatal('Uncaught exception; process will exit', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.fatal('Unhandled promise rejection; process will exit', reason);
    process.exit(1);
  });
} catch (error) {
  logger.fatal('API startup failed', error);
  db.close();
  void logger.close().finally(() => process.exit(1));
}
