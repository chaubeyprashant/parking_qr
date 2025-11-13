import { sendError } from '../utils/response.js';
import { config } from '../config/index.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Always log errors (including stack trace in development)
  console.error('Error occurred:', {
    message: err.message,
    statusCode,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    name: err.name,
    path: req.path,
    method: req.method
  });

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

  // Handle MongoDB/Mongoose errors
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    console.error('Database error details:', err);
    statusCode = 500;
    message = 'Database error occurred';
    return sendError(res, message, statusCode);
  }

  // Default error
  sendError(res, message, statusCode);
};

