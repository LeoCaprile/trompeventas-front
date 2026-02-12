import ky from "ky";

export const clientApiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
});
