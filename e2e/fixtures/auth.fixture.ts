import { test as base, type Page } from "@playwright/test";
import { createTestUser, type TestUser } from "../helpers/test-user";
import { apiSignUp, apiSignIn } from "../helpers/api";

interface AuthFixtures {
  testUser: TestUser;
  authenticatedPage: Page;
  accessToken: string;
}

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const user = createTestUser();
    await apiSignUp(user);
    await use(user);
  },

  accessToken: async ({ testUser }, use) => {
    const { accessToken } = await apiSignIn({
      email: testUser.email,
      password: testUser.password,
    });
    await use(accessToken);
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    await page.goto("/sign-in");
    await page.getByLabel("Correo electrónico").fill(testUser.email);
    await page.getByLabel("Contraseña").fill(testUser.password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("/");
    await use(page);
  },
});

export { expect } from "@playwright/test";
