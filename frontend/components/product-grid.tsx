import Link from "next/link";
import { Cpu } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/lib/api";

// keeps an active search when stepping between pages
function pageHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/${qs ? `?${qs}` : ""}#catalogue`;
}

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

export async function ProductGrid({
  q = "",
  page = 1,
}: {
  q?: string;
  page?: number;
}) {
  let data;
  try {
    data = await getProducts({ q, page });
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

  const { items, total, limit } = data;
  const pages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(Math.max(1, page), pages);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Cpu className="size-6 text-muted-foreground" />
          {total > 0 ? (
            <>
              <p className="font-medium">Nothing on page {page}.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={pageHref(q, 1)}>Back to page 1</Link>
              </Button>
            </>
          ) : q ? (
            <>
              <p className="font-medium">No devices match “{q}”.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/#catalogue">Clear search</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium">No devices listed yet.</p>
              <p className="text-muted-foreground">
                Vendors can publish the first one from their dashboard.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {pages > 1 && (
        <nav
          aria-label="Catalogue pages"
          className="flex items-center justify-center gap-4"
        >
          {current > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref(q, current - 1)} rel="prev">
                Previous
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {current} of {pages}
          </span>
          {current < pages ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageHref(q, current + 1)} rel="next">
                Next
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}

export { ProductGridSkeleton };
