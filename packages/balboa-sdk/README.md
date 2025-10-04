# @balboa/sdk

Balboa Voice Verification SDK for e-commerce fraud prevention.

## Installation

```bash
npm install @balboa/sdk
# or
yarn add @balboa/sdk
# or
pnpm add @balboa/sdk
```

## Quick Start

### Basic Usage

```typescript
import { BalboaClient } from '@balboa/sdk'

const client = new BalboaClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.balboa.vodka'
})

const result = await client.verifyWithBalboa({
  transactionId: 'txn_123',
  customerData: { email: 'user@example.com' },
  riskLevel: 75
})

if (result.success && result.verified) {
  // Proceed with payment
  console.log('Verification successful!')
}
```

### React Integration

```typescript
import { useBalboa } from '@balboa/sdk'

function CheckoutComponent() {
  const { verifyWithBalboa, isLoading, result, error } = useBalboa()

  const handleVerification = async () => {
    try {
      const result = await verifyWithBalboa({
        transactionId: generateTransactionId(),
        customerData: checkoutData
      })

      if (result.success && result.verified) {
        await processPayment()
      }
    } catch (error) {
      console.error('Verification failed:', error)
    }
  }

  return (
    <button onClick={handleVerification} disabled={isLoading}>
      {isLoading ? 'Verifying...' : 'Start Verification'}
    </button>
  )
}
```

### Simple Function API

```typescript
import { verifyWithBalboa } from '@balboa/sdk'

const result = await verifyWithBalboa({
  transactionId: 'txn_123',
  customerData: { email: 'user@example.com' }
})
```

## Configuration

### BalboaConfig

```typescript
interface BalboaConfig {
  apiKey: string              // Required: Your Balboa API key
  baseUrl: string             // Required: Balboa API base URL
  environment?: 'sandbox' | 'production'  // Default: 'production'
  timeout?: number            // Default: 30000ms
  retries?: number            // Default: 3
}
```

### VerificationOptions

```typescript
interface VerificationOptions {
  transactionId: string       // Required: Unique transaction ID
  customerData: object        // Required: Customer/checkout data
  riskLevel?: number          // Optional: Risk score (0-100)
  timeout?: number           // Optional: Custom timeout
  retries?: number           // Optional: Custom retry count
  onProgress?: (status) => void  // Optional: Progress callback
}
```

## API Reference

### BalboaClient

#### `verifyWithBalboa(options: VerificationOptions): Promise<VerificationResult>`

Main verification function that handles the entire voice verification flow.

**Returns:**
```typescript
interface VerificationResult {
  success: boolean           // Whether verification completed successfully
  verified: boolean          // Whether voice was verified
  confidence: number         // Confidence score (0.0-1.0)
  sessionId: string          // Verification session ID
  details?: VerificationDetails  // Additional verification details
}
```

### React Hook

#### `useBalboa(config?: BalboaConfig): UseBalboaReturn`

React hook for managing verification state.

**Returns:**
```typescript
interface UseBalboaReturn {
  verifyWithBalboa: (options: VerificationOptions) => Promise<VerificationResult>
  isLoading: boolean         // Whether verification is in progress
  result: VerificationResult | null  // Last verification result
  error: Error | null        // Last error
}
```

## Error Handling

The SDK throws `BalboaError` instances for different failure scenarios:

```typescript
import { BalboaError, ERROR_CODES } from '@balboa/sdk'

try {
  const result = await client.verifyWithBalboa(options)
} catch (error) {
  if (error instanceof BalboaError) {
    switch (error.code) {
      case ERROR_CODES.MICROPHONE_DENIED:
        // Handle microphone permission denied
        break
      case ERROR_CODES.VERIFICATION_FAILED:
        // Handle verification failure
        break
      case ERROR_CODES.TIMEOUT:
        // Handle timeout
        break
      case ERROR_CODES.API_ERROR:
        // Handle API errors
        break
    }
  }
}
```

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Support**: iOS Safari 13+, Chrome Mobile 80+
- **WebRTC Required**: For VAPI voice functionality
- **HTTPS Required**: For microphone access in production

## Environment Variables

For React applications, you can set these environment variables:

```bash
NEXT_PUBLIC_BALBOA_API_KEY=your-api-key
NEXT_PUBLIC_BALBOA_API_URL=https://api.balboa.vodka
```

## License

MIT
