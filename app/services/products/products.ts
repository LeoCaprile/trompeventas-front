import { isHTTPError } from "ky";
import { apiClient } from "../client";

export interface Product {
  product: ProductDetails;
  images: Image[];
  categories: Category[];
}

export interface ProductDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: string;
  product_id: string;
  image_url: string;
  created_at: string;
}

export interface Category {
  id: string;
  product_id: string;
  name: string;
}

export async function getProductsList() {
  try {
    const request = await apiClient.get<Product[]>("products");
    console.log(request.headers);
    const products = await request.json();
    return products;
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

export async function getProductById(id: string) {
  try {
    const request = await apiClient.get<Product>(`products/${id}`);
    const products = await request.json();
    return products;
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
