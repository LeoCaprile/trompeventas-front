import { useState, useEffect } from "react";
import type { Route } from "./+types/verify-email";
import { sessionStorage, type SignInResponse } from "~/services/auth/auth.server";
import { redirect, data, useNavigation } from "react-router";
import { getAuthSession } from "~/services/auth/session.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AlertCircle, Mail, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Verifica tu email - trompeventas.cl" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { signInData, getHeaders } = await getAuthSession(request);

  if (!signInData?.user) {
    throw redirect("/sign-in");
  }

  // If already verified, redirect to home
  if (signInData.user.emailVerified) {
    throw redirect("/");
  }

  return data({ user: signInData.user }, { headers: await getHeaders() });
}

export async function action({ request }: Route.ActionArgs) {
  const { signInData, authenticatedFetch, getHeaders } = await getAuthSession(request);

  if (!signInData?.accessToken) {
    throw redirect("/sign-in");
  }

  try {
    await authenticatedFetch("post", "auth/send-verification");

    return data({ success: true, sentAt: Date.now() }, { headers: await getHeaders() });
  } catch (error) {
    console.error("Error sending verification email:", error);
    const message = error instanceof Error ? error.message : "Failed to send verification email";
    return data({ error: message }, { status: 500, headers: await getHeaders() });
  }
}

export default function VerifyEmailPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Track last sent time in localStorage
  const [canResend, setCanResend] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const lastSentKey = `email-verification-sent-${user.id}`;
    const lastSent = localStorage.getItem(lastSentKey);

    if (lastSent) {
      const timeSince = Date.now() - parseInt(lastSent, 10);
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSince < fiveMinutes) {
        setCanResend(false);
        setTimeLeft(Math.ceil((fiveMinutes - timeSince) / 1000));
      }
    }
  }, [user.id]);

  useEffect(() => {
    if (actionData && "success" in actionData && actionData.success) {
      const lastSentKey = `email-verification-sent-${user.id}`;
      localStorage.setItem(lastSentKey, actionData.sentAt.toString());
      setCanResend(false);
      setTimeLeft(5 * 60); // 5 minutes in seconds
    }
  }, [actionData, user.id]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <Mail className="h-10 w-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verifica tu correo electrónico
          </CardTitle>
          <CardDescription className="text-base">
            Para proteger nuestra comunidad y asegurar la calidad de las publicaciones,
            necesitamos que verifiques tu email antes de publicar productos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User email display */}
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Email registrado:
            </p>
            <p className="font-medium text-foreground truncate" title={user.email}>
              {user.email}
            </p>
          </div>

          {/* Success message */}
          {actionData && "success" in actionData && actionData.success && (
            <div className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800">
                  ¡Email enviado exitosamente!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
                  Si no lo ves, revisa tu carpeta de spam.
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {actionData && "error" in actionData && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Error al enviar</p>
                <p className="text-sm text-red-700 mt-1">{actionData.error}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">¿Qué hacer ahora?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  1
                </span>
                <span className="break-words">
                  Revisa tu bandeja de entrada de <strong className="break-all">{user.email}</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  2
                </span>
                <span>
                  Busca un correo de <strong>Trompeventas</strong> con el asunto
                  "Verifica tu Email"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  3
                </span>
                <span>Haz clic en el botón "VERIFICAR MI EMAIL"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  4
                </span>
                <span>Una vez verificado, podrás publicar tus productos</span>
              </li>
            </ol>
          </div>

          {/* Resend section */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              ¿No recibiste el correo?
            </p>
            <form method="POST">
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={!canResend || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : !canResend ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Espera {formatTime(timeLeft)} para reenviar
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar email de verificación
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Volver al inicio
              </Button>
            </Link>
            <Link to="/profile" className="flex-1">
              <Button variant="outline" className="w-full">
                Ir a mi perfil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
