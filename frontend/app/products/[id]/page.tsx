import { Cpu } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getProduct, money } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
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
      </main>
    );
  }

  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <Link
        href="/#catalogue"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to catalogue
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted text-muted-foreground">
          <Cpu className="size-16" />
        </div>

        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-4 font-heading text-2xl">
            {money(product.price, product.currency)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <p className="mt-6 whitespace-pre-line text-muted-foreground">
            {product.description || "No description yet."}
          </p>
        </div>
      </div>
    </main>
  );
}
