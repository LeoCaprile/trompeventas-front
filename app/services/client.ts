import ky from "ky";
import { getApiClientUrl } from "~/lib/utils";

export const apiClient = ky.create({
  prefixUrl: getApiClientUrl(),
});
