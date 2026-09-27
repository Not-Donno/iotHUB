import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Without this the build prerenders `/` and bakes the catalogue in — a
// production build would ship whatever the API said at build time, forever.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <SiteHeader />
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
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Featured devices
            </h2>
            <span className="text-sm text-muted-foreground">Live from the API</span>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid />
          </Suspense>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>iotHUB — IoT device marketplace</p>
          <p>Built on Next.js and NestJS</p>
        </div>
      </footer>
    </>
  );
}
