import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Form, Link, useNavigation } from "react-router";
import { getGoogleOAuthUrl } from "~/services/auth/auth.client";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  errors?: string;
  success?: boolean;
}

export default function SignUpPage({ errors, success }: Props) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const authUrl = await getGoogleOAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to initiate Google OAuth:", error);
      setIsGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              ¡Cuenta creada exitosamente!
            </CardTitle>
            <CardDescription>
              Hemos enviado un correo de verificación a tu email.
              Por favor revisa tu bandeja de entrada y verifica tu cuenta antes de iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/sign-in">
              <Button className="w-full" size="lg">
                Ir a iniciar sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tus datos para crear tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form method="POST" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Juan Pérez"
                className="w-full"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                className="w-full"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="w-full"
                required
                minLength={8}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                className="w-full"
                required
                minLength={8}
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
            {errors && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {errors}
              </div>
            )}
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                O regístrate con
              </span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignUp}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={isGoogleLoading || isSubmitting}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuar con Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-slate-500">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/sign-in"
              className="text-slate-900 font-medium hover:underline"
            >
              Inicia sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
