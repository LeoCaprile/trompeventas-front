import { redirect, data } from "react-router";
import type { Route } from "./+types/my-products";
import { sessionStorage, type UserT } from "~/services/auth/auth";
import { getAuthSession } from "~/services/auth/session.server";
import type { Product } from "~/services/products/products";
import { MyProductsTable } from "~/components/my-products-table";
import { Card, CardContent } from "~/components/ui/card";
import { Package, PackagePlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mis productos - trompeventas.cl" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { signInData, authenticatedFetch, getHeaders } =
    await getAuthSession(request);

  if (!signInData?.accessToken) {
    throw redirect("/sign-in");
  }

  const products = await authenticatedFetch<Product[]>("get", "products/me");

  return data({ products }, { headers: await getHeaders() });
}

export async function action({ request }: Route.ActionArgs) {
  const { signInData, authenticatedFetch, getHeaders } =
    await getAuthSession(request);

  if (!signInData?.accessToken) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    const productId = formData.get("productId") as string;
    if (!productId) {
      return data({ error: "ID de producto requerido" });
    }

    try {
      await authenticatedFetch("delete", `products/me/${productId}`);
      return data({ success: true }, { headers: await getHeaders() });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar el producto";
      return data({ error: message });
    }
  }

  if (intent === "update") {
    const productId = formData.get("productId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const condition = formData.get("condition") as string;
    const state = formData.get("state") as string;
    const negotiable = formData.get("negotiable") as string;

    if (!productId || !name || !price) {
      return data({ error: "Campos requeridos faltantes" });
    }

    try {
      await authenticatedFetch("post", `products/me/${productId}`, {
        json: {
          name: name.trim(),
          description: description?.trim() || null,
          price: parseInt(price, 10),
          condition: condition || null,
          state: state || null,
          negotiable: negotiable || null,
        },
      });
      return data({ success: true }, { headers: await getHeaders() });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar el producto";
      return data({ error: message });
    }
  }

  return data({ error: "Accion no valida" });
}

export default function MyProductsPage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 sm:mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1 sm:mb-2">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                Mis productos
              </h1>
            </div>
            <p className="text-sm text-muted-foreground sm:text-base sm:pl-[3.25rem]">
              Administra los productos que has publicado.
            </p>
          </div>
          <Link to="/publish-product">
            <Button>
              <PackagePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Publicar producto</span>
              <span className="sm:hidden">Publicar</span>
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg border-0 sm:border">
          <CardContent className="px-0 pt-0 sm:px-6 sm:pt-6">
            <MyProductsTable products={loaderData.products} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
