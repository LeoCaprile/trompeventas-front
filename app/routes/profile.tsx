import { redirect, data } from "react-router";
import type { Route } from "./+types/profile";
import { sessionStorage, type SignInResponse, type UserT } from "~/services/auth/auth";
import { getAuthSession } from "~/services/auth/session.server";
import { getRegions } from "~/services/locations/locations";
import { ProfileForm } from "~/components/profile-form";
import {
  Card,
  CardContent,
} from "~/components/ui/card";
import { User, CheckCircle } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mi perfil - trompeventas.cl" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { signInData, authenticatedFetch, getHeaders } =
    await getAuthSession(request);

  if (!signInData?.accessToken) {
    throw redirect("/sign-in");
  }

  const [result, regions] = await Promise.all([
    authenticatedFetch<{ user: UserT }>("get", "auth/me"),
    getRegions(),
  ]);

  return data({ user: result.user, regions }, { headers: await getHeaders() });
}

export async function action({ request }: Route.ActionArgs) {
  const { signInData, session, authenticatedFetch, getHeaders } =
    await getAuthSession(request);

  if (!signInData?.accessToken) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const region = formData.get("region") as string | null;
  const city = formData.get("city") as string | null;

  if (!name || name.trim() === "") {
    return data({ error: "El nombre es requerido", success: false });
  }

  try {
    const body: { name: string; image?: string; region?: string; city?: string } = { name: name.trim() };
    if (imageUrl) {
      body.image = imageUrl;
    }
    if (region !== null) {
      body.region = region;
    }
    if (city !== null) {
      body.city = city;
    }

    const result = await authenticatedFetch<{ user: UserT }>("put", "auth/me", {
      json: body,
    });

    // Update session with new user data
    signInData.user = result.user;
    session.set("user", signInData);

    return data(
      { success: true, error: null },
      {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      },
    );
  } catch (error) {
    if (error instanceof Response) throw error;
    const message =
      error instanceof Error ? error.message : "Error al actualizar el perfil";
    return data({ error: message, success: false });
  }
}

export default function ProfilePage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-1 sm:mb-2">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
              Mi perfil
            </h1>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base sm:pl-[3.25rem]">
            Administra tu informacion personal.
          </p>
        </div>

        {actionData?.error && (
          <div className="mb-4 sm:mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-sm text-destructive">{actionData.error}</p>
          </div>
        )}

        {actionData?.success && (
          <div className="mb-4 sm:mb-6 flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 px-3 py-2.5 sm:px-4 sm:py-3">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            <p className="text-sm text-green-700">
              Perfil actualizado correctamente.
            </p>
          </div>
        )}

        <Card className="shadow-lg border-0 sm:border">
          <CardContent className="px-4 pt-5 sm:px-6 sm:pt-6">
            <ProfileForm user={loaderData.user} regions={loaderData.regions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
