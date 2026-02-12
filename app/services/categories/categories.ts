import { isHTTPError } from "ky";
import { serverApiClient } from "../client.server";

export interface CategoryT {
  id: string;
  name: string;
  created_at: string;
}

export async function getCategories(): Promise<CategoryT[]> {
  try {
    const categories = await serverApiClient.get("categories").json<CategoryT[]>();
    return categories;
  } catch (error) {
    console.error(`[ERROR]:[${error}]`);
    if (isHTTPError(error)) {
      const errorResponse: { message: string } = await error.response.json();
      throw Error(
        `[ERROR]:[${error.response.status}]:[${errorResponse.message}]`,
      );
    }
    throw error;
  }
}
