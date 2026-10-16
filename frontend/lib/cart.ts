export const CART_COOKIE = "cart";
export const MAX_QTY = 999;

export type CartLine = {
  productId: string;
  quantity: number;
};

// The cart lives in a plain, client-writable cookie on purpose: the header
// count, the cart page and the checkout action all need to read it server
// side. Nothing in it is a trust boundary — the backend re-checks stock,
// prices and currency on checkout.
export function parseCart(raw: string | undefined | null): CartLine[] {
  if (!raw) return [];
  for (const candidate of [raw, decodeOrNull(raw)]) {
    if (!candidate) continue;
    const lines = parseJson(candidate);
    if (lines) return lines;
  }
  return [];
}

export function serializeCart(lines: CartLine[]): string {
  return JSON.stringify(
    lines.map(({ productId, quantity }) => ({ productId, quantity })),
  );
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

// quantity <= 0 removes the line; above MAX_QTY clamps — not the cart's job
// to reject, the backend caps at 999 too.
export function upsertLine(
  lines: CartLine[],
  productId: string,
  quantity: number,
): CartLine[] {
  const rest = lines.filter((line) => line.productId !== productId);
  const clamped = Math.min(quantity, MAX_QTY);
  if (clamped <= 0) return rest;
  return [...rest, { productId, quantity: clamped }];
}

// client-only helpers: the two cart components call these from the browser
export function readClientCart(): CartLine[] {
  if (typeof document === "undefined") return [];
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CART_COOKIE}=`))
    ?.slice(CART_COOKIE.length + 1);
  return parseCart(raw);
}

export function writeClientCart(lines: CartLine[]): void {
  document.cookie = `${CART_COOKIE}=${encodeURIComponent(
    serializeCart(lines),
  )}; path=/; max-age=2592000; samesite=lax`;
}

function decodeOrNull(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

function parseJson(raw: string): CartLine[] | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return null;
    return value
      .map((line) =>
        typeof line === "object" && line !== null
          ? {
              productId: (line as CartLine).productId,
              quantity: (line as CartLine).quantity,
            }
          : null,
      )
      .filter(
        (line): line is CartLine =>
          !!line && typeof line.productId === "string",
      )
      .map((line) => ({ productId: line.productId, quantity: clampQty(line.quantity) }))
      .filter((line) => line.quantity > 0);
  } catch {
    return null;
  }
}

function clampQty(quantity: number): number {
  if (!Number.isInteger(quantity)) return 0;
  return Math.min(quantity, MAX_QTY);
}
