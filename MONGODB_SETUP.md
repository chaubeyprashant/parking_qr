# MongoDB Setup Guide

This project now uses MongoDB as the database. Follow these steps to set up MongoDB for your project.

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use `0.0.0.0/0` for development)
6. Get your connection string from "Connect" → "Connect your application"
7. Replace `<password>` with your database user password

## Option 2: Local MongoDB

1. Install MongoDB locally:
   - macOS: `brew install mongodb-community`
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Linux: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. Start MongoDB:
   ```bash
   mongod
   ```

3. Connection string: `mongodb://localhost:27017/parking-qr`

## Environment Variables

Set the following environment variable:

```bash
# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parking-qr?retryWrites=true&w=majority

# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/parking-qr
```

## Render Deployment

1. In your Render dashboard, go to your backend service
2. Navigate to "Environment" tab
3. Add environment variable:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB connection string
4. Also set:
   - Key: `DB_TYPE`
   - Value: `mongodb`

## Database Configuration

The application automatically detects MongoDB if `MONGODB_URI` is set. You can also explicitly set:

```bash
DB_TYPE=mongodb
MONGODB_URI=your_connection_string
```

## Fallback to JSON

If MongoDB is not configured, the application will fall back to JSON file-based storage for local development.

