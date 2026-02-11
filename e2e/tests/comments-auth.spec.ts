import { test, expect } from "../fixtures/auth.fixture";
import { apiGetProducts, apiCreateComment } from "../helpers/api";

test.describe("Comments - authenticated", () => {
  let productId: string;

  test.beforeAll(async () => {
    const products = await apiGetProducts();
    productId = products[0].product.id;
  });

  test("comment form is visible with placeholder and submit button", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/products/${productId}`);
    await expect(
      page.getByPlaceholder("Escribe un comentario..."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Comentar" })).toBeVisible();
  });

  test("add top-level comment", async ({
    authenticatedPage: page,
    testUser,
  }) => {
    await page.goto(`/products/${productId}`);
    const textarea = page.getByPlaceholder("Escribe un comentario...");
    await expect(textarea).toBeVisible();
    const commentText = `E2E comment ${Date.now()}`;
    await textarea.click();
    await textarea.fill(commentText);
    await page.getByRole("button", { name: "Comentar" }).click();
    await expect(page.getByText(commentText)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("main").getByText(testUser.name)).toBeVisible();
  });

  test("reply to a comment", async ({
    authenticatedPage: page,
    accessToken,
  }) => {
    const commentContent = `Parent reply test ${Date.now()}`;
    await apiCreateComment(productId, commentContent, accessToken);
    await page.goto(`/products/${productId}`);
    await page.waitForLoadState("networkidle");

    // Wait for the comment to render
    await expect(page.getByText(commentContent)).toBeVisible({ timeout: 10000 });

    // Click the Responder button in the actions area below the comment text
    // The <p> containing the text, its sibling <div> contains the action buttons
    const contentDiv = page.getByText(commentContent).locator("..");
    await contentDiv.getByText("Responder").click();

    // Wait for reply form to appear
    const replyTextarea = page.getByPlaceholder("Escribe tu respuesta...");
    await expect(replyTextarea).toBeVisible({ timeout: 10000 });

    // Fill reply
    const replyText = `Reply ${Date.now()}`;
    await replyTextarea.fill(replyText);

    // Click the submit Responder button (next to Cancelar in the reply form)
    const cancelBtn = page.getByRole("button", { name: "Cancelar" });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.locator("..").getByRole("button", { name: "Responder" }).click();

    await expect(page.getByText(replyText)).toBeVisible({ timeout: 10000 });
  });

  test("cancel reply hides reply form", async ({
    authenticatedPage: page,
    accessToken,
  }) => {
    const commentContent = `Cancel test ${Date.now()}`;
    await apiCreateComment(productId, commentContent, accessToken);
    await page.goto(`/products/${productId}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(commentContent)).toBeVisible({ timeout: 10000 });

    // Click Responder in actions area
    const contentDiv = page.getByText(commentContent).locator("..");
    await contentDiv.getByText("Responder").click();

    await expect(
      page.getByPlaceholder("Escribe tu respuesta..."),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "Cancelar" }).click();

    await expect(
      page.getByPlaceholder("Escribe tu respuesta..."),
    ).not.toBeVisible();
  });

  test("collapse and expand thread", async ({
    authenticatedPage: page,
    accessToken,
  }) => {
    // Create parent and child comments via API
    const parentContent = `Thread parent ${Date.now()}`;
    const parentRes = await apiCreateComment(
      productId,
      parentContent,
      accessToken,
    );
    const parentId = parentRes.comment?.id ?? parentRes.id;

    const childContent = `Thread child ${Date.now()}`;
    await apiCreateComment(productId, childContent, accessToken, parentId);

    await page.goto(`/products/${productId}`);
    await page.waitForLoadState("networkidle");

    // Verify both visible
    await expect(page.getByText(parentContent)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(childContent)).toBeVisible({ timeout: 10000 });

    // The collapse toggle is inside a border-l div that's a sibling area to the parent comment
    // Use the parent content's ancestor CommentThread div to find the toggle
    // The CommentThread renders: CommentItem + reply form + children container
    // The children container has the border-l div with the toggle button
    const parentCommentDiv = page.getByText(parentContent).locator("xpath=ancestor::div[contains(@class, 'flex gap-3')]/..");

    const toggleBtn = parentCommentDiv.getByText(/Ocultar respuesta/);
    await toggleBtn.click();

    // Child should be hidden
    await expect(page.getByText(childContent)).not.toBeVisible({ timeout: 5000 });

    // Expand again - use same parent anchor since child is hidden
    const expandBtn = parentCommentDiv.getByText(/Mostrar \d+ respuesta/);
    await expandBtn.click();

    // Child should be visible again
    await expect(page.getByText(childContent)).toBeVisible({ timeout: 5000 });
  });
});
