import type { ErrorRequestHandler } from 'express';
import { BeanServiceError } from '../services/beanService.js';
import logger from '../utils/logger.js';

const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  if (error instanceof BeanServiceError) {
    logger.warn('Request rejected by business rule', {
      statusCode: error.statusCode,
      errorMessage: error.message
    });
    res.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  logger.error('Unhandled API error', error);

  res.status(500).json({
    message: 'Terjadi kesalahan pada server.'
  });
};

export default errorHandler;
