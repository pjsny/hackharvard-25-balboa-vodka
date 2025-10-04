# Balboa Checkout Demo

A Next.js e-commerce checkout flow demonstration featuring Balboa voice verification for high-risk transactions.

## Features

- **Storefront**: Browse and select products from a mock e-commerce store
- **Product Details**: View detailed product information and add items to cart
- **Shopping Cart**: Review selected items before checkout
- **Secure Checkout**: Complete payment with intelligent fraud detection
- **Balboa Integration**: Voice verification for high-risk transactions

## Pages

1. **`/` (Storefront)**: Product listing and browsing
2. **`/product/[id]`**: Individual product details
3. **`/cart`**: Shopping cart review and management
4. **`/checkout`**: Payment processing with Balboa verification

## Balboa Integration

The checkout process includes a simulated fraud detection system that triggers Balboa voice verification for high-risk transactions. When a transaction is flagged as high-risk, users must complete voice verification by speaking the secret phrase "Balboa verification complete".

### Verification Process

1. **Secret Phrase Verification**: User speaks the enrollment phrase
2. **Voice Embedding Similarity**: System compares voice characteristics
3. **Audio Fingerprint**: Cryptographic validation of the audio file

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **Lucide React**: Icon library

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Storefront homepage
│   ├── product/[id]/      # Product detail pages
│   ├── cart/              # Shopping cart page
│   └── checkout/          # Checkout with Balboa integration
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   └── Navigation.tsx    # Main navigation
├── contexts/             # React contexts
│   └── CartContext.tsx   # Shopping cart state management
├── data/                 # Mock data and utilities
│   └── products.ts      # Product data
├── lib/                 # Utility functions
│   └── utils.ts        # Common utilities
└── types/               # TypeScript type definitions
    └── index.ts        # Application types
```

## Testing the Balboa Flow

To trigger the Balboa verification flow, try these test scenarios:

1. Use a card number containing "1111"
2. Use an email containing "test"
3. Make a purchase over $500
4. Use ZIP code "12345"

Any combination of these factors will trigger the high-risk assessment and require voice verification.
