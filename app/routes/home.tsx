import type { Route } from "./+types/home";
import { Products } from "~/components/products";
import { getProductsList } from "~/services/products/products";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Trompeventas.cl" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  console.log(request.headers.get("cookie"));
  const product = await getProductsList();
  return product;
}
export default function Home({ loaderData }: Route.ComponentProps) {
  return <Products products={loaderData} />;
}
