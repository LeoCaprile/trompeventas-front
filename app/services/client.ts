import ky from "ky";

// Server-side client (for loaders, actions, and server-side code)
export const serverApiClient = ky.create({
  prefixUrl: process.env.VITE_API_URL,
});

// Client-side client (for components and client-side code)
export const clientApiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
});
