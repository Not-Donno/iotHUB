import { Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { money, type Product } from "@/lib/api";

const statusVariant = {
  active: "secondary",
  draft: "outline",
  archived: "outline",
} as const;

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="h-full">
      <div className="flex h-32 items-center justify-center bg-muted text-muted-foreground">
        <Cpu className="size-8" />
      </div>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description || "No description yet."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant={statusVariant[product.status]}>{product.status}</Badge>
      </CardContent>
      <CardFooter className="mt-auto items-center justify-between">
        <span className="font-heading text-lg font-semibold">
          {money(product.price, product.currency)}
        </span>
        <span className="text-muted-foreground">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
      </CardFooter>
    </Card>
  );
}
