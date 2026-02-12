import { sessionStorage, signOut, type SignInResponse } from "~/services/auth/auth.server";
import type { Route } from "./+types/sign-out";
import { redirect } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const signInData: SignInResponse | undefined = session.get("user");

  // Revoke refresh token on the backend
  if (signInData?.refreshToken) {
    try {
      await signOut(signInData.refreshToken);
    } catch (error) {
      // Continue even if backend call fails
    }
  }

  // Destroy frontend session cookie
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
