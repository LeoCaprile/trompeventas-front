import { test, expect } from "../fixtures/auth.fixture";
import { apiGetProducts, apiCreateComment } from "../helpers/api";

test.describe("Comments - voting", () => {
  let productId: string;

  test.beforeAll(async () => {
    const products = await apiGetProducts();
    productId = products[0].product.id;
  });

  function getVoteButtons(page: import("@playwright/test").Page, content: string) {
    const contentDiv = page.getByText(content).locator("..");
    return {
      like: contentDiv.locator('button[data-size="xs"]').first(),
      dislike: contentDiv.locator('button[data-size="xs"]').nth(1),
    };
  }

  test("like a comment", async ({ authenticatedPage: page, accessToken }) => {
    const content = `Vote like ${Date.now()}`;
    await apiCreateComment(productId, content, accessToken);
    await page.goto(`/products/${productId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(content)).toBeVisible();

    const { like } = getVoteButtons(page, content);
    await like.click();
    await expect(like).toHaveClass(/text-primary/, { timeout: 10000 });
  });

  test("toggle off like", async ({ authenticatedPage: page, accessToken }) => {
    const content = `Toggle like ${Date.now()}`;
    await apiCreateComment(productId, content, accessToken);
    await page.goto(`/products/${productId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(content)).toBeVisible();

    // Like
    getVoteButtons(page, content).like.click();
    await expect(getVoteButtons(page, content).like).toHaveClass(/text-primary/, { timeout: 10000 });

    // Wait for server response and revalidation
    await page.waitForLoadState("networkidle");

    // Unlike (re-acquire locator since DOM may have changed)
    getVoteButtons(page, content).like.click();
    await expect(getVoteButtons(page, content).like).toHaveClass(/text-muted-foreground/, { timeout: 10000 });
  });

  test("dislike a comment", async ({
    authenticatedPage: page,
    accessToken,
  }) => {
    const content = `Vote dislike ${Date.now()}`;
    await apiCreateComment(productId, content, accessToken);
    await page.goto(`/products/${productId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(content)).toBeVisible();

    const { dislike } = getVoteButtons(page, content);
    await dislike.click();
    await expect(dislike).toHaveClass(/text-destructive/, { timeout: 10000 });
  });

  test("switch from like to dislike", async ({
    authenticatedPage: page,
    accessToken,
  }) => {
    const content = `Switch vote ${Date.now()}`;
    await apiCreateComment(productId, content, accessToken);
    await page.goto(`/products/${productId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(content)).toBeVisible();

    // Like first
    getVoteButtons(page, content).like.click();
    await expect(getVoteButtons(page, content).like).toHaveClass(/text-primary/, { timeout: 10000 });

    // Wait for revalidation
    await page.waitForLoadState("networkidle");

    // Switch to dislike
    getVoteButtons(page, content).dislike.click();
    await expect(getVoteButtons(page, content).dislike).toHaveClass(/text-destructive/, { timeout: 10000 });
    await expect(getVoteButtons(page, content).like).toHaveClass(/text-muted-foreground/, { timeout: 10000 });
  });
});
