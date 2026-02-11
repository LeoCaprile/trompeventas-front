import { test, expect } from "@playwright/test";
import { apiGetProducts } from "../helpers/api";

test.describe("Comments - unauthenticated", () => {
  let productId: string;

  test.beforeAll(async () => {
    const products = await apiGetProducts();
    productId = products[0].product.id;
  });

  test("shows sign-in link and no comment textarea", async ({ page }) => {
    await page.goto(`/products/${productId}`);
    await expect(page.getByText("Inicia sesion")).toBeVisible();
    await expect(
      page.getByPlaceholder("Escribe un comentario..."),
    ).not.toBeVisible();
  });

  test("sign-in link navigates to /sign-in", async ({ page }) => {
    await page.goto(`/products/${productId}`);
    await page.waitForLoadState("networkidle");
    const link = page.locator('a[href="/sign-in"]', { hasText: 'Inicia sesion' });
    await expect(link).toBeVisible();
    // Ensure JS hydration is complete by waiting for data-discover attribute
    await expect(link).toHaveAttribute("data-discover", "true", { timeout: 5000 });
    await link.click();
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
  });

  test("no reply buttons visible", async ({ page }) => {
    await page.goto(`/products/${productId}`);
    await expect(page.getByRole("button", { name: "Responder" })).not.toBeVisible();
  });

  test("comment count header visible", async ({ page }) => {
    await page.goto(`/products/${productId}`);
    await expect(page.getByText(/Comentarios \(\d+\)/)).toBeVisible();
  });
});
