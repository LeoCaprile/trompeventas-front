import { test as base, type Page } from "@playwright/test";
import { getTestUser, type TestUser } from "../helpers/test-user";
import { apiSignIn, apiCleanupUserData, apiEnsureTestUser } from "../helpers/api";

interface AuthFixtures {
  testUser: TestUser;
  authenticatedPage: Page;
  accessToken: string;
}

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const user = getTestUser();
    // Ensure user exists before running test
    await apiEnsureTestUser(user);
    await use(user);
  },

  accessToken: async ({ testUser }, use) => {
    const { accessToken } = await apiSignIn({
      email: testUser.email,
      password: testUser.password,
    });

    await use(accessToken);

    // Cleanup user data after test
    try {
      await apiCleanupUserData(accessToken);
    } catch (error) {
      console.warn("Failed to cleanup user data:", error);
    }
  },

  authenticatedPage: async ({ page, testUser, accessToken }, use) => {
    await page.goto("/sign-in");
    await page.getByLabel("Correo electrónico").fill(testUser.email);
    await page.getByLabel("Contraseña").fill(testUser.password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("/");

    await use(page);

    // Cleanup user data after test
    try {
      await apiCleanupUserData(accessToken);
    } catch (error) {
      console.warn("Failed to cleanup user data:", error);
    }
  },
});

export { expect } from "@playwright/test";
