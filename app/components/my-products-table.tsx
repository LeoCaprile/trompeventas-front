import { useState } from "react";
import { useFetcher, Link } from "react-router";
import type { Product } from "~/services/products/products";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { EditProductDialog } from "~/components/edit-product-dialog";
import {
  Pencil,
  Trash2,
  Loader2,
  PackageOpen,
  Eye,
} from "lucide-react";

interface MyProductsTableProps {
  products: Product[];
}

export function MyProductsTable({ products }: MyProductsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const deleteFetcher = useFetcher();
  const editFetcher = useFetcher();

  const isDeleting = deleteFetcher.state !== "idle";
  const isEditing = editFetcher.state !== "idle";

  function handleDelete() {
    if (!deleteTarget) return;
    deleteFetcher.submit(
      { intent: "delete", productId: deleteTarget.product.id },
      { method: "POST" },
    );
    setDeleteTarget(null);
  }

  function handleEditSubmit(formData: FormData) {
    editFetcher.submit(formData, { method: "POST" });
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <PackageOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">
          No tienes productos publicados
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Publica tu primer producto para verlo aqui.
        </p>
        <Link to="/publish-product">
          <Button>Publicar producto</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Condicion</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.product.id}>
                <TableCell>
                  <img
                    src={product.images?.[0]?.image_url || "/placeholder.svg"}
                    alt={product.product.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {product.product.name}
                </TableCell>
                <TableCell>${product.product.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={product.product.state === "Disponible" ? "default" : "secondary"}
                    className={
                      product.product.state === "Vendido"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : product.product.state === "Retirado"
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : ""
                    }
                  >
                    {product.product.state}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.product.condition}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/products/${product.product.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditTarget(product)}
                      disabled={isEditing}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(product)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-border">
        {products.map((product) => (
          <div key={product.product.id} className="px-3 py-3 space-y-2">
            <div className="flex items-start gap-3">
              <img
                src={product.images?.[0]?.image_url || "/placeholder.svg"}
                alt={product.product.name}
                className="h-16 w-16 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold truncate">{product.product.name}</p>
                <p className="text-base font-bold text-primary mt-0.5">
                  ${product.product.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge
                    variant="outline"
                    className={
                      product.product.state === "Vendido"
                        ? "bg-green-100 text-green-700 border-green-300 text-[10px] px-1.5 py-0"
                        : product.product.state === "Retirado"
                          ? "bg-red-100 text-red-700 border-red-300 text-[10px] px-1.5 py-0"
                          : "text-[10px] px-1.5 py-0"
                    }
                  >
                    {product.product.state}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {product.product.condition}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-0.5">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground" asChild>
                <Link to={`/products/${product.product.id}`}>
                  <Eye className="h-3.5 w-3.5" />
                  Ver
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-muted-foreground"
                onClick={() => setEditTarget(product)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(product)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              Estas seguro de que quieres eliminar &quot;{deleteTarget?.product.name}&quot;?
              Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editTarget && (
        <EditProductDialog
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          product={editTarget.product}
          productId={editTarget.product.id}
          isSubmitting={isEditing}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
}
