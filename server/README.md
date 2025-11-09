# Parking QR Code Generator - Backend Server

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Server will run on:** `http://localhost:3001`

## API Endpoints

### Get User Info
- **GET** `/api/user/:email`
- Returns user information, plan, and QR code count

### Generate QR Code
- **POST** `/api/qr/generate`
- Body: `{ email, name, address, phone }`
- Returns QR code data if within limits

### Get User's QR Codes
- **GET** `/api/qr/user/:email`
- Returns all QR codes for a user

### Upgrade to Premium
- **POST** `/api/user/upgrade`
- Body: `{ email, paymentToken }`
- Upgrades user to premium plan

## Database

The server uses a JSON file (`database.json`) for data storage. For production, consider using MongoDB, PostgreSQL, or another database.

## Features

- ✅ Free tier: 3 QR codes per user
- ✅ Premium tier: Unlimited QR codes
- ✅ User tracking by email
- ✅ QR code generation with limits
- ✅ Premium upgrade functionality

## Payment Integration

Currently, the upgrade endpoint accepts a `paymentToken` parameter but doesn't verify payments. To integrate with a payment gateway:

1. Add Stripe, PayPal, or another payment SDK
2. Verify payment tokens before upgrading
3. Handle subscription management
4. Add webhook handlers for payment events








