import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { initDatabase } from './database/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging for production debugging
app.use((req, res, next) => {
  if (config.nodeEnv === 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Request logging (development only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Parking QR API Server',
    status: 'running',
    api: `${req.protocol}://${req.get('host')}${config.api.prefix}`,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use(config.api.prefix, routes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

// Initialize database connection before starting server
const startServer = async () => {
  try {
    // Initialize database (MongoDB or JSON)
    await initDatabase();
    
    // Listen on 0.0.0.0 to accept connections from all network interfaces (required for Render)
    app.listen(PORT, '0.0.0.0', () => {
      const serverUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
      console.log(`🚀 Server running on ${serverUrl}`);
      console.log(`📊 API available at ${serverUrl}${config.api.prefix}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`💾 Database: ${config.database.type}`);
      if (config.database.type === 'mongodb') {
        console.log(`🔗 MongoDB: Connected`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
