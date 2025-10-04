# @balboa/server-sdk

Server-side SDK for Balboa voice verification system. This SDK provides a client interface to call your Balboa backend API endpoints.

## Features

- 🔌 **Backend API Client** - Simple interface to call your Balboa backend
- 🔄 **Automatic Retries** - Built-in retry logic with exponential backoff
- ✅ **Type Safety** - Full TypeScript support with Zod validation
- 🛡️ **Error Handling** - Comprehensive error handling and transformation
- 📡 **HTTP Client** - Handles authentication, timeouts, and retries

## Installation

```bash
npm install @balboa/server-sdk
# or
pnpm add @balboa/server-sdk
# or
yarn add @balboa/server-sdk
```

## Quick Start

```typescript
import { BalboaServerClient } from "@balboa/server-sdk";

const client = new BalboaServerClient({
  baseUrl: "https://api.balboa.com", // Your backend API URL
  apiKey: process.env.BALBOA_API_KEY, // Your API key
  environment: "production",
});

// Create verification session
const session = await client.createVerificationSession({
  email: "user@example.com",
});

// Get verification status
const status = await client.getVerificationStatus(session.id);

// Submit VAPI result
await client.submitVapiResult(session.id, {
  callId: "call_123",
  recording: "base64_audio_data",
  transcript: "Balboa verification complete",
});
```

## API Reference

### BalboaServerClient

#### `createVerificationSession(request)`

Creates a new verification session by calling your backend.

**Parameters:**
- `request.email` (string) - Customer's email address for verification

**Returns:** `Promise<CreateVerificationResponse>`

**Backend Endpoint:** `POST /api/verify`

#### `getVerificationStatus(sessionId)`

Gets the current status of a verification session from your backend.

**Parameters:**
- `sessionId` (string) - Session identifier

**Returns:** `Promise<VerificationStatusResponse>`

**Backend Endpoint:** `GET /api/verify/{sessionId}/status`

#### `submitVapiResult(sessionId, vapiResult)`

Submits VAPI call result to your backend for processing.

**Parameters:**
- `sessionId` (string) - Session identifier
- `vapiResult.callId` (string) - VAPI call identifier
- `vapiResult.recording` (string) - Audio recording data
- `vapiResult.transcript` (string) - Transcribed text
- `vapiResult.summary` (string, optional) - Call summary

**Returns:** `Promise<{ success: boolean }>`

**Backend Endpoint:** `POST /api/verify/{sessionId}/vapi-result`

#### `getSession(sessionId)`

Gets full session details from your backend.

**Parameters:**
- `sessionId` (string) - Session identifier

**Returns:** `Promise<VerificationSession | null>`

**Backend Endpoint:** `GET /api/verify/{sessionId}`

#### `listSessions()`

Lists all sessions from your backend (admin endpoint).

**Returns:** `Promise<VerificationSession[]>`

**Backend Endpoint:** `GET /api/verify/sessions`

## Configuration

```typescript
interface BalboaServerConfig {
  baseUrl: string;           // Your backend API URL
  apiKey?: string;          // Your API key for authentication
  environment?: "sandbox" | "production";
  timeout?: number;         // Request timeout in milliseconds
  retries?: number;         // Number of retry attempts
}
```

## Required Backend Endpoints

Your backend must implement these endpoints:

### 1. Create Verification Session
```
POST /api/verify
Content-Type: application/json
Authorization: Bearer {apiKey}

{
  "email": "string"
}

Response:
{
  "id": "string",
  "status": "pending" | "completed" | "failed"
}
```

### 2. Get Verification Status
```
GET /api/verify/{sessionId}/status
Authorization: Bearer {apiKey}

Response:
{
  "status": "pending" | "completed" | "failed",
  "verified": "boolean | null",
  "confidence": "number | null",
  "error": "string | null",
  "details": "object | null"
}
```

### 3. Submit VAPI Result
```
POST /api/verify/{sessionId}/vapi-result
Content-Type: application/json
Authorization: Bearer {apiKey}

{
  "callId": "string",
  "recording": "string",
  "transcript": "string",
  "summary": "string"
}

Response:
{
  "success": true
}
```

### 4. Get Session Details (Optional)
```
GET /api/verify/{sessionId}
Authorization: Bearer {apiKey}

Response: VerificationSession object
```

### 5. List Sessions (Optional - Admin)
```
GET /api/verify/sessions
Authorization: Bearer {apiKey}

Response: VerificationSession[]
```

## Error Handling

```typescript
import { BalboaServerError } from "@balboa/server-sdk";

try {
  const result = await client.createVerificationSession(request);
} catch (error) {
  if (error instanceof BalboaServerError) {
    console.error(`Error ${error.code}: ${error.message}`);
    console.error(`Status: ${error.statusCode}`);
  }
}
```

## Environment Variables

```bash
BALBOA_API_URL=https://api.balboa.com
BALBOA_API_KEY=your_api_key_here
```

## License

MIT
