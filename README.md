# BFHL Express Server

A Node.js Express server with a POST endpoint `/bfhl` that processes data.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Endpoints

### POST /bfhl
Processes an array of data and separates numbers and alphabets.

**Request body:**
```json
{
  "data": ["A", "1", "B", "2", "C"]
}
```

**Success response (200):**
```json
{
  "is_success": true,
  "user_id": "john_doe_17091999",
  "email": "john@example.com",
  "roll_number": "ABCD123",
  "numbers": ["1", "2"],
  "alphabets": ["A", "B", "C"],
  "highest_alphabet": ["C"]
}
```

**Error response (400/500):**
```json
{
  "is_success": false,
  "message": "Error description"
}
```

### GET /bfhl
Health check endpoint.

**Response:**
```json
{
  "operation_code": 1
}
```

## Features

- ✅ Express.json() middleware for parsing JSON requests
- ✅ POST endpoint for data processing
- ✅ GET endpoint for health check
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Runs on port 3000
