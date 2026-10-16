import { Cpu } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { Card, CardContent } from "@/components/ui/card";
import { getProduct, money, SITE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

const productDescription = (name: string, description: string) =>
  description.replace(/\s+/g, " ").trim().slice(0, 160) ||
  `Buy ${name} from a verified vendor on iotHUB.`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // Best effort: if the API is unreachable the page renders its own error
  // state, so a missing title here is not worth failing the render over.
  const product = await getProduct(id).catch(() => null);
  if (!product) return { title: "Product not found" };

  const description = productDescription(product.name, product.description);
  const url = `/products/${product.id}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      url,
      type: "website",
      ...(product.image_url ? { images: [product.image_url] } : {}),
    },
  };
}

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

  // Rich result data for search engines. Escaping "<" keeps a product name
  // like "</script>" from terminating the tag.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.image_url ? { image: product.image_url } : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.id}`,
      price: product.price,
      priceCurrency: product.currency,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  }).replace(/</g, "\\u003c");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Link
        href="/#catalogue"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to catalogue
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border bg-muted text-muted-foreground">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied URL, arbitrary hosts can't go through next/image
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Cpu className="size-16" />
          )}
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
          {product.stock > 0 ? (
            <div className="mt-6">
              <AddToCart productId={product.id} />
            </div>
          ) : null}
          <p className="mt-6 whitespace-pre-line text-muted-foreground">
            {product.description || "No description yet."}
          </p>
        </div>
      </div>
    </main>
  );
}
