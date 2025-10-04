# Balboa Web SDK

A React SDK for voice verification and fraud prevention in web applications.

## Installation

```bash
npm install @balboa/web
```

## Setup

**No additional setup required!**

The SDK uses Stitches (CSS-in-JS) for styling, which means:
- ✅ No CSS imports needed
- ✅ No Tailwind configuration required
- ✅ Works in any React app out of the box
- ✅ Zero runtime overhead
- ✅ Type-safe styles

## Usage

### Basic Voice Verification

```tsx
import { VoiceVerificationDialog } from '@balboa/web';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <VoiceVerificationDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSuccess={() => {
        console.log('Verification successful!');
        setIsOpen(false);
      }}
      email="user@example.com"
    />
  );
}
```

### Using the Hook

```tsx
import { useBalboaVerification } from '@balboa/web';

function CheckoutPage() {
  const { 
    isVerifying, 
    result, 
    error, 
    startVerification 
  } = useBalboaVerification({
    email: "user@example.com"
  });

  return (
    <div>
      <button onClick={startVerification} disabled={isVerifying}>
        {isVerifying ? 'Verifying...' : 'Verify with Voice'}
      </button>

      {result?.verified && (
        <div className="text-green-600">
          Verification successful!
        </div>
      )}

      {error && (
        <div className="text-red-600">
          Verification failed: {error.message}
        </div>
      )}
    </div>
  );
}
```

## Components

### VoiceVerificationDialog

A complete modal dialog for voice verification with built-in UI states:

- **Green indicator**: User is speaking
- **Orange indicator**: Assistant is thinking/processing
- **Red indicator**: Call has ended
- **Automatic call termination**: When modal is closed

Props:
- `isOpen`: boolean - Controls modal visibility
- `onClose`: () => void - Called when modal is closed
- `onSuccess`: () => void - Called when verification succeeds
- `email`: string - Customer's email address for verification
- `riskLevel?`: number - Risk threshold (default: 75)

## Styling

The SDK uses **Stitches** (CSS-in-JS) for styling, which provides:

- **Zero runtime overhead**: Styles are generated at build time
- **Type safety**: All styles are type-checked
- **No configuration**: Works in any React app without setup
- **Tree shaking**: Only used styles are included in the bundle
- **Theme support**: Built-in design system with consistent colors and spacing

### Customization

You can customize the appearance by passing custom styles to the components:

```tsx
<VoiceVerificationDialog
  // ... other props
  style={{
    '--balboa-primary': '#your-brand-color',
    '--balboa-radius': '8px',
  }}
/>
```

### Build Issues

If you encounter build issues:

1. Make sure all peer dependencies are installed
2. Check that your React version is compatible (^19)
3. Ensure TypeScript is properly configured
