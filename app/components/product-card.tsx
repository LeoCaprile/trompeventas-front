import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
  };
  images: {
    id: string;
    image_url: string;
  }[];

  categories: {
    id: string;
    name: string;
  }[];
}

export function ProductCard({ product, images, categories }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`}>
      <Card className="group overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-secondary">
          <img
            src={images[0].image_url || "/placeholder.svg"}
            alt={"image"}
            className="object-fill w-full object-center transition-transform duration-300 group-hover:scale-105"
          />
          <Badge
            variant="secondary"
            className="absolute right-3 top-3 bg-background/80 text-foreground backdrop-blur-sm"
          >
            {categories[0].name}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-lg font-bold text-primary">
            ${product.price.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
