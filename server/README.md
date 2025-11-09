# Parking QR Backend Server

A scalable, well-architected Node.js backend server for the Parking QR Code Generator application.

## 🏗️ Architecture

The backend follows a clean, layered architecture pattern:

```
server/
├── config/          # Configuration files
├── controllers/   # Request handlers (HTTP layer)
├── services/     # Business logic layer
├── models/       # Data models/schemas
├── routes/       # API route definitions
├── middleware/   # Custom middleware (error handling, etc.)
├── database/     # Database abstraction layer
└── utils/        # Helper functions and utilities
```

### Architecture Layers

1. **Routes** (`routes/`) - Define API endpoints and map them to controllers
2. **Controllers** (`controllers/`) - Handle HTTP requests/responses, input validation
3. **Services** (`services/`) - Contain business logic, orchestrate data operations
4. **Models** (`models/`) - Data structures and schemas
5. **Database** (`database/`) - Database abstraction layer (easily switch between JSON, MongoDB, PostgreSQL, etc.)
6. **Middleware** (`middleware/`) - Error handling, authentication, logging
7. **Utils** (`utils/`) - Reusable helper functions
8. **Config** (`config/`) - Application configuration

## 🚀 Getting Started

### Installation

```bash
cd server
npm install
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001` by default.

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### User Endpoints
- `GET /api/user/:email` - Get user information
- `POST /api/user/upgrade` - Upgrade user to premium

### QR Code Endpoints
- `POST /api/qr/generate` - Generate a new QR code
- `GET /api/qr/:qrId` - Get QR code information

### Call Endpoints
- `POST /api/call/initiate` - Initiate a masked call

## 🔧 Configuration

Configuration is managed in `config/index.js`. You can override settings using environment variables:

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DB_TYPE` - Database type (json, mongodb, postgresql)
- `DB_PATH` - Path to JSON database file (if using JSON)
- `CORS_ORIGIN` - CORS origin (default: *)

## 📦 Features

- ✅ Clean separation of concerns
- ✅ Scalable architecture
- ✅ Easy to switch databases (JSON → MongoDB → PostgreSQL)
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Type-safe models
- ✅ Service layer for business logic
- ✅ Middleware for cross-cutting concerns

## 🔄 Adding New Features

### 1. Add a new route
Create a file in `routes/` and add it to `routes/index.js`

### 2. Create a controller
Add a controller class in `controllers/` that handles HTTP requests

### 3. Implement business logic
Add service methods in `services/` for business logic

### 4. Define models
Create model classes in `models/` for data structures

### 5. Update database layer
If needed, add new methods to the database abstraction in `database/`

## 🗄️ Database

Currently uses JSON file-based storage. The architecture allows easy migration to:
- MongoDB
- PostgreSQL
- MySQL
- Any other database

Simply implement a new database class in `database/` and update `database/index.js`.

## 🛡️ Error Handling

The application uses custom error classes:
- `AppError` - Base error class
- `ValidationError` - Input validation errors (400)
- `NotFoundError` - Resource not found (404)
- `ForbiddenError` - Access denied (403)

All errors are handled by the `errorHandler` middleware.

## 📝 Code Style

- ES6 modules (import/export)
- Async/await for asynchronous operations
- Class-based architecture
- Consistent error handling
- Input validation

## 🔐 Security Considerations

- Input validation on all endpoints
- CORS configuration
- Error messages don't expose sensitive information
- Ready for authentication middleware integration

