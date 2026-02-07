import type { Route } from "./+types/product-detail";
import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getProductById } from "~/services/products/products";

export async function loader({ params }: Route.LoaderArgs) {
  const product = await getProductById(params.id);
  return product;
}

export default function ProductDetailPage({
  loaderData: product,
}: Route.ComponentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length,
    );
  };

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
                    product.images[currentImageIndex].image_url ||
                    "/placeholder.svg"
                  }
                  alt={product.product.name}
                  className="object-cover w-full "
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
                <Badge
                  variant="secondary"
                  className="bg-secondary text-foreground"
                >
                  {product.categories[0].name}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-transparent"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart
                      className={`h-5 w-5 ${isFavorited ? "fill-primary text-primary" : ""}`}
                    />
                    <span className="sr-only">Add to favorites</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-transparent"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">Share</span>
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
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Quilpue
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(product.product.created_at).toString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Condición: usado</span>
                </div>
              </div>
              <Separator />
              <div>
                <h2 className="mb-3 text-lg font-semibold text-foreground">
                  Description
                </h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  {product.product.description}
                </p>
              </div>
              <Separator />
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary">
                      <AvatarImage src={"/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground"></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground"></h3>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="h-4 w-4 fill-primary" />
                          <span className="font-medium"></span>
                        </div>
                        <span className="text-muted-foreground"></span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
