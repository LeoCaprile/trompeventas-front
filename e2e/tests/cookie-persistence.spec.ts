import { test, expect } from "../fixtures/auth.fixture";

test.describe("Cookie Persistence", () => {
  test("should maintain session cookie through navigation", async ({
    authenticatedPage: page,
  }) => {
    // Get initial session cookie
    const initialCookies = await page.context().cookies();
    const initialSession = initialCookies.find(c => c.name === "__session");
    expect(initialSession).toBeDefined();
    console.log("✓ Initial session cookie exists");

    // Navigate between pages
    await page.goto("/my-products");
    await page.waitForLoadState("networkidle");

    const afterMyProducts = await page.context().cookies();
    const sessionAfterMyProducts = afterMyProducts.find(c => c.name === "__session");
    expect(sessionAfterMyProducts).toBeDefined();
    console.log("✓ Session persists after /my-products");

    // Navigate to home
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const afterHome = await page.context().cookies();
    const sessionAfterHome = afterHome.find(c => c.name === "__session");
    expect(sessionAfterHome).toBeDefined();
    console.log("✓ Session persists after /");

    // Check user is still logged in
    await page.goto("/");
    const userMenu = page.getByRole("button", { name: /test.*user/i });
    await expect(userMenu).toBeVisible();
    console.log("✓ User still authenticated");
  });

  test("should update cookie after profile action", async ({
    authenticatedPage: page,
    testUser,
  }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Get cookies before action
    const beforeCookies = await page.context().cookies();
    const beforeSession = beforeCookies.find(c => c.name === "__session");
    expect(beforeSession).toBeDefined();
    console.log("Before action - cookie value:", beforeSession?.value.substring(0, 50));

    // Wait for form to be ready
    await page.waitForSelector('input[name="name"]');

    // Update name
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill("Updated Test User");

    // Submit and wait for response
    await page.getByRole("button", { name: /Guardar cambios/i }).click();

    // Wait for success message
    await expect(page.getByText(/actualizado correctamente/i)).toBeVisible({ timeout: 10000 });

    // Get cookies after action
    const afterCookies = await page.context().cookies();
    const afterSession = afterCookies.find(c => c.name === "__session");
    expect(afterSession).toBeDefined();
    console.log("After action - cookie value:", afterSession?.value.substring(0, 50));

    // Navigate away and back to verify cookie persists
    await page.goto("/my-products");
    await page.waitForLoadState("networkidle");

    const afterNavigate = await page.context().cookies();
    const sessionAfterNavigate = afterNavigate.find(c => c.name === "__session");
    expect(sessionAfterNavigate).toBeDefined();
    console.log("After navigate - cookie exists:", !!sessionAfterNavigate);

    // Verify still authenticated
    await page.goto("/");
    const userMenu = page.getByRole("button", { name: /Updated Test User|test.*user/i });
    await expect(userMenu).toBeVisible();
    console.log("✓ Still authenticated after profile update");
  });

  test("should preserve authentication after comment submission", async ({
    authenticatedPage: page,
  }) => {
    // Go to a product detail page (need to create/find a product first)
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Try to find a product
    const firstProduct = page.locator('[href^="/products/"]').first();
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      await page.waitForLoadState("networkidle");

      // Check if comment form exists
      const commentTextarea = page.getByPlaceholder(/Escribe un comentario/i);
      if (await commentTextarea.count() > 0) {
        // Get cookies before comment
        const beforeCookies = await page.context().cookies();
        const beforeSession = beforeCookies.find(c => c.name === "__session");
        console.log("Before comment - has session:", !!beforeSession);

        // Submit comment
        await commentTextarea.fill("Test comment for cookie persistence");
        await page.keyboard.press("Enter");

        // Wait a bit for submission
        await page.waitForTimeout(1000);

        // Get cookies after comment
        const afterCookies = await page.context().cookies();
        const afterSession = afterCookies.find(c => c.name === "__session");
        expect(afterSession).toBeDefined();
        console.log("After comment - has session:", !!afterSession);

        // Navigate away and verify still authenticated
        await page.goto("/my-products");
        await expect(page.getByRole("heading", { name: "Mis productos" })).toBeVisible();
        console.log("✓ Still authenticated after comment");
      } else {
        console.log("⊘ No comment form found, skipping comment test");
      }
    } else {
      console.log("⊘ No products found, skipping comment test");
    }
  });
});
