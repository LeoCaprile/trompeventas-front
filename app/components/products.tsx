import { Search } from "lucide-react";
import type { Product } from "~/services/products/products";
import { ProductCard } from "./product-card";

interface Props {
  products: Product[];
}

export function Products({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Search className="h-10 w-10" />
        <p className="text-lg font-medium">No se encontraron productos</p>
        <p className="text-sm">Intenta con otros terminos de busqueda</p>
      </div>
    );
  }

  return (
    <div className="grid p-4 gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.product.id} {...product} />
      ))}
    </div>
  );
}
