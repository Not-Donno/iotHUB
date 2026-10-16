"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { readClientCart, upsertLine, writeClientCart } from "@/lib/cart";

export function CartLineControls({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setQuantity(next: number) {
    writeClientCart(upsertLine(readClientCart(), productId, next));
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        disabled={pending}
        onClick={() => setQuantity(quantity - 1)}
        aria-label="Decrease quantity"
      >
        −
      </Button>
      <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
      <Button
        variant="outline"
        size="icon-sm"
        disabled={pending}
        onClick={() => setQuantity(quantity + 1)}
        aria-label="Increase quantity"
      >
        +
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => setQuantity(0)}
      >
        Remove
      </Button>
    </div>
  );
}
