import { useState, useRef } from "react";
import { Form, useNavigation } from "react-router";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Loader2,
  X,
  Check,
  ImagePlus,
  DollarSign,
  Tag,
  FileText,
  RotateCw,
  Images,
  ClipboardList,
} from "lucide-react";
import type { CategoryT } from "~/services/categories/categories";

interface ImageUpload {
  file: File;
  preview: string;
  status: "uploading" | "done" | "error";
  publicUrl?: string;
  error?: string;
}

interface PublishProductFormProps {
  categories: CategoryT[];
}

export function PublishProductForm({ categories }: PublishProductFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploads, setUploads] = useState<ImageUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [priceRaw, setPriceRaw] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");

  const allUploaded =
    uploads.length > 0 && uploads.every((u) => u.status === "done");
  const hasUploadingImages = uploads.some((u) => u.status === "uploading");

  function formatPrice(value: string) {
    const digits = value.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setPriceRaw(digits);
    setPriceDisplay(formatPrice(digits));
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function uploadFile(upload: ImageUpload) {
    try {
      const presignRes = await fetch("/api/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: upload.file.name,
          contentType: upload.file.type,
        }),
      });

      if (!presignRes.ok) {
        throw new Error("No se pudo obtener la URL de subida");
      }

      const { presignedUrl, publicUrl } = await presignRes.json();

      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: upload.file,
      });

      if (!uploadRes.ok) {
        throw new Error("Error al subir la imagen");
      }

      setUploads((prev) =>
        prev.map((u) =>
          u.preview === upload.preview
            ? { ...u, status: "done", publicUrl }
            : u,
        ),
      );
    } catch (err) {
      setUploads((prev) =>
        prev.map((u) =>
          u.preview === upload.preview
            ? {
                ...u,
                status: "error",
                error:
                  err instanceof Error ? err.message : "Error al subir",
              }
            : u,
        ),
      );
    }
  }

  async function processFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (fileArray.length === 0) return;

    const newUploads: ImageUpload[] = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "uploading" as const,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      await uploadFile(upload);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    await processFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  }

  function removeImage(preview: string) {
    setUploads((prev) => {
      const removed = prev.find((u) => u.preview === preview);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((u) => u.preview !== preview);
    });
  }

  async function retryUpload(preview: string) {
    const upload = uploads.find((u) => u.preview === preview);
    if (!upload) return;

    setUploads((prev) =>
      prev.map((u) =>
        u.preview === preview
          ? { ...u, status: "uploading", error: undefined }
          : u,
      ),
    );

    await uploadFile(upload);
  }

  return (
    <Form method="POST" className="space-y-6 sm:space-y-8">
      {/* Product info section */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileText className="h-4 w-4" />
          Informacion del producto
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre del producto</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Ej: Trompeta Yamaha YTR-2330"
            className="h-10 sm:h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripcion</Label>
          <Textarea
            id="description"
            name="description"
            required
            placeholder="Describe el estado, modelo, ano, y cualquier detalle relevante..."
            rows={4}
            className="resize-none sm:rows-5"
          />
          <p className="text-xs text-muted-foreground">
            Una buena descripcion ayuda a vender mas rapido.
          </p>
        </div>
      </div>

      <Separator />

      {/* Pricing section */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          Precio
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio (CLP)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              $
            </span>
            <Input
              id="price"
              type="text"
              inputMode="numeric"
              required
              placeholder="50.000"
              value={priceDisplay}
              onChange={handlePriceChange}
              className="h-10 pl-7 sm:h-11"
            />
            <input type="hidden" name="price" value={priceRaw} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Condition & Negotiable section */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ClipboardList className="h-4 w-4" />
          Detalles adicionales
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condicion</Label>
            <select
              id="condition"
              name="condition"
              required
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-11"
            >
              <option value="" disabled>Seleccionar condicion</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Usado">Usado</option>
              <option value="Reacondicionado">Reacondicionado</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="negotiable">Precio negociable</Label>
            <select
              id="negotiable"
              name="negotiable"
              required
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-11"
            >
              <option value="" disabled>Seleccionar</option>
              <option value="Conversable">Conversable</option>
              <option value="No conversable">No conversable</option>
            </select>
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <>
          <Separator />

          {/* Categories section */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tag className="h-4 w-4" />
              Categorias
            </div>

            <div className="space-y-2">
              <Label>Selecciona las categorias que apliquen</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <Badge
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer select-none px-3 py-1.5 text-sm transition-all ${
                          isSelected
                            ? ""
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {cat.name}
                      </Badge>
                    </button>
                  );
                })}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedCategories.length}{" "}
                  {selectedCategories.length === 1
                    ? "categoria seleccionada"
                    : "categorias seleccionadas"}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {selectedCategories.map((catId) => (
        <input key={catId} type="hidden" name="categories" value={catId} />
      ))}

      <Separator />

      {/* Images section */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Images className="h-4 w-4" />
          Fotos del producto
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div
            className={`group relative rounded-xl border-2 border-dashed p-5 sm:p-8 text-center transition-all cursor-pointer ${
              isDragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/40 hover:bg-muted/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15">
                <ImagePlus className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-foreground">
                  <span className="hidden sm:inline">Arrastra imagenes aqui o haz clic para seleccionar</span>
                  <span className="sm:hidden">Toca para seleccionar imagenes</span>
                </p>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  PNG, JPG o WebP
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {uploads.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4">
              {uploads.map((upload, index) => (
                <div
                  key={upload.preview}
                  className="group/card relative aspect-square overflow-hidden rounded-lg sm:rounded-xl border bg-muted/30"
                >
                  <img
                    src={upload.preview}
                    alt={`Imagen ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Status overlay */}
                  {upload.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-spin" />
                        <span className="hidden sm:block text-xs font-medium text-white">
                          Subiendo...
                        </span>
                      </div>
                    </div>
                  )}

                  {upload.status === "done" && (
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2">
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-green-500 shadow-md">
                        <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                      </div>
                    </div>
                  )}

                  {upload.status === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          retryUpload(upload.preview);
                        }}
                        className="flex items-center gap-1 sm:gap-1.5 rounded-md sm:rounded-lg bg-white px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-foreground shadow-md transition-transform hover:scale-105"
                      >
                        <RotateCw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Reintentar
                      </button>
                    </div>
                  )}

                  {/* Remove button — always visible on mobile, hover-reveal on desktop */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(upload.preview);
                    }}
                    className="absolute right-1 top-1 sm:right-2 sm:top-2 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-sm transition-all hover:bg-black/80 sm:opacity-0 sm:group-hover/card:opacity-100"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>

                  {/* First image label */}
                  {index === 0 && upload.status === "done" && (
                    <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 rounded-md bg-primary px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-[10px] font-semibold text-primary-foreground shadow-md">
                      Portada
                    </div>
                  )}
                </div>
              ))}

              {/* Add more button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/50 hover:text-primary"
              >
                <ImagePlus className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-medium">Agregar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {uploads
        .filter((u) => u.status === "done" && u.publicUrl)
        .map((u) => (
          <input
            key={u.publicUrl}
            type="hidden"
            name="imageUrls"
            value={u.publicUrl}
          />
        ))}

      <Separator />

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          {uploads.length === 0
            ? "Agrega al menos una imagen para publicar"
            : hasUploadingImages
              ? "Esperando que las imagenes terminen de subir..."
              : allUploaded
                ? `${uploads.length} ${uploads.length === 1 ? "imagen lista" : "imagenes listas"}`
                : "Algunas imagenes tuvieron errores"}
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={!allUploaded || isSubmitting}
          className="w-full sm:w-auto sm:min-w-[180px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publicando...
            </>
          ) : (
            "Publicar producto"
          )}
        </Button>
      </div>
    </Form>
  );
}
