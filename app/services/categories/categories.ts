import { apiClient } from "../client";

export interface CategoryT {
  id: string;
  name: string;
  created_at: string;
}

export async function getCategories(): Promise<CategoryT[]> {
  const categories = await apiClient.get("categories").json<CategoryT[]>();
  return categories;
}
