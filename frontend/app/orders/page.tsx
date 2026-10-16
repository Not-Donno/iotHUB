import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyOrders, money, type Order } from "@/lib/api";
import { getSession, getToken } from "@/lib/session";

export const dynamic = "force-dynamic";

const placedOn = (createdAt: string) =>
  new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const user = await getSession();
  if (!user) redirect("/signin");

  if (user.role !== "customer") {
    return (
      <main className="mx-auto w-full max-w-sm px-6 py-16">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Your orders
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You are signed in as a {user.role} ({user.email}). Only customer
          accounts have orders.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/">Browse devices</Link>
        </Button>
      </main>
    );
  }

  const token = await getToken();
  let orders: Order[];
  try {
    orders = token ? await getMyOrders(token) : [];
  } catch {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <Card>
          <CardContent className="space-y-1 py-6 text-center">
            <p className="font-medium">Could not load your orders.</p>
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
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Your orders
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {orders.length} {orders.length === 1 ? "order" : "orders"} — newest
        first.
      </p>

      {notice ? (
        <p className="mt-6 rounded-lg border px-4 py-3 text-sm">{notice}</p>
      ) : null}

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No orders yet — anything you buy will show up here.
          </p>
          <Button size="lg" className="mt-4" asChild>
            <Link href="/">Browse devices</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">Order {order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">
                  {placedOn(order.created_at)}
                </p>
              </div>
              <ul className="mt-3 divide-y text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-2">
                    <span>
                      {item.product_name}{" "}
                      <span className="text-muted-foreground">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="tabular-nums">
                      {money(item.unit_price * item.quantity, order.currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-heading text-base">
                  {money(order.total, order.currency)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
