import { Outlet } from "react-router";
import { Header } from "~/components/header";
import type { Route } from "./+types/main-layout";
import { getAuthSession } from "~/services/auth/session.server";
import { data } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const { signInData, authenticatedFetch, getHeaders } = await getAuthSession(request);

  // If user is not logged in, return null user
  if (!signInData?.user) {
    return data({ user: null });
  }

  // Validate token by fetching current user from backend
  // This will automatically refresh if token is expired, or logout if refresh fails
  try {
    const result = await authenticatedFetch<{ user: any }>("get", "auth/me");

    // Return user with potentially refreshed session headers
    return data(
      { user: result.user },
      { headers: await getHeaders() }
    );
  } catch (error) {
    // If authenticatedFetch throws a redirect (Response object), re-throw it
    if (error instanceof Response) {
      throw error;
    }

    // Otherwise, token is invalid - log error and return no user
    console.error("Token validation failed in main-layout:", error);
    return data({ user: null });
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header user={loaderData.user} />
      <Outlet />
    </>
  );
}
