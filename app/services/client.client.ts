import ky from "ky";

// Client-side client (for components and client-side code)
export const clientApiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
});
