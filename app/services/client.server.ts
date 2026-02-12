import ky from "ky";

// Server-side client (for loaders, actions, and server-side code)
export const serverApiClient = ky.create({
  prefixUrl: process.env.VITE_API_URL,
});
