import { randomUUID } from "crypto";

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export function createTestUser(): TestUser {
  const id = randomUUID().slice(0, 8);
  return {
    name: `Test User ${id}`,
    email: `test-${id}@e2e.test`,
    password: "TestPassword123!",
  };
}
