import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createProduct, deleteProduct, updateProduct } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyProducts, money, type Product, type ProductStatus } from "@/lib/api";
import { getSession, getToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Vendor dashboard — iotHUB" };

const badgeVariant: Record<
  ProductStatus,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

const textareaClass =
  "min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const selectClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function ProductFields({ product }: { product?: Product }) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={product ? `name-${product.id}` : "name"}>
          Name
        </label>
        <Input
          id={product ? `name-${product.id}` : "name"}
          name="name"
          required
          maxLength={200}
          defaultValue={product?.name}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={product ? `price-${product.id}` : "price"}>
            Price
          </label>
          <Input
            id={product ? `price-${product.id}` : "price"}
            name="price"
            type="number"
            required
            min={0}
            max={99999999.99}
            step="0.01"
            defaultValue={product?.price}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={product ? `stock-${product.id}` : "stock"}>
            Stock
          </label>
          <Input
            id={product ? `stock-${product.id}` : "stock"}
            name="stock"
            type="number"
            required
            min={0}
            step={1}
            defaultValue={product?.stock ?? 0}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={product ? `status-${product.id}` : "status"}>
            Status
          </label>
          <select
            id={product ? `status-${product.id}` : "status"}
            name="status"
            className={selectClass}
            defaultValue={product?.status ?? "active"}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={product ? `description-${product.id}` : "description"}>
          Description
        </label>
        <textarea
          id={product ? `description-${product.id}` : "description"}
          name="description"
          className={textareaClass}
          defaultValue={product?.description}
        />
      </div>
      {product ? null : (
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="currency">
            Currency
          </label>
          <select id="currency" name="currency" className={selectClass} defaultValue="NPR">
            <option value="NPR">NPR — Nepali rupees</option>
            <option value="USD">USD — US dollars</option>
          </select>
        </div>
      )}
    </>
  );
}

export default async function VendorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;
  const user = await getSession();
  if (!user) redirect("/signin");

  if (user.role !== "vendor") {
    return (
      <main className="mx-auto w-full max-w-sm px-6 py-16">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Vendor dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You are signed in as a customer ({user.email}). Selling needs a vendor
          account: sign out, then register again with a different email and
          pick &ldquo;Sell IoT devices&rdquo;.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/">Browse devices</Link>
        </Button>
      </main>
    );
  }

  const token = await getToken();
  const products = token ? await getMyProducts(token) : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Your listings
        </h1>
        <Button variant="outline" asChild>
          <Link href="/vendor/sales">Sales</Link>
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {products.length} {products.length === 1 ? "listing" : "listings"} —
        drafts, active and archived all live here.
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-6 rounded-lg border px-4 py-3 text-sm">{notice}</p>
      ) : null}

      <details className="mt-8 rounded-xl border p-6">
        <summary className="cursor-pointer font-medium">New listing</summary>
        <form action={createProduct} className="mt-4 space-y-4">
          <ProductFields />
          <Button type="submit" size="lg">
            Create listing
          </Button>
        </form>
      </details>

      {products.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No listings yet — create your first one above.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {products.map((product) => (
            <li key={product.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {money(product.price, product.currency)} · {product.stock} in
                    stock
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant[product.status]}>
                    {product.status}
                  </Badge>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-primary">
                  Edit
                </summary>
                <form action={updateProduct} className="mt-4 space-y-4">
                  <input type="hidden" name="id" value={product.id} />
                  <ProductFields product={product} />
                  <Button type="submit">Save changes</Button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
