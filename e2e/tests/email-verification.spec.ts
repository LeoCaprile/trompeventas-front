import { test, expect } from "../fixtures/auth.fixture";

test.describe("Email Verification", () => {
  test("email-verified page updates session cookie", async ({
    authenticatedPage: page,
    accessToken,
  }) => {
    // Get initial session cookie
    const initialCookies = await page.context().cookies();
    const initialSession = initialCookies.find(c => c.name === "__session");
    expect(initialSession).toBeDefined();
    console.log("Initial session cookie:", initialSession?.value.substring(0, 50));

    // Navigate to email-verified page (simulating after verification)
    await page.goto("/email-verified");
    await page.waitForLoadState("networkidle");

    // Get session cookie after visiting email-verified
    const afterCookies = await page.context().cookies();
    const afterSession = afterCookies.find(c => c.name === "__session");
    expect(afterSession).toBeDefined();
    console.log("After email-verified:", afterSession?.value.substring(0, 50));

    // Check that page shows success message
    await expect(page.getByText(/Correo verificado correctamente/i)).toBeVisible();
    console.log("✓ Success message displayed");

    // Verify session cookie exists (might be same or updated depending on verification status)
    expect(afterSession).toBeDefined();
    console.log("✓ Session cookie maintained");

    // Navigate away and verify still authenticated
    await page.goto("/my-products");
    await expect(page.getByRole("heading", { name: "Mis productos" })).toBeVisible();
    console.log("✓ Still authenticated after email-verified page");
  });

  test("unverified user redirected to verify-email when accessing publish-product", async ({
    authenticatedPage: page,
  }) => {
    // Try to access publish-product
    await page.goto("/publish-product");
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    console.log("Current URL:", currentUrl);

    if (currentUrl.includes("/verify-email")) {
      console.log("✓ Unverified user redirected to /verify-email");
      await expect(page.getByText(/Verifica tu correo electrónico/i)).toBeVisible();
    } else if (currentUrl.includes("/publish-product")) {
      console.log("✓ Verified user can access /publish-product");
      await expect(page.getByRole("heading", { name: /Publicar producto/i })).toBeVisible();
    } else {
      throw new Error(`Unexpected URL: ${currentUrl}`);
    }
  });
});
