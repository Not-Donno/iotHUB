import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getCategories } from "@/lib/api";

// Without this the build prerenders `/` and bakes the catalogue in — a
// production build would ship whatever the API said at build time, forever.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  // folded like the backend folds it, so the select can match an option
  const category =
    typeof params.category === "string"
      ? params.category.trim().toLowerCase()
      : "";
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);

  // an unreachable API must not take the page down; the grid shows its own
  // error card in that case
  const categories = await getCategories().catch((): string[] => []);
  // a URL can name a category the dropdown doesn't list (no active stock):
  // keep it as an option or the select silently drops the filter
  const categoryOptions =
    category && !categories.includes(category)
      ? [category, ...categories]
      : categories;
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
            <label className="sr-only" htmlFor="catalogue-category">
              Category
            </label>
            <select
              id="catalogue-category"
              name="category"
              defaultValue={category}
              className="h-10 w-44 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid q={q} page={page} category={category} />
        </Suspense>
      </section>
    </main>
  );
}
