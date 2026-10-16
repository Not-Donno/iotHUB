import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Without this the build prerenders `/` and bakes the catalogue in — a
// production build would ship whatever the API said at build time, forever.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-medium text-muted-foreground">
          Sensors · Gateways · Controllers
        </p>
        <h1 className="mt-3 max-w-2xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          The marketplace for connected hardware.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Browse devices from verified vendors, compare prices, and get it
          shipped. Vendors list their own stock — no middleman.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" asChild>
            <a href="#catalogue">Browse devices</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Become a vendor</Link>
          </Button>
        </div>
      </section>

      <Separator />

      <section id="catalogue" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Featured devices
          </h2>
          {/* a plain GET form: search works with no client JS, and ?q= is shareable */}
          <form
            action="/#catalogue"
            method="get"
            role="search"
            className="flex gap-2"
          >
            <label className="sr-only" htmlFor="catalogue-search">
              Search devices
            </label>
            <Input
              id="catalogue-search"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search devices…"
              maxLength={100}
              className="w-56"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid q={q} page={page} />
        </Suspense>
      </section>
    </main>
  );
}
