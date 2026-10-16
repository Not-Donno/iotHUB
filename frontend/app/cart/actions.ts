"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createOrder } from "@/lib/api";
import { CART_COOKIE, parseCart } from "@/lib/cart";
import { getSession, getToken } from "@/lib/session";

export async function checkout() {
  const store = await cookies();
  const lines = parseCart(store.get(CART_COOKIE)?.value);
  if (lines.length === 0) redirect("/cart");

  const user = await getSession();
  if (!user) redirect("/signin");

  const token = await getToken();
  if (!token) redirect("/signin");

  if (user.role !== "customer") {
    redirect(
      `/cart?error=${encodeURIComponent("Only customer accounts can place orders.")}`,
    );
  }

  const result = await createOrder(token, lines);
  if (!result.ok) {
    redirect(`/cart?error=${encodeURIComponent(result.message)}`);
  }

  store.delete(CART_COOKIE);
  redirect("/orders?notice=Order%20placed.");
}
