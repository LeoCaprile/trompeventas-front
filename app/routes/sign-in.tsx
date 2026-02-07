import SignIn from "~/components/sign-in";
import type { Route } from "./+types/sign-in";
import { authenticator, sessionStorage } from "~/services/auth/auth";
import { redirect } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Ingresar a trompeventas.cl" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let user = session.get("user");
  if (user) throw redirect("/");
  return null;
}

export default function SignInPage({ actionData }: Route.ComponentProps) {
  return <SignIn errors={actionData?.error} />;
}

export async function action({ request }: Route.ActionArgs) {
  try {
    let user = await authenticator.authenticate("user-pass", request);

    let session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );

    session.set("user", user);

    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    throw error;
  }
}
