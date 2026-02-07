import type { Product } from "~/services/products/products";
import { ProductCard } from "./product-card";

interface Props {
  products: Product[];
}

export function Products({ products }: Props) {
  return (
    <div className="grid p-4 gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.product.id} {...product} />
      ))}
    </div>
  );
}
