import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMySales, money, type Sale } from "@/lib/api";
import { getSession, getToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sales" };

const placedOn = (createdAt: string) =>
  new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default async function SalesPage() {
  const user = await getSession();
  if (!user) redirect("/signin");

  if (user.role !== "vendor") {
    return (
      <main className="mx-auto w-full max-w-sm px-6 py-16">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Sales
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You are signed in as a customer ({user.email}). Sales belong to vendor
          accounts.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/">Browse devices</Link>
        </Button>
      </main>
    );
  }

  const token = await getToken();
  let sales: Sale[];
  try {
    sales = token ? await getMySales(token) : [];
  } catch {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <Card>
          <CardContent className="space-y-1 py-6 text-center">
            <p className="font-medium">Could not load your sales.</p>
            <p className="text-muted-foreground">
              The catalogue API seems unreachable — try again in a moment.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Sales
        </h1>
        <Button variant="outline" asChild>
          <Link href="/vendor">Your listings</Link>
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {sales.length} {sales.length === 1 ? "order" : "orders"} containing your
        listings — newest first.
      </p>

      {sales.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No sales yet — orders containing your listings will show up here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {sales.map((sale) => (
            <li key={sale.id} className="rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">Order {sale.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">
                  {placedOn(sale.created_at)}
                </p>
              </div>
              <ul className="mt-3 divide-y text-sm">
                {sale.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-2">
                    <span>
                      {item.product_name}{" "}
                      <span className="text-muted-foreground">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="tabular-nums">
                      {money(item.unit_price * item.quantity, sale.currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">
                  Your items
                </span>
                <span className="font-heading text-base">
                  {money(sale.subtotal, sale.currency)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
