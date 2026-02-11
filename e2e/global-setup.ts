import { apiEnsureTestUser } from "./helpers/api";
import { getTestUser, getTestUser2 } from "./helpers/test-user";

/**
 * Global setup that runs once before all tests.
 * Ensures the persistent test users exist in the database.
 */
async function globalSetup() {
  console.log("Setting up e2e tests...");

  const testUser = getTestUser();
  const testUser2 = getTestUser2();

  console.log(`Ensuring test users exist: ${testUser.email}, ${testUser2.email}`);

  await apiEnsureTestUser(testUser);
  await apiEnsureTestUser(testUser2);

  console.log("✓ Test users ready");
}

export default globalSetup;
