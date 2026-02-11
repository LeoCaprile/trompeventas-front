import { test, expect } from "@playwright/test";
import { apiGetProducts } from "../helpers/api";

test.describe("Product detail page", () => {
  let productId: string;

  test.beforeAll(async () => {
    const products = await apiGetProducts();
    productId = products[0].product.id;
  });

  test("shows product name, price, and description", async ({ page }) => {
    await page.goto(`/products/${productId}`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("$")).toBeVisible();
    await expect(page.getByText("Descripcion")).toBeVisible();
  });

  test("shows product image", async ({ page }) => {
    await page.goto(`/products/${productId}`);
    const img = page.locator("img").first();
    await expect(img).toBeVisible();
  });

  test("back link navigates to home", async ({ page }) => {
    await page.goto(`/products/${productId}`);
    // Wait for JS hydration to complete so React Router links work
    await page.waitForLoadState("networkidle");
    const backLink = page.locator('a', { hasText: 'Volver al listado' });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
  });

  test("condition and negotiable pills visible", async ({ page }) => {
    await page.goto(`/products/${productId}`);
    // Condition and negotiable are rendered in pill-shaped divs
    const pills = page.locator(".rounded-full");
    await expect(pills.first()).toBeVisible();
    const count = await pills.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("comment section header visible", async ({ page }) => {
    await page.goto(`/products/${productId}`);
    await expect(page.getByText(/Comentarios \(\d+\)/)).toBeVisible();
  });
});
