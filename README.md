# Parking QR - Secure Vehicle Communication

A React application that enables secure, private communication between car owners and people who need to contact them in parking-related situations. The system uses masked calls to protect privacy - personal phone numbers are never revealed.

## Vision

To make car ownership tension-free by enabling easy, secure communication between car owners in parking-related situations, and later evolving into a one-stop digital platform for car utilities, services, and marketplace.

## Features

- 🚗 Generate personalized parking QR codes with unique IDs
- 🔒 **Masked Call System** - Personal phone numbers are never revealed
- 📱 QR codes link to a secure web page for contact
- 👤 User tracking by email
- 🆓 Free tier: 3 QR codes per user
- ⭐ Premium tier: Unlimited QR codes
- 💳 Premium upgrade functionality
- 📊 Real-time QR code limit tracking
- 🌐 Two-page architecture: Generator and Scanner pages

## Tech Stack

### Frontend
- React 19
- React Router DOM (for routing)
- Vite
- QRCode.react

### Backend
- Node.js
- Express.js
- **Supabase** (PostgreSQL database) - Production ready
- JSON file database (for local development)
- Masked call infrastructure (ready for Twilio integration)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Start the Backend Server

```bash
cd server
npm start
```

The backend server will run on `http://localhost:3001`

### 4. Start the Frontend Development Server

In a new terminal:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or the port shown in terminal)

## Environment Variables

### Frontend (.env in root directory)

```env
VITE_API_URL=http://localhost:3001/api
```

For production, set this to your deployed backend URL:
```env
VITE_API_URL=https://your-backend.railway.app/api
```

### Backend (server/.env)

For local development with JSON database (default):
- No environment variables needed

For Supabase (production):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:5173
PORT=3001
```

For production deployment, set `FRONTEND_URL` to your deployed frontend URL.

## Deployment

**Quick Start**: See [QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md) for a step-by-step guide.

**Detailed Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

The app can be deployed to:
- **Frontend**: Vercel, Netlify, or any static host
- **Backend**: Railway, Render, Fly.io, or any Node.js host
- **Database**: Supabase (included in setup)

## Usage

### For Car Owners (Generating QR Codes)

1. Fill in your details (name, email, address, phone number)
2. Click "Generate QR Code"
3. Download and print the QR code
4. Place it on your vehicle
5. When someone scans your QR code, they can contact you through a secure masked call system

### For People Scanning QR Codes

1. Scan the QR code on a vehicle
2. You'll be taken to a secure page showing the owner's name and address
3. Click "Call Owner (Masked)" to initiate a call
4. Your phone number stays private, and the owner's number is never revealed to you

### Free Tier
- New users start with the free plan
- Can generate up to 3 QR codes
- QR code count is tracked by email

### Premium Tier
- Unlimited QR codes
- Upgrade available after reaching the free limit
- $9.99/month (payment integration can be added)

## API Endpoints

### Get User Info
```
GET /api/user/:email
```

### Generate QR Code
```
POST /api/qr/generate
Body: { email, name, address, phone }
Returns: { success, qrCode: { id, qrValue, ... }, user: {...} }
```

### Get QR Code Info (for scanning page)
```
GET /api/qr/:qrId
Returns: { id, name, address, createdAt }
```

### Initiate Masked Call
```
POST /api/call/initiate
Body: { qrId, callerPhone }
Returns: { success, maskedNumber, message }
```

### Get User's QR Codes
```
GET /api/qr/user/:email
```

### Upgrade to Premium
```
POST /api/user/upgrade
Body: { email, paymentToken }
```

## Project Structure

```
parking-qr/
├── src/
│   ├── App.jsx              # Main router component
│   ├── App.css              # Generator page styles
│   ├── pages/
│   │   ├── GeneratorPage.jsx    # QR code generation page
│   │   ├── ScanPage.jsx         # QR code scanning page
│   │   └── ScanPage.css         # Scanner page styles
│   ├── services/
│   │   └── api.js           # API service functions
│   └── main.jsx             # Entry point
├── server/
│   ├── server.js            # Express server with masked call endpoints
│   ├── package.json         # Backend dependencies
│   └── database.json        # JSON database (created automatically)
└── package.json             # Frontend dependencies
```

## Database

The backend uses a JSON file (`server/database.json`) for data storage. This is suitable for development and small deployments. For production, consider:

- MongoDB
- PostgreSQL
- MySQL
- Firebase

## Masked Call System

The application implements a masked call system to protect user privacy:

1. **QR Code Generation**: Each QR code contains a unique ID that links to a web page (not a direct phone number)
2. **Scanning**: When someone scans the QR code, they're taken to `/scan/:qrId` page
3. **Call Initiation**: The scanner can initiate a call through the backend API
4. **Privacy Protection**: The owner's phone number is never revealed to the caller

### Twilio Integration (Production)

To enable actual masked calls in production:

1. Install Twilio SDK: `npm install twilio` (in server directory)
2. Set environment variables:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```
3. Update the `/api/call/initiate` endpoint in `server/server.js` to use Twilio
4. The endpoint will:
   - Get or create a masked number for the owner
   - Initiate a call from the caller to the masked number
   - Route the masked number to the owner's actual phone

See the TODO comments in `server/server.js` for implementation details.

## Payment Integration

The upgrade endpoint currently accepts a `paymentToken` but doesn't verify payments. To add payment processing:

1. Install payment SDK (Stripe, PayPal, etc.)
2. Verify payment tokens before upgrading
3. Handle subscription management
4. Add webhook handlers

Example with Stripe:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Verify payment and upgrade user
```

## Building for Production

### Frontend
```bash
npm run build
```

### Backend
The backend server can be deployed to:
- Heroku
- Railway
- Render
- AWS
- DigitalOcean

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
