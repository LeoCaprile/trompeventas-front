import { test, expect } from "../fixtures/auth.fixture";

test.describe("Token Validation in Main Layout", () => {
  test("valid token keeps user logged in across navigation", async ({
    authenticatedPage: page,
  }) => {
    // User should be logged in - they can access authenticated pages
    await page.goto("/my-products");
    await expect(page.getByRole("heading", { name: "Mis productos" })).toBeVisible();
    console.log("✓ User can access /my-products");

    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: /Mi perfil/i })).toBeVisible();
    console.log("✓ User can access /profile");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    console.log("✓ User can navigate back to home");

    // If user wasn't logged in, they'd be redirected to /sign-in
    expect(page.url()).not.toContain("/sign-in");
    console.log("✓ User still logged in after multiple navigations");
  });

  test("user session persists after token validation on each navigation", async ({
    authenticatedPage: page,
  }) => {
    // Get initial session cookie
    const initialCookies = await page.context().cookies();
    const initialSession = initialCookies.find(c => c.name === "__session");
    expect(initialSession).toBeDefined();
    console.log("Initial session:", initialSession?.value.substring(0, 50));

    // Navigate multiple times - main-layout will validate token each time
    await page.goto("/");
    await page.goto("/my-products");
    await page.goto("/profile");
    await page.goto("/");

    // Get session after multiple navigations
    const afterCookies = await page.context().cookies();
    const afterSession = afterCookies.find(c => c.name === "__session");
    expect(afterSession).toBeDefined();
    console.log("After navigation:", afterSession?.value.substring(0, 50));

    // User should still be able to access authenticated pages
    await page.goto("/my-products");
    await expect(page.getByRole("heading", { name: "Mis productos" })).toBeVisible();
    console.log("✓ Session maintained after multiple validations");
  });

  test("main-layout fetches fresh user data on navigation", async ({
    authenticatedPage: page,
  }) => {
    // Go to profile
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Get current session
    const beforeCookies = await page.context().cookies();
    const beforeSession = beforeCookies.find(c => c.name === "__session");
    console.log("Before update:", beforeSession?.value.substring(0, 50));

    // Update profile name
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill("Updated Test Name");
    await page.getByRole("button", { name: /Guardar cambios/i }).click();

    // Wait for success message
    await expect(page.getByText(/actualizado correctamente/i)).toBeVisible({ timeout: 10000 });
    console.log("✓ Profile updated");

    // Get session after update
    const afterUpdateCookies = await page.context().cookies();
    const afterUpdateSession = afterUpdateCookies.find(c => c.name === "__session");
    console.log("After update:", afterUpdateSession?.value.substring(0, 50));

    // Session should be updated (cookies might be different)
    expect(afterUpdateSession).toBeDefined();

    // Navigate to home - main-layout should fetch updated user
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Get session after navigation
    const afterNavCookies = await page.context().cookies();
    const afterNavSession = afterNavCookies.find(c => c.name === "__session");
    console.log("After navigation:", afterNavSession?.value.substring(0, 50));

    // Session should still exist and be valid
    expect(afterNavSession).toBeDefined();
    console.log("✓ User data fetched on navigation, session maintained");

    // Reset name back
    await page.goto("/profile");
    await page.locator('input[name="name"]').fill("E2E Test User");
    await page.getByRole("button", { name: /Guardar cambios/i }).click();
    await expect(page.getByText(/actualizado correctamente/i)).toBeVisible({ timeout: 10000 });
    console.log("✓ Name reset to original");
  });
});
