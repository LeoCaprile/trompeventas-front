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

/**
 * Get user's products
 */
export async function apiGetMyProducts(accessToken: string) {
  const res = await fetch(`${API_BASE}/products/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`apiGetMyProducts failed (${res.status}): ${body}`);
  }
  return res.json();
}

/**
 * Delete a product by ID
 */
export async function apiDeleteProduct(productId: string, accessToken: string) {
  const res = await fetch(`${API_BASE}/products/me/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`apiDeleteProduct failed (${res.status}): ${body}`);
  }
}

/**
 * Delete a comment by ID
 */
export async function apiDeleteComment(commentId: string, accessToken: string) {
  const res = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`apiDeleteComment failed (${res.status}): ${body}`);
  }
}

/**
 * Cleanup test user data (delete all products and comments)
 */
export async function apiCleanupUserData(accessToken: string) {
  try {
    // Get and delete all user's products
    const myProducts = await apiGetMyProducts(accessToken);
    for (const item of myProducts) {
      await apiDeleteProduct(item.product.id, accessToken);
    }
  } catch (error) {
    console.warn("Failed to cleanup products:", error);
  }
}

/**
 * Ensure test user exists, create if needed
 */
export async function apiEnsureTestUser(user: TestUser) {
  try {
    // Try to sign in first
    await apiSignIn({ email: user.email, password: user.password });
  } catch (error) {
    // If sign in fails, try to create the user
    try {
      await apiSignUp(user);
    } catch (signUpError) {
      // User might already exist but password is wrong, or other error
      console.warn("Failed to create test user:", signUpError);
    }
  }
}
