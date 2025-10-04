# @balboa/web

Balboa Voice Verification Web SDK - Frontend components and hooks for e-commerce fraud prevention using ElevenLabs voice verification.

## Installation

```bash
npm install @balboa/web
# or
yarn add @balboa/web
# or
pnpm add @balboa/web
```

## Quick Start

### React Integration with Voice Dialog

```typescript
import { VoiceVerificationDialog } from '@balboa/web'

function CheckoutComponent() {
  const [showVerification, setShowVerification] = useState(false)
  const [email, setEmail] = useState('')

  const handleVerificationSuccess = () => {
    console.log('Voice verification successful!')
    setShowVerification(false)
    // Proceed with payment
  }

  return (
    <>
      <button onClick={() => setShowVerification(true)}>
        Start Voice Verification
      </button>

      <VoiceVerificationDialog
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onSuccess={handleVerificationSuccess}
        email={email}
        config={{
          apiKey: process.env.NEXT_PUBLIC_BALBOA_API_KEY,
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
        }}
      />
    </>
  )
}
```

### Using the Hook API

```typescript
import { useBalboa } from '@balboa/web'

function CheckoutComponent() {
  const { verifyWithBalboa, isLoading, result, error } = useBalboa({
    apiKey: process.env.NEXT_PUBLIC_BALBOA_API_KEY,
    baseUrl: process.env.NEXT_PUBLIC_BALBOA_API_URL,
  })

  const handleVerification = async () => {
    try {
      const result = await verifyWithBalboa({
        email: 'user@example.com'
      })

      if (result.success && result.verified) {
        console.log('Verification successful!')
        // Proceed with payment
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

### Direct Component Usage

```typescript
import { BalboaVerificationPopup } from '@balboa/web'

function CustomVerification() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <BalboaVerificationPopup
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onVerified={() => {
        console.log('Verification completed!')
        setIsOpen(false)
      }}
      secretPhrase="Your custom phrase"
      config={{
        apiKey: process.env.NEXT_PUBLIC_BALBOA_API_KEY,
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
      }}
    />
  )
}
```

### Simple Function API

```typescript
import { verifyWithBalboa } from '@balboa/web'

const result = await verifyWithBalboa({
  email: 'user@example.com'
}, {
  apiKey: 'your-api-key',
  baseUrl: 'https://api.balboa.vodka'
})
```

## Configuration

### BalboaConfig

```typescript
interface BalboaConfig {
  apiKey?: string              // Optional: Your Balboa API key
  baseUrl: string              // Required: Balboa API base URL
  environment?: 'sandbox' | 'production'  // Default: 'production'
  timeout?: number            // Default: 30000ms
  retries?: number            // Default: 3
  agentId?: string            // Optional: ElevenLabs Agent ID
}
```

### VerificationOptions

```typescript
interface VerificationOptions {
  email: string               // Required: Customer's email address
  timeout?: number           // Optional: Custom timeout
  retries?: number           // Optional: Custom retry count
  onProgress?: (status: VerificationStatus) => void  // Optional: Progress callback
}
```

## Components

### VoiceVerificationDialog

A complete voice verification dialog component with ElevenLabs integration.

**Props:**
```typescript
interface VoiceVerificationDialogProps {
  isOpen: boolean            // Whether dialog is open
  onClose: () => void       // Called when dialog closes
  onSuccess: () => void     // Called on successful verification
  email: string             // Customer's email address
  config?: {                // Optional configuration
    apiKey?: string
    agentId?: string
  }
}
```

### BalboaVerificationPopup

The core verification popup component with custom styling and controls.

**Props:**
```typescript
interface BalboaVerificationPopupProps {
  open: boolean              // Whether popup is open
  onClose: () => void       // Called when popup closes
  onVerified: () => void    // Called on successful verification
  secretPhrase?: string     // Optional: Custom secret phrase
  config?: {                // Optional configuration
    apiKey?: string
    agentId?: string
  }
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

### React Hooks

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

#### `useElevenLabsVerification(config: ElevenLabsConfig): UseElevenLabsReturn`

Low-level hook for ElevenLabs voice conversation integration.

**Returns:**
```typescript
interface UseElevenLabsReturn {
  conversation: Conversation | null
  startVerification: (sessionId: string, options: SessionOptions) => Promise<void>
  stopVerification: () => Promise<void>
  isActive: boolean
  result: ElevenLabsCallResult | null
  error: Error | null
  isSpeaking: boolean
  status: string
}
```

## Styling

The SDK uses **Stitches** for styling and provides a complete design system with:

- **High-contrast black and white theme**
- **Customizable verification steps display**
- **Real-time audio level visualization**
- **Responsive design**
- **Accessibility features**

### Custom Styling

You can customize the appearance by overriding Stitches theme tokens:

```typescript
import { createTheme } from '@balboa/web'

const customTheme = createTheme({
  colors: {
    primary: '#your-color',
    // ... other theme tokens
  }
})
```

## Error Handling

The SDK throws `BalboaError` instances for different failure scenarios:

```typescript
import { BalboaError } from '@balboa/web'

try {
  const result = await verifyWithBalboa(options)
} catch (error) {
  if (error instanceof BalboaError) {
    switch (error.code) {
      case 'MICROPHONE_DENIED':
        // Handle microphone permission denied
        break
      case 'VERIFICATION_FAILED':
        // Handle verification failure
        break
      case 'TIMEOUT':
        // Handle timeout
        break
      case 'API_ERROR':
        // Handle API errors
        break
      case 'NETWORK_ERROR':
        // Handle network errors
        break
    }
  }
}
```

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Support**: iOS Safari 13+, Chrome Mobile 80+
- **WebRTC Required**: For microphone access and audio processing
- **HTTPS Required**: For microphone access in production
- **Web Audio API**: For real-time audio level visualization

## Environment Variables

For React applications, you can set these environment variables:

```bash
NEXT_PUBLIC_BALBOA_API_KEY=your-api-key
NEXT_PUBLIC_BALBOA_API_URL=https://api.balboa.vodka
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-agent-id
```

## Features

- ✅ **ElevenLabs Integration** - Powered by ElevenLabs conversational AI
- ✅ **Real-time Audio Visualization** - Live microphone level monitoring
- ✅ **Voice Verification** - Multi-factor voice authentication
- ✅ **Customizable UI** - Stitches-based styling system
- ✅ **TypeScript Support** - Full type safety
- ✅ **React Hooks** - Easy integration with React applications
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Accessibility** - WCAG compliant components
- ✅ **Mobile Responsive** - Works on all device sizes

## License

MIT
