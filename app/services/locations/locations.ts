import { isHTTPError } from "ky";
import { serverApiClient } from "../client.server";

export interface RegionT {
  region: string;
  comunas: string[];
}

export async function getRegions(): Promise<RegionT[]> {
  try {
    const data = await serverApiClient
      .get("locations/regions")
      .json<{ regiones: RegionT[] }>();
    return data.regiones;
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
