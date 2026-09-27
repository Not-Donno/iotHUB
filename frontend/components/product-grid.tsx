import { Cpu } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/lib/api";

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

export async function ProductGrid() {
  let products;
  try {
    products = await getProducts();
  } catch {
    return (
      <Card>
        <CardContent className="space-y-1 py-6 text-center">
          <p className="font-medium">Could not reach the catalogue.</p>
          <p className="text-muted-foreground">
            Start the API with{" "}
            <code className="font-mono">PORT=3100 npm run start:dev</code> in{" "}
            <code className="font-mono">backend/</code>, then reload.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Cpu className="size-6 text-muted-foreground" />
          <p className="font-medium">No devices listed yet.</p>
          <p className="text-muted-foreground">
            Vendors can publish the first one from their dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  // The API is meant to return `status = active` only (docs/ROADMAP.md). Until it
  // does, a non-active product shows up here with its status badge rather than
  // being silently hidden — fix the filter server-side, not in this component.
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export { ProductGridSkeleton };
