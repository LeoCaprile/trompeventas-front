export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/**
 * Persistent test user for e2e tests.
 * This user is created once during test setup and reused across all tests.
 */
export const PERSISTENT_TEST_USER: TestUser = {
  name: "E2E Test User",
  email: "e2e-test@trompeventas.test",
  password: "E2ETestPassword123!",
};

/**
 * Second persistent test user for scenarios requiring multiple users
 * (e.g., testing permissions, other users' comments, etc.)
 */
export const PERSISTENT_TEST_USER_2: TestUser = {
  name: "E2E Test User 2",
  email: "e2e-test-2@trompeventas.test",
  password: "E2ETestPassword123!",
};

/**
 * Returns the persistent test user.
 * Use this instead of creating new users for each test.
 */
export function getTestUser(): TestUser {
  return PERSISTENT_TEST_USER;
}

/**
 * Returns the second persistent test user.
 * Use this for tests requiring multiple users (e.g., testing permissions).
 */
export function getTestUser2(): TestUser {
  return PERSISTENT_TEST_USER_2;
}
