import { test, expect } from "../fixtures/auth.fixture";
import { apiGetProducts, apiCreateComment, apiSignIn } from "../helpers/api";
import { getTestUser2 } from "../helpers/test-user";

test.describe("Comments - delete", () => {
  let productId: string;

  test.beforeAll(async () => {
    const products = await apiGetProducts();
    productId = products[0].product.id;
  });

  test("delete own comment via dropdown menu", async ({
    authenticatedPage: page,
    accessToken,
  }) => {
    const content = `Delete me ${Date.now()}`;
    await apiCreateComment(productId, content, accessToken);
    await page.goto(`/products/${productId}`);

    // Wait for the comment to be fully rendered and hydrated
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(content)).toBeVisible({ timeout: 10000 });

    // The comment text is in a <p>, its parent <div class="flex-1"> contains the dropdown trigger
    const contentDiv = page.getByText(content).locator("..");
    const moreBtn = contentDiv.locator('button[data-size="icon-xs"]');
    await expect(moreBtn).toBeVisible();
    await moreBtn.click();

    // Click "Eliminar" in the dropdown menu
    await page.getByRole("menuitem", { name: "Eliminar" }).click();

    // Comment should disappear
    await expect(page.getByText(content)).not.toBeVisible({ timeout: 10000 });
  });

  test("other users comments do not show dropdown trigger", async ({
    authenticatedPage: page,
  }) => {
    // Create a comment as a different user via API (using second persistent test user)
    const otherUser = getTestUser2();
    const { accessToken: otherToken } = await apiSignIn({
      email: otherUser.email,
      password: otherUser.password,
    });

    const content = `Other user comment ${Date.now()}`;
    await apiCreateComment(productId, content, otherToken);
    await page.goto(`/products/${productId}`);

    await expect(page.getByText(content)).toBeVisible({ timeout: 10000 });

    // The content div should not have the dropdown trigger button
    const contentDiv = page.getByText(content).locator("..");
    const moreBtn = contentDiv.locator('button[data-size="icon-xs"]');
    await expect(moreBtn).not.toBeVisible();
  });
});
