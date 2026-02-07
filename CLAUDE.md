# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- **Layouts**: `main-layout.tsx` wraps authenticated pages and provides the header with user data
- **Route modules**: Each route file exports `loader`, `action`, `meta`, and default component
- **Type safety**: Routes use auto-generated types via `Route.LoaderArgs`, `Route.ComponentProps`, etc. from `./+types/[route-name]`

### Authentication Flow

Authentication uses `remix-auth` with form-based strategy:

1. **Session storage**: Cookie-based sessions configured in `app/services/auth/auth.ts`
2. **Authenticator**: Form strategy that calls backend `/auth/sign-in` endpoint
3. **Session data**: Stores `{ token, user }` in cookie session after successful login
4. **Protected routes**: Loaders check session and redirect if needed
5. **API client**: Automatically attaches auth token from session to all API requests

**Important**: The session secret in `auth.ts` is hardcoded as `["s3cr3t"]` - should be replaced with environment variable for production.

### API Integration

- **Client**: `app/services/client.ts` exports `apiClient` (ky-based HTTP client)
- **Base URL**: Hardcoded to `http://localhost:8080` - update for production
- **Auth injection**: `beforeRequest` hook automatically attaches session token to headers
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
- **Type imports**: Route types auto-generated in `.react-router/types/` - import from `./+types/[route]`
- **Loader/Action pattern**: Server functions that run before component render
- **Error boundaries**: Defined in `root.tsx` for global error handling

## Backend Integration

The backend API is expected to provide:

- `POST /auth/sign-in` - Returns `{ token: string, user: UserT }`
- `GET /products` - Returns `Product[]`
- `GET /products/:id` - Returns `Product`

Products have structure: `{ product: ProductDetails, images: Image[], categories: Category[] }`
