import { Loader2 } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { ProductDetails } from "~/services/products/products";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDetails;
  productId?: string;
  isSubmitting: boolean;
  onSubmit: (formData: FormData) => void;
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  productId,
  isSubmitting,
  onSubmit,
}: EditProductDialogProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("intent", "update");
    if (productId) {
      formData.set("productId", productId);
    }
    onSubmit(formData);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Modifica los datos de tu producto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              name="name"
              required
              defaultValue={product.name}
              key={`name-${open}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripcion</Label>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={product.description ?? ""}
              rows={3}
              key={`desc-${open}`}
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
              defaultValue={product.price}
              key={`price-${open}`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Condicion</Label>
              <RadioGroup name="condition" defaultValue={product.condition} key={`cond-${open}`}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Nuevo" id="edit-condition-nuevo" />
                  <Label htmlFor="edit-condition-nuevo">Nuevo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Usado" id="edit-condition-usado" />
                  <Label htmlFor="edit-condition-usado">Usado</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Reacondicionado" id="edit-condition-reacondicionado" />
                  <Label htmlFor="edit-condition-reacondicionado">Reacondicionado</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <RadioGroup name="state" defaultValue={product.state} key={`state-${open}`}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Disponible" id="edit-state-disponible" />
                  <Label htmlFor="edit-state-disponible">Disponible</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Vendido" id="edit-state-vendido" />
                  <Label htmlFor="edit-state-vendido">Vendido</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Retirado" id="edit-state-retirado" />
                  <Label htmlFor="edit-state-retirado">Retirado</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Negociable</Label>
              <RadioGroup name="negotiable" defaultValue={product.negotiable} key={`neg-${open}`}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Conversable" id="edit-negotiable-conversable" />
                  <Label htmlFor="edit-negotiable-conversable">Conversable</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="No conversable" id="edit-negotiable-no-conversable" />
                  <Label htmlFor="edit-negotiable-no-conversable">No conversable</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
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
      </DialogContent>
    </Dialog>
  );
}
