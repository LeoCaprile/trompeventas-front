import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/email-verified";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CheckCircle2, Home } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { getAuthSession } from "~/services/auth/session.server";
import { sessionStorage } from "~/services/auth/auth.server";
import { data } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Email verificado - trompeventas.cl" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { signInData, authenticatedFetch, session } = await getAuthSession(request);

  // If user is logged in, fetch updated user data and update session
  if (signInData?.accessToken) {
    try {
      const result = await authenticatedFetch<{ user: any }>("get", "auth/me");

      // Update session with fresh user data (including emailVerified status)
      signInData.user = result.user;
      session.set("user", signInData);

      return data(
        { updated: true },
        {
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
        }
      );
    } catch (error) {
      console.error("Failed to update user session:", error);
    }
  }

  return data({ updated: false });
}

export default function EmailVerifiedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate("/?verified=true", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            ¡Correo verificado correctamente!
          </CardTitle>
          <CardDescription className="text-base">
            Tu cuenta ha sido verificada exitosamente. Ahora puedes usar todas las
            funciones de Trompeventas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features unlocked */}
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <h3 className="font-semibold text-green-900 mb-3">
              Ahora puedes:
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                <span>Publicar tus productos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                <span>Comentar en publicaciones</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                <span>Contactar vendedores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                <span>Acceder a todas las funciones</span>
              </li>
            </ul>
          </div>

          {/* Auto redirect message */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Serás redirigido al inicio en <strong>5 segundos</strong>...
            </p>
            <Link to="/" className="block">
              <Button className="w-full" size="lg">
                <Home className="mr-2 h-5 w-5" />
                Ir al inicio ahora
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
