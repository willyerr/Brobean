import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import logger from '../utils/logger.js';

const requestLogger: RequestHandler = (req, res, next) => {
  const requestId = randomUUID();
  const startedAt = process.hrtime.bigint();

  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const context = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP request completed with server error', undefined, context);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP request completed with client error', context);
    } else {
      logger.info('HTTP request completed', context);
    }
  });

  next();
};

export default requestLogger;
