import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("products load from seed data", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("h3");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("product cards show name and price", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator("h3").first();
    await expect(firstCard).toBeVisible();
    const cardText = await firstCard.textContent();
    expect(cardText?.length).toBeGreaterThan(0);

    const price = page.locator("text=$").first();
    await expect(price).toBeVisible();
  });

  test("search via query param shows results banner", async ({ page }) => {
    await page.goto("/?q=test");
    await expect(page.getByText("Resultados para")).toBeVisible();
    await expect(page.getByText("Limpiar")).toBeVisible();
  });

  test("search with no results shows empty state", async ({ page }) => {
    await page.goto("/?q=xyznonexistent99999");
    await expect(page.getByText("No se encontraron productos")).toBeVisible();
  });

  test("clearing search returns to full listing", async ({ page }) => {
    await page.goto("/?q=test");
    await page.getByText("Limpiar").click();
    await page.waitForURL("/");
    await expect(page.getByText("Resultados para")).not.toBeVisible();
    const cards = page.locator("h3");
    await expect(cards.first()).toBeVisible();
  });
});
