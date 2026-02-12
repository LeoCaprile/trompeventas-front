import { redirect } from "react-router";
import { isHTTPError } from "ky";
import {
  sessionStorage,
  refreshTokens,
  type SignInResponse,
} from "./auth";
import { serverApiClient } from "../client.server";

/**
 * Reads the session from the request, returning the sign-in data and a
 * helper to make authenticated API calls with automatic token refresh.
 *
 * If the access token has expired, `authenticatedFetch` will transparently
 * refresh it using the refresh token, update the session, and retry once.
 *
 * After the loader/action is done, call `getHeaders()` to get a
 * `Set-Cookie` header if the tokens were refreshed (so the browser gets
 * the updated session cookie).
 */
export async function getAuthSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const signInData: SignInResponse | undefined = session.get("user");

  let tokensRefreshed = false;

  /**
   * Makes an authenticated API call. If the backend returns 401,
   * refreshes tokens and retries once. Throws redirect to /sign-in
   * if refresh also fails.
   */
  async function authenticatedFetch<T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    options?: { json?: unknown },
  ): Promise<T> {
    if (!signInData?.accessToken) {
      throw redirect("/sign-in");
    }

    const makeRequest = (token: string) => {
      const opts = {
        ...options,
        headers: { Authorization: `Bearer ${token}` },
      };
      return serverApiClient[method](url, opts).json<T>();
    };

    try {
      return await makeRequest(signInData.accessToken);
    } catch (error) {
      if (!isHTTPError(error) || error.response.status !== 401) {
        throw error;
      }

      // Token expired — try to refresh
      if (!signInData.refreshToken) {
        throw redirect("/sign-in?session_expired=true");
      }

      try {
        const newTokens = await refreshTokens(signInData.refreshToken);
        signInData.accessToken = newTokens.accessToken;
        signInData.refreshToken = newTokens.refreshToken;
        session.set("user", signInData);
        tokensRefreshed = true;

        return await makeRequest(newTokens.accessToken);
      } catch {
        // Refresh failed — session is dead
        throw redirect("/sign-in?session_expired=true", {
          headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
          },
        });
      }
    }
  }

  /**
   * Returns headers that must be merged into the response if tokens
   * were refreshed during this request.
   */
  async function getHeaders(): Promise<HeadersInit> {
    if (tokensRefreshed) {
      return {
        "Set-Cookie": await sessionStorage.commitSession(session),
      };
    }
    return {};
  }

  return {
    signInData,
    session,
    authenticatedFetch,
    getHeaders,
  };
}
