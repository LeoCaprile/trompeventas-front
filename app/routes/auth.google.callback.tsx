import { redirect } from "react-router";
import type { Route } from "./+types/auth.google.callback";
import { exchangeOAuthCode, sessionStorage } from "~/services/auth/auth";

export async function loader({ request }: Route.LoaderArgs) {
  console.log(request);
  const url = new URL(request.url);
  const authCode = url.searchParams.get("auth_code");

  if (!authCode) {
    return redirect("/sign-in?error=oauth_failed");
  }

  try {
    // Exchange the one-time code for user data
    const signInData = await exchangeOAuthCode(authCode);

    // Store in the React Router cookie session
    const session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    session.set("user", signInData);

    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    console.error("OAuth exchange error:", error);
    return redirect("/sign-in?error=oauth_failed");
  }
}

export default function GoogleCallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg">Completing sign in...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>
  );
}
