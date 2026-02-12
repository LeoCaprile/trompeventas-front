import { redirect } from "react-router";
import type { Route } from "./+types/publish-product";
import { sessionStorage, type SignInResponse } from "~/services/auth/auth.server";
import { getAuthSession } from "~/services/auth/session.server";
import {
  getCategories,
  type CategoryT,
} from "~/services/categories/categories";
import type { ProductDetails, Image } from "~/services/products/products";
import { PublishProductForm } from "~/components/publish-product-form";
import {
  Card,
  CardContent,
} from "~/components/ui/card";
import { AlertTriangle, PackagePlus } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Publicar producto - trompeventas.cl" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { signInData, getHeaders } = await getAuthSession(request);

  if (!signInData?.user) {
    throw redirect("/sign-in");
  }

  if (!signInData.user.emailVerified) {
    throw redirect("/verify-email");
  }

  const categories = await getCategories();

  return { categories, headers: await getHeaders() };
}

export async function action({ request }: Route.ActionArgs) {
  const { signInData, authenticatedFetch, getHeaders } = await getAuthSession(request);

  if (!signInData?.accessToken) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const condition = formData.get("condition") as string;
  const negotiable = formData.get("negotiable") as string;
  const categories = formData.getAll("categories") as string[];
  const imageUrls = formData.getAll("imageUrls") as string[];

  try {
    const result = await authenticatedFetch<{
      product: ProductDetails;
      images: Image[];
      message: string;
    }>("post", "products/publish", {
      json: { name, description, price, condition, negotiable, categories, imageUrls },
    });

    return redirect(`/products/${result.product.id}`, {
      headers: await getHeaders(),
    });
  } catch (error) {
    if (error instanceof Response) throw error; // re-throw redirects
    const message =
      error instanceof Error ? error.message : "Error al publicar el producto";
    return { error: message, headers: await getHeaders() };
  }
}

export default function PublishProductPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-1 sm:mb-2">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <PackagePlus className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
              Publicar producto
            </h1>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base sm:pl-[3.25rem]">
            Completa los detalles para publicar en la tienda.
          </p>
        </div>

        {actionData?.error && (
          <div className="mb-4 sm:mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 sm:px-4 sm:py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{actionData.error}</p>
          </div>
        )}

        <Card className="shadow-lg border-0 sm:border">
          <CardContent className="px-4 pt-5 sm:px-6 sm:pt-6">
            <PublishProductForm categories={loaderData.categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
