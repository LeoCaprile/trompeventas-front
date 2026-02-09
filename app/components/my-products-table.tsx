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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
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

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("intent", "update");
    formData.set("productId", editTarget!.product.id);
    editFetcher.submit(formData, { method: "POST" });
    setEditTarget(null);
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
          <div key={product.product.id} className="flex items-center gap-3 px-4 py-3">
            <img
              src={product.images?.[0]?.image_url || "/placeholder.svg"}
              alt={product.product.name}
              className="h-14 w-14 rounded-md object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.product.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-primary">
                  ${product.product.price.toLocaleString()}
                </p>
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
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link to={`/products/${product.product.id}`}>
                  <Eye className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditTarget(product)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(product)}
              >
                <Trash2 className="h-3.5 w-3.5" />
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

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Modifica los datos de tu producto.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  name="name"
                  required
                  defaultValue={editTarget.product.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripcion</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editTarget.product.description ?? ""}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  required
                  min={1}
                  defaultValue={editTarget.product.price}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-condition">Condicion</Label>
                  <select
                    id="edit-condition"
                    name="condition"
                    defaultValue={editTarget.product.condition}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Usado">Usado</option>
                    <option value="Reacondicionado">Reacondicionado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">Estado</Label>
                  <select
                    id="edit-state"
                    name="state"
                    defaultValue={editTarget.product.state}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Retirado">Retirado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-negotiable">Negociable</Label>
                  <select
                    id="edit-negotiable"
                    name="negotiable"
                    defaultValue={editTarget.product.negotiable}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Conversable">Conversable</option>
                    <option value="No conversable">No conversable</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditTarget(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isEditing}>
                  {isEditing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
