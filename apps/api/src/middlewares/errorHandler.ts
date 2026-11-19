import type { ErrorRequestHandler } from 'express';
import { BeanServiceError } from '../services/beanService.js';

const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  if (error instanceof BeanServiceError) {
    res.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  console.error('Internal server error:', error);

  res.status(500).json({
    message: 'Terjadi kesalahan pada server.'
  });
};

export default errorHandler;
