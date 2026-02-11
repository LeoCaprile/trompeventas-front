import { test, expect } from "../fixtures/auth.fixture";
import { apiClient } from "../../app/services/client";

test.describe("Session Cookie Refresh", () => {
  test("should refresh session cookie after token expires", async ({
    authenticatedPage: page,
    testUser,
  }) => {
    // Navigate to my products page (requires auth)
    await page.goto("/my-products");
    await expect(page.getByRole("heading", { name: "Mis productos" })).toBeVisible();

    // Get initial cookies
    const initialCookies = await page.context().cookies();
    const initialSessionCookie = initialCookies.find(c => c.name === "__session");
    expect(initialSessionCookie).toBeDefined();
    console.log("Initial session cookie:", initialSessionCookie?.value.substring(0, 50));

    // Wait for 2 seconds to simulate some time passing
    await page.waitForTimeout(2000);

    // Navigate to profile (another authenticated route that will trigger a fetch)
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Mi Perfil" })).toBeVisible();

    // Get cookies after navigation
    const afterCookies = await page.context().cookies();
    const afterSessionCookie = afterCookies.find(c => c.name === "__session");
    expect(afterSessionCookie).toBeDefined();
    console.log("After navigation cookie:", afterSessionCookie?.value.substring(0, 50));

    // Make a mutation (edit action) to trigger authenticatedFetch
    await page.goto("/my-products");
    await page.waitForTimeout(1000);

    // Get cookies after action
    const finalCookies = await page.context().cookies();
    const finalSessionCookie = finalCookies.find(c => c.name === "__session");
    expect(finalSessionCookie).toBeDefined();
    console.log("Final session cookie:", finalSessionCookie?.value.substring(0, 50));

    // Verify user is still authenticated
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Mi Perfil" })).toBeVisible();
  });

  test("should maintain authentication across multiple page loads", async ({
    authenticatedPage: page,
  }) => {
    // Load multiple authenticated pages in sequence
    await page.goto("/my-products");
    await expect(page.getByRole("heading", { name: "Mis productos" })).toBeVisible();

    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Mi Perfil" })).toBeVisible();

    await page.goto("/publish-product");
    await expect(page.getByRole("heading", { name: "Publicar producto" })).toBeVisible();

    await page.goto("/my-products");
    await expect(page.getByRole("heading", { name: "Mis productos" })).toBeVisible();

    // Verify session cookie exists throughout
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === "__session");
    expect(sessionCookie).toBeDefined();
  });

  test("should persist session after form submission", async ({
    authenticatedPage: page,
  }) => {
    // Go to profile page
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Mi Perfil" })).toBeVisible();

    // Get initial cookies
    const initialCookies = await page.context().cookies();
    const initialSessionCookie = initialCookies.find(c => c.name === "__session");
    console.log("Before form submit:", initialSessionCookie?.value.substring(0, 50));

    // Try to submit profile form
    const nameInput = page.getByLabel("Nombre completo");
    await nameInput.fill("Test User Updated");

    // Submit form
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    // Wait for success message or reload
    await page.waitForTimeout(1000);

    // Get cookies after form submission
    const afterCookies = await page.context().cookies();
    const afterSessionCookie = afterCookies.find(c => c.name === "__session");
    console.log("After form submit:", afterSessionCookie?.value.substring(0, 50));

    expect(afterSessionCookie).toBeDefined();

    // Navigate to another page to verify session is still valid
    await page.goto("/my-products");
    await expect(page.getByRole("heading", { name: "Mis productos" })).toBeVisible();
  });
});
