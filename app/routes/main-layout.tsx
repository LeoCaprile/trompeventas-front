import { Outlet } from "react-router";
import { Header } from "~/components/header";
import type { Route } from "./+types/main-layout";
import { sessionStorage, type SignInResponse } from "~/services/auth/auth";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const signInData: SignInResponse | undefined = session.get("user");
  if (!signInData?.user) return { user: null };
  return { user: signInData.user };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Header user={loaderData.user} />
      <Outlet />
    </>
  );
}
