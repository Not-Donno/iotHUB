import { cookies } from "next/headers";
import Link from "next/link";
import { checkout } from "./actions";
import { CartLineControls } from "@/components/cart-line-controls";
import { Button } from "@/components/ui/button";
import { getProduct, money, type Product } from "@/lib/api";
import { CART_COOKIE, cartCount, parseCart, type CartLine } from "@/lib/cart";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const store = await cookies();
  const lines = parseCart(store.get(CART_COOKIE)?.value);
  const user = await getSession();

  const resolved = await Promise.all(
    lines.map(async (line) => ({
      line,
      product: await getProduct(line.productId).catch(() => null),
    })),
  );
  const orderable = resolved.filter(
    (row): row is { line: CartLine; product: Product } => row.product !== null,
  );

  const totals = new Map<string, number>();
  for (const { line, product } of orderable) {
    totals.set(
      product.currency,
      (totals.get(product.currency) ?? 0) + product.price * line.quantity,
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Your cart
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {lines.length === 0
          ? "Nothing here yet."
          : `${cartCount(lines)} ${cartCount(lines) === 1 ? "item" : "items"} — stock and prices are confirmed at checkout.`}
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {lines.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Add a device from the catalogue and it will show up here.
          </p>
          <Button size="lg" className="mt-4" asChild>
            <Link href="/">Browse devices</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y rounded-xl border px-5">
            {resolved.map(({ line, product }) => (
              <li
                key={line.productId}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  {product ? (
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-muted-foreground">
                      Item no longer available
                    </span>
                  )}
                  {product ? (
                    <p className="text-sm text-muted-foreground">
                      {money(product.price, product.currency)} each
                    </p>
                  ) : null}
                  {product && line.quantity > product.stock ? (
                    <p className="text-sm text-destructive">
                      Only {product.stock} left — reduce to continue.
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-4">
                  {product ? (
                    <p className="text-sm tabular-nums">
                      {money(product.price * line.quantity, product.currency)}
                    </p>
                  ) : null}
                  <CartLineControls
                    productId={line.productId}
                    quantity={line.quantity}
                  />
                </div>
              </li>
            ))}
          </ul>

          {orderable.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Nothing here can be ordered right now.
            </p>
          ) : (
            <div className="mt-6 flex items-end justify-between border-t pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                {[...totals].map(([currency, amount]) => (
                  <p key={currency} className="font-heading text-xl">
                    {money(amount, currency)}
                  </p>
                ))}
              </div>
              {user ? (
                user.role === "customer" ? (
                  <form action={checkout}>
                    <Button type="submit" size="lg">
                      Place order
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Only customer accounts can place orders.
                  </p>
                )
              ) : (
                <Button size="lg" asChild>
                  <Link href="/signin">Sign in to order</Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
