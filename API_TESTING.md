# API Testing - Curl Commands for Postman

Base URL: `https://parking-qr-xage.onrender.com/api`

---

## 1. Health Check

**GET** - Check if server is running

```bash
curl --location 'https://parking-qr-xage.onrender.com/api/health'
```

**Postman:**
- Method: `GET`
- URL: `https://parking-qr-xage.onrender.com/api/health`

---

## 2. Get User Info

**GET** - Get user information by email

```bash
curl --location 'https://parking-qr-xage.onrender.com/api/user/test@example.com'
```

**Postman:**
- Method: `GET`
- URL: `https://parking-qr-xage.onrender.com/api/user/test@example.com`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "email": "test@example.com",
    "name": "Test User",
    "plan": "free",
    "qrCount": 2
  },
  "message": "User info retrieved successfully"
}
```

---

## 3. Upgrade User to Premium

**POST** - Upgrade user account to premium plan

```bash
curl --location 'https://parking-qr-xage.onrender.com/api/user/upgrade' \
--header 'Content-Type: application/json' \
--data '{
    "email": "test@example.com"
}'
```

**Postman:**
- Method: `POST`
- URL: `https://parking-qr-xage.onrender.com/api/user/upgrade`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
    "email": "test@example.com"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "email": "test@example.com",
    "plan": "premium"
  },
  "message": "Upgraded to premium successfully"
}
```

---

## 4. Generate QR Code

**POST** - Generate a new parking QR code

```bash
curl --location 'https://parking-qr-xage.onrender.com/api/qr/generate' \
--header 'Content-Type: application/json' \
--data '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "address": "123 Main St, City, State 12345",
    "phone": "+1234567890"
}'
```

**Postman:**
- Method: `POST`
- URL: `https://parking-qr-xage.onrender.com/api/qr/generate`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "address": "123 Main St, City, State 12345",
    "phone": "+1234567890"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": {
      "id": "qr-code-id-here",
      "qrValue": "https://parking-qr-xage.onrender.com/scan/qr-code-id-here",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "address": "123 Main St, City, State 12345",
      "phone": "+1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "user": {
      "email": "john.doe@example.com",
      "name": "John Doe",
      "plan": "free",
      "qrCount": 1
    }
  },
  "message": "QR code generated successfully"
}
```

---

## 5. Get QR Code Info

**GET** - Get QR code information by ID

```bash
curl --location 'https://parking-qr-xage.onrender.com/api/qr/YOUR_QR_CODE_ID_HERE'
```

**Postman:**
- Method: `GET`
- URL: `https://parking-qr-xage.onrender.com/api/qr/YOUR_QR_CODE_ID_HERE`

**Replace `YOUR_QR_CODE_ID_HERE` with actual QR code ID from generate response**

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "qr-code-id-here",
    "name": "John Doe",
    "address": "123 Main St, City, State 12345"
  },
  "message": "QR code info retrieved successfully"
}
```

---

## 6. Initiate Call

**POST** - Initiate a call to the QR code owner

```bash
curl --location 'https://parking-qr-xage.onrender.com/api/call/initiate' \
--header 'Content-Type: application/json' \
--data '{
    "qrId": "YOUR_QR_CODE_ID_HERE",
    "callerPhone": "+1987654321"
}'
```

**Postman:**
- Method: `POST`
- URL: `https://parking-qr-xage.onrender.com/api/call/initiate`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
    "qrId": "YOUR_QR_CODE_ID_HERE",
    "callerPhone": "+1987654321"
}
```

**Note:** `callerPhone` is optional if Twilio is not configured

**Example Response:**
```json
{
  "success": true,
  "data": {
    "callSid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "initiated",
    "maskedNumber": "+1234567890",
    "message": "Call initiated successfully"
  },
  "message": "Call initiated successfully"
}
```

---

## 7. Connect Call (Twilio Webhook)

**GET** - Twilio webhook to connect call to owner

```bash
curl --location 'https://parking-qr-xage.onrender.com/api/call/connect/%2B1234567890'
```

**Postman:**
- Method: `GET`
- URL: `https://parking-qr-xage.onrender.com/api/call/connect/+1234567890`

**Note:** Phone number should be URL encoded (use `%2B` for `+`)

---

## 8. Call Status (Twilio Webhook)

**POST** - Twilio status callback webhook

```bash
curl --location 'https://parking-qr-xage.onrender.com/api/call/status' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'CallSid=CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
--data-urlencode 'CallStatus=completed' \
--data-urlencode 'CallDuration=120'
```

**Postman:**
- Method: `POST`
- URL: `https://parking-qr-xage.onrender.com/api/call/status`
- Headers: `Content-Type: application/x-www-form-urlencoded`
- Body (x-www-form-urlencoded):
  - `CallSid`: `CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - `CallStatus`: `completed`
  - `CallDuration`: `120`

---

## Testing Workflow

1. **Start with Health Check** - Verify server is running
2. **Generate QR Code** - Create a new QR code (save the `qrCode.id` from response)
3. **Get User Info** - Check user's QR code count
4. **Get QR Code Info** - Verify QR code was created (use ID from step 2)
5. **Initiate Call** - Test calling functionality (use QR ID from step 2)
6. **Upgrade to Premium** - Test premium upgrade (optional)

---

## Production URL

If testing on production (Render), replace:
- `https://parking-qr-xage.onrender.com` with `https://parking-qr-xage.onrender.com`

Example:
```bash
curl --location 'https://parking-qr-xage.onrender.com/api/health'
```

