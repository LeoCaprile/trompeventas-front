# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Security

**NEVER commit sensitive information** such as API keys, secrets, tokens, passwords, or credentials to the repository. This includes:
- `.env` files (already in `.gitignore`)
- Hardcoded secrets in source code
- Private keys or certificates
- Session secrets (e.g., the `secrets` array in `sessionStorage` should use an environment variable in production)

Use environment variables for all sensitive configuration. If a secret is accidentally committed, it must be rotated immediately — removing it from future commits does NOT remove it from git history.

## Project Overview

This is a React Router 7 e-commerce storefront application built with TypeScript, using server-side rendering (SSR). The app connects to a backend API at `http://localhost:8080` for products and authentication.

## Development Commands

- **Start dev server**: `pnpm dev` (runs on http://localhost:5173)
- **Build for production**: `pnpm build`
- **Start production server**: `pnpm start`
- **Type checking**: `pnpm typecheck` (generates types first, then runs tsc)

Note: This project uses `pnpm` as the package manager.

## Architecture

### Routing Structure

Routes are defined in `app/routes.ts` using React Router's file-based routing config:

```typescript
layout("./routes/main-layout.tsx", [
  index("routes/home.tsx"),
  route("/products/:id", "routes/product-detail.tsx"),
  route("/sign-in", "routes/sign-in.tsx"),
])
```

- **Layouts**: `main-layout.tsx` wraps pages and provides the header with user data
- **Route modules**: Each route file exports `loader`, `action`, `meta`, and default component
- **Type safety**: Routes use auto-generated types via `Route.LoaderArgs`, `Route.ComponentProps`, etc. from `./+types/[route-name]`

### Authentication Flow (Single-Cookie Architecture)

Authentication uses `remix-auth` with a form-based strategy and a single httpOnly `__session` cookie:

1. **Session storage**: Cookie-based session configured in `app/services/auth/auth.ts`
2. **Session data**: Stores `{ user, accessToken, refreshToken }` in the `__session` cookie
3. **Sign-in**: Backend returns tokens in JSON body; frontend stores them in session cookie
4. **Sign-out**: Frontend reads refreshToken from session, sends to backend for revocation, then destroys session
5. **Google OAuth**: Uses one-time exchange code pattern — backend redirects with code, frontend exchanges for user + tokens
6. **Protected routes**: Loaders read session and redirect to `/sign-in` if not authenticated
7. **API calls**: For authenticated server-side calls, read accessToken from session and send as `Authorization: Bearer` header

### API Integration

- **Client**: `app/services/client.ts` exports `apiClient` (ky-based HTTP client)
- **Base URL**: Hardcoded to `http://localhost:8080` — update for production
- **No cookies sent to backend**: The API client does not use `credentials: "include"`. Authentication is handled via Authorization headers from server-side loaders/actions.
- **Services**: Domain services in `app/services/` (e.g., `products/products.ts`, `auth/auth.ts`)

### State Management

- **Server state**: React Query (`@tanstack/react-query`) configured in `root.tsx` with 60s stale time
- **Client state**: Zustand stores in `app/stores/` (e.g., `user/user.store.ts`)
- **Session state**: React Router loaders provide server-rendered data via `loaderData` prop

### UI Components

- **Component library**: shadcn/ui (New York style) configured in `components.json`
- **Styling**: Tailwind CSS 4.x with CSS variables for theming
- **Components**: UI primitives in `app/components/ui/`, domain components in `app/components/`
- **Icons**: Lucide React
- **Path alias**: `~/` maps to `./app/` (configured in `tsconfig.json`)

### Data Flow Pattern

1. **Route loader** fetches data server-side (can access cookies/sessions)
2. **Loader data** passed to component via `loaderData` prop
3. **Client mutations** use React Query or form actions
4. **Form actions** handle POST/PUT/DELETE, return data or redirect

## Key Conventions

- **Import alias**: Use `~/` for imports from `app/` directory (e.g., `~/components/header`)
- **Type imports**: Route types auto-generated in `.react-router/types/` — import from `./+types/[route]`
- **Loader/Action pattern**: Server functions that run before component render
- **Error boundaries**: Defined in `root.tsx` for global error handling

## Backend Integration

The backend API provides:

- `POST /auth/sign-in` - Returns `{ user, accessToken, refreshToken }`
- `POST /auth/sign-out` - Accepts `{ refreshToken }` in body
- `POST /auth/refresh` - Accepts `{ refreshToken }`, returns new tokens
- `GET /auth/me` - Returns `{ user }` (requires Authorization header)
- `GET /auth/oauth/google` - Returns `{ authUrl }`
- `POST /auth/oauth/google/exchange` - Returns `{ user, accessToken, refreshToken }`
- `GET /products` - Returns `Product[]`
- `GET /products/:id` - Returns `Product`

Products have structure: `{ product: ProductDetails, images: Image[], categories: Category[] }`
