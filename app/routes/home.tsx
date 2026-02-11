import { Link, useSearchParams } from "react-router";
import { Search, X, CheckCircle2 } from "lucide-react";
import type { Route } from "./+types/home";
import { Products } from "~/components/products";
import { getProductsList } from "~/services/products/products";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Trompeventas.cl" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const products = await getProductsList(q ? { q } : undefined);
  return { products, q };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { products, q } = loaderData;
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified");

  return (
    <div>
      {verified && (
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-green-800 font-medium">
              ¡Email verificado exitosamente! Ya puedes usar todas las funciones de tu cuenta.
            </span>
            <Link
              to="/"
              className="ml-auto flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
      {q && (
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              Resultados para{" "}
              <span className="font-medium text-foreground">"{q}"</span>
            </span>
            <Link
              to="/"
              className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Limpiar</span>
            </Link>
          </div>
        </div>
      )}
      <Products products={products} />
    </div>
  );
}
