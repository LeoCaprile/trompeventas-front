import { test as baseTest, expect as baseExpect } from "@playwright/test";
import { test, expect } from "../fixtures/auth.fixture";

baseTest.describe("My Products - unauthenticated", () => {
  baseTest("redirects to /sign-in", async ({ page }) => {
    await page.goto("/my-products");
    await page.waitForURL("**/sign-in");
  });
});

test.describe("My Products - authenticated", () => {
  test("shows heading and publish button", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/my-products");
    await expect(page.getByRole("heading", { name: "Mis productos" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Publicar producto/ }).first(),
    ).toBeVisible();
  });

  test("publish link points to /publish-product", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/my-products");
    const publishLink = page.getByRole("link", { name: /Publicar producto/ }).first();
    await expect(publishLink).toHaveAttribute("href", "/publish-product");
  });
});
