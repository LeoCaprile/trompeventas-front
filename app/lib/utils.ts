import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiClientUrl() {
  if (typeof window !== "undefined") {
    return import.meta.env.VITE_API_URL;
  }
  return process.env.VITE_API_URL;
}
