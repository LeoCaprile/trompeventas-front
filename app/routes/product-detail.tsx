import type { Route } from "./+types/product-detail";
import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Calendar,
  HandCoins,
  User,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Link, useFetcher, redirect, data } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { EditProductDialog } from "~/components/edit-product-dialog";
import { getProductById } from "~/services/products/products";
import { getAuthSession } from "~/services/auth/session.server";
import {
  getProductComments,
  buildCommentTree,
} from "~/services/comments/comments";
import { CommentSection } from "~/components/comment-section";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { signInData, authenticatedFetch, getHeaders } =
    await getAuthSession(request);
  const currentUserId = signInData?.user?.id ?? null;

  const [product, flatComments] = await Promise.all([
    getProductById(params.id),
    signInData?.accessToken
      ? authenticatedFetch<{ comments: Array<import("~/services/comments/comments").CommentFlat> }>(
          "get",
          `products/${params.id}/comments`,
        ).then((res) => res.comments)
      : getProductComments(params.id),
  ]);

  const comments = buildCommentTree(flatComments);

  return data(
    { ...product, currentUserId, comments },
    { headers: await getHeaders() },
  );
}

export async function action({ params, request }: Route.ActionArgs) {
  const { signInData, authenticatedFetch, getHeaders } =
    await getAuthSession(request);

  if (!signInData?.accessToken) {
    throw redirect("/sign-in");
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    try {
      await authenticatedFetch("delete", `products/me/${params.id}`);
      return redirect("/my-products");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar el producto";
      return data({ error: message });
    }
  }

  if (intent === "update") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const condition = formData.get("condition") as string;
    const state = formData.get("state") as string;
    const negotiable = formData.get("negotiable") as string;

    if (!name || !price) {
      return data({ error: "Campos requeridos faltantes" });
    }

    try {
      await authenticatedFetch("put", `products/me/${params.id}`, {
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

  if (intent === "add-comment") {
    const content = formData.get("content") as string;
    const parentId = formData.get("parentId") as string | null;

    if (!content?.trim()) {
      return data({ error: "El comentario no puede estar vacio" });
    }

    try {
      await authenticatedFetch("post", `products/${params.id}/comments/`, {
        json: {
          content: content.trim(),
          parentId: parentId || null,
        },
      });
      return data({ success: true }, { headers: await getHeaders() });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear el comentario";
      return data({ error: message });
    }
  }

  if (intent === "delete-comment") {
    const commentId = formData.get("commentId") as string;

    try {
      await authenticatedFetch("delete", `comments/${commentId}`);
      return data({ success: true }, { headers: await getHeaders() });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar el comentario";
      return data({ error: message });
    }
  }

  if (intent === "vote-comment") {
    const commentId = formData.get("commentId") as string;
    const voteType = formData.get("voteType") as string;

    try {
      await authenticatedFetch("put", `comments/${commentId}/vote`, {
        json: { voteType },
      });
      return data({ success: true }, { headers: await getHeaders() });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al votar";
      return data({ error: message });
    }
  }

  if (intent === "remove-vote") {
    const commentId = formData.get("commentId") as string;

    try {
      await authenticatedFetch("delete", `comments/${commentId}/vote`);
      return data({ success: true }, { headers: await getHeaders() });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al remover el voto";
      return data({ error: message });
    }
  }

  return data({ error: "Accion no valida" });
}

export default function ProductDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const product = loaderData;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const deleteFetcher = useFetcher();
  const editFetcher = useFetcher();

  const isDeleting = deleteFetcher.state !== "idle";
  const isEditing = editFetcher.state !== "idle";

  const isOwner = product.currentUserId != null && product.currentUserId === product.product.user_id;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length,
    );
  };

  const formattedDate = new Date(product.product.created_at).toLocaleDateString(
    "es-CL",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const sellerLocation = [product.seller?.city, product.seller?.region]
    .filter(Boolean)
    .join(", ");

  function handleDelete() {
    deleteFetcher.submit(
      { intent: "delete" },
      { method: "POST" },
    );
    setShowDeleteDialog(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="group relative flex items-center justify-center aspect-square overflow-hidden rounded-lg bg-secondary">
                <img
                  src={
                    product.images[currentImageIndex]?.image_url ||
                    "/placeholder.svg"
                  }
                  alt={product.product.name}
                  className="object-cover w-full"
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-background"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-background"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative h-20 w-20 overflow-hidden rounded-md border-2 transition-all ${
                        currentImageIndex === index
                          ? "border-primary"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <img
                        src={image.image_url || "/placeholder.svg"}
                        alt={`${product.product.name} thumbnail ${index + 1}`}
                        className="object-cover w-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.categories?.[0] && (
                    <Badge
                      variant="secondary"
                      className="bg-secondary text-foreground"
                    >
                      {product.categories[0].name}
                    </Badge>
                  )}
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
                </div>
                <div className="flex gap-2">
                  {isOwner && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-transparent"
                        onClick={() => setShowEditDialog(true)}
                        disabled={isEditing}
                      >
                        <Pencil className="h-5 w-5" />
                        <span className="sr-only">Editar producto</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-transparent text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Eliminar producto</span>
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-transparent"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart
                      className={`h-5 w-5 ${isFavorited ? "fill-primary text-primary" : ""}`}
                    />
                    <span className="sr-only">Agregar a favoritos</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-transparent"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">Compartir</span>
                  </Button>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {product.product.name}
                </h1>
                <p className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
                  ${product.product.price.toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {sellerLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {sellerLocation}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {product.product.condition}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
                  <HandCoins className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {product.product.negotiable}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="mb-3 text-lg font-semibold text-foreground">
                  Descripcion
                </h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  {product.product.description}
                </p>
              </div>

              <Separator />

              {product.seller && (
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-primary">
                        <AvatarImage
                          src={product.seller.image || undefined}
                          alt={product.seller.name}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {product.seller.name}
                        </h3>
                        {(product.seller.city || product.seller.region) && (
                          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {sellerLocation}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Separator className="my-8" />
          <CommentSection
            comments={product.comments}
            currentUserId={product.currentUserId}
            productId={product.product.id}
          />
        </div>
      </main>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              Estas seguro de que quieres eliminar &quot;{product.product.name}&quot;?
              Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
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

      <EditProductDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={product.product}
        isSubmitting={isEditing}
        onSubmit={(formData) => editFetcher.submit(formData, { method: "POST" })}
      />
    </div>
  );
}
