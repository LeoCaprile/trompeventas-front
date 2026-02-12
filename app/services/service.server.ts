import ky from "ky";

export const serverApiClient = ky.create({
  prefixUrl: process.env.VITE_API_URL,
});
