import { isHTTPError } from "ky";
import { serverApiClient } from "../client.server";

export interface Seller {
  name: string;
  image: string;
  region: string;
  city: string;
}

export interface Product {
  product: ProductDetails;
  images: Image[];
  categories: Category[];
  seller?: Seller;
}

export interface ProductDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  user_id: string | null;
  condition: string;
  state: string;
  negotiable: string;
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

export async function getProductsList(params?: { q?: string }) {
  try {
    const searchParams: Record<string, string> = {};
    if (params?.q) {
      searchParams.q = params.q;
    }
    const request = await serverApiClient.get<Product[]>("products", {
      searchParams,
    });
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

export interface PublishProductData {
  name: string;
  description: string;
  price: number;
  categories: string[];
  imageUrls: string[];
}

export async function publishProduct(
  data: PublishProductData,
  accessToken: string,
) {
  const response = await serverApiClient
    .post("products/publish", {
      json: data,
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .json<{ product: ProductDetails; images: Image[]; message: string }>();
  return response;
}

export async function getProductById(id: string) {
  try {
    const request = await serverApiClient.get<Product>(`products/${id}`);
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
