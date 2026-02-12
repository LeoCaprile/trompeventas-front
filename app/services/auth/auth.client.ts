import { isHTTPError } from "ky";
import { clientApiClient } from "../client.client";

export async function getGoogleOAuthUrl(): Promise<string> {
  try {
    const response = await clientApiClient
      .get("auth/oauth/google")
      .json<{ authUrl: string }>();
    return response.authUrl;
  } catch (error) {
    if (isHTTPError(error)) {
      const errorResponse: { error: string } = await error.response.json();
      console.error(
        `[ERROR]:[${error.response.status}]:[${errorResponse.error}]`,
      );
      throw Error(errorResponse.error);
    }
    console.error(`[ERROR]:[${error}]`);
    throw error;
  }
}
