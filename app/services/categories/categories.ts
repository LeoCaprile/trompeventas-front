import { serverApiClient } from "../client";

export interface CategoryT {
  id: string;
  name: string;
  created_at: string;
}

export async function getCategories(): Promise<CategoryT[]> {
  const categories = await serverApiClient.get("categories").json<CategoryT[]>();
  return categories;
}
