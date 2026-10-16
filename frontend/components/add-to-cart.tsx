"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { readClientCart, upsertLine, writeClientCart } from "@/lib/cart";

export function AddToCart({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function add() {
    const lines = readClientCart();
    const current =
      lines.find((line) => line.productId === productId)?.quantity ?? 0;
    writeClientCart(upsertLine(lines, productId, current + 1));
    // refresh so the server-rendered header badge picks the cookie up
    startTransition(() => router.refresh());
  }

  return (
    <Button size="lg" disabled={pending} onClick={add}>
      Add to cart
    </Button>
  );
}
