import SignUp from "~/components/sign-up";
import type { Route } from "./+types/sign-up";
import { sessionStorage, signUp } from "~/services/auth/auth";
import { redirect, data } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Crear cuenta - trompeventas.cl" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  let user = session.get("user");
  if (user) throw redirect("/");
  return null;
}

export default function SignUpPage({ actionData }: Route.ComponentProps) {
  return (
    <SignUp
      errors={actionData && "error" in actionData ? actionData.error : undefined}
      success={actionData && "success" in actionData ? actionData.success : undefined}
    />
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validaciones
  if (!name || !email || !password || !confirmPassword) {
    return data({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return data({ error: "Las contraseñas no coinciden" }, { status: 400 });
  }

  if (password.length < 8) {
    return data(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return data({ error: "Email inválido" }, { status: 400 });
  }

  try {
    await signUp({ name, email, password });
    return data(
      {
        success: true,
        message: "Cuenta creada exitosamente. Por favor inicia sesión."
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return data({ error: error.message }, { status: 400 });
    }
    return data({ error: "Error al crear la cuenta" }, { status: 500 });
  }
}
