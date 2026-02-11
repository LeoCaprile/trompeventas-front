import type { TestUser } from "./test-user";

const API_BASE = "http://localhost:8080";

export async function apiSignUp(user: TestUser) {
  const res = await fetch(`${API_BASE}/auth/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiSignUp failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function apiSignIn(credentials: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch(`${API_BASE}/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiSignIn failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function apiCreateComment(
  productId: string,
  content: string,
  accessToken: string,
  parentId?: string,
) {
  const res = await fetch(`${API_BASE}/products/${productId}/comments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ content, parentId: parentId ?? null }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiCreateComment failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function apiGetProducts(): Promise<
  Array<{
    product: { id: string; name: string; price: number };
    images: Array<{ id: string; image_url: string }>;
    categories: Array<{ id: string; name: string }>;
  }>
> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiGetProducts failed (${res.status}): ${body}`);
  }
  return res.json();
}
