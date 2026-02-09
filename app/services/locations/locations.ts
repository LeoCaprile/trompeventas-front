import { apiClient } from "../client";

export interface RegionT {
  region: string;
  comunas: string[];
}

export async function getRegions(): Promise<RegionT[]> {
  const data = await apiClient
    .get("locations/regions")
    .json<{ regiones: RegionT[] }>();
  return data.regiones;
}
