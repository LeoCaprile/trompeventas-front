import { serverApiClient } from "../client";

export interface RegionT {
  region: string;
  comunas: string[];
}

export async function getRegions(): Promise<RegionT[]> {
  const data = await serverApiClient
    .get("locations/regions")
    .json<{ regiones: RegionT[] }>();
  return data.regiones;
}
