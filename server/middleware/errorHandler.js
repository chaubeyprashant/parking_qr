import { sendError } from '../utils/response.js';
import { config } from '../config/index.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', err);
  }

  // Handle known error types
  if (err.isOperational) {
    return sendError(res, message, statusCode);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    return sendError(res, message, statusCode);
  }

  // Default error
  sendError(res, message, statusCode);
};

