# Trompeventas - Frontend

A modern e-commerce storefront built with React Router 7, TypeScript, and Tailwind CSS. Trompeventas is a Chilean marketplace platform where users can buy and sell products locally.

## 🚀 Tech Stack

- **Framework:** React Router 7 with Server-Side Rendering (SSR)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.x
- **UI Components:** shadcn/ui (New York style)
- **State Management:**
  - React Query (@tanstack/react-query) for server state
  - Zustand for client state
- **Authentication:** remix-auth with cookie-based sessions
- **HTTP Client:** ky
- **Icons:** Lucide React
- **Package Manager:** pnpm
- **Testing:**
  - Playwright for E2E tests
  - Vitest for unit tests

## 📋 Prerequisites

- Node.js 18+
- pnpm (install with `npm install -g pnpm`)
- Backend API running on `http://localhost:8080`

## 🛠️ Installation

```bash
# Clone the repository
git clone git@github.com:LeoCaprile/trompeventas-front.git
cd trompeventas-front

# Install dependencies
pnpm install
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Session secret for cookie encryption (required for production)
SESSION_SECRET=your-secret-key-here

# API base URL (optional, defaults to http://localhost:8080)
API_BASE_URL=http://localhost:8080
```

## 🚦 Development

```bash
# Start development server (runs on http://localhost:5173)
pnpm dev

# Type checking
pnpm typecheck

# Run E2E tests
pnpm test:e2e

# Run unit tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
app/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── routes/             # Route modules (pages)
│   ├── main-layout.tsx # Main layout wrapper
│   └── ...             # Page routes
├── services/           # API services
│   ├── auth/          # Authentication service
│   ├── products/      # Products service
│   └── client.ts      # HTTP client configuration
├── stores/            # Zustand stores
├── constants/         # App constants
├── lib/              # Utilities
└── root.tsx          # App root component

e2e/                  # Playwright E2E tests
├── fixtures/        # Test fixtures
├── helpers/         # Test helpers
└── tests/           # Test files

public/              # Static assets
```

## 🔐 Authentication

The app uses a single-cookie architecture:
- Session data stored in httpOnly `__session` cookie
- Contains `{ user, accessToken, refreshToken }`
- Automatic token refresh on expiration
- Server-side session management with `remix-auth`

### Authentication Flow

1. User signs in → receives tokens in JSON response
2. Frontend stores tokens in session cookie
3. Protected routes check session in loaders
4. API calls use `authenticatedFetch` for automatic token refresh
5. Token validation happens in `main-layout` on every navigation

## 🔌 API Integration

- **Base URL:** `http://localhost:8080`
- **Client:** ky-based HTTP client in `app/services/client.ts`
- **Auth:** Bearer token in `Authorization` header (server-side only)
- **No cookies sent to backend** - authentication via headers only

## 🧪 Testing

### E2E Tests (Playwright)

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm exec playwright test e2e/tests/auth.spec.ts

# Run with UI
pnpm exec playwright test --ui

# Generate test report
pnpm exec playwright show-report
```

Tests use persistent test users (`e2e-test@trompeventas.test`) with cleanup after each run.

### Unit Tests (Vitest)

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## 📱 Features

- 🛍️ Product browsing and search
- 👤 User authentication (email/password + Google OAuth)
- 📧 Email verification
- 📦 Product publishing and management
- 💬 Product comments
- 👤 User profiles with Chilean location fields (Region/City)
- 🎨 Responsive design with mobile menu
- 🔍 URL-based search (`/?q=term`)
- 🖼️ Image uploads with presigned URLs

## 🌐 Key Routes

- `/` - Home page with product listings
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/profile` - User profile
- `/my-products` - User's published products
- `/publish-product` - Publish new product
- `/products/:id` - Product detail page
- `/verify-email` - Email verification prompt
- `/email-verified` - Email verification success

## 🎨 UI Components

Uses shadcn/ui components with customization:
- Forms with react-hook-form + zod validation
- Toast notifications with sonner
- Modals/Dialogs for interactions
- Dropdown menus for user actions
- Data tables for product management

## 📦 Key Dependencies

- `react-router` - Routing and SSR
- `@tanstack/react-query` - Server state management
- `zustand` - Client state management
- `remix-auth` - Authentication
- `ky` - HTTP client
- `tailwindcss` - Styling
- `shadcn/ui` components via Radix UI
- `lucide-react` - Icons

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[Add your license here]

## 🔗 Related

- Backend API: [trompeventas-back](https://github.com/LeoCaprile/trompeventas-back)
