import { messageOf } from "./nest-message";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";

// Public origin of the storefront: canonical URLs, Open Graph, robots and
// sitemap all derive from this. Set NEXT_PUBLIC_SITE_URL in production.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3300";

export type ProductStatus = "draft" | "active" | "archived";

export type Product = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  currency: string;
  stock: number;
  status: ProductStatus;
};

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error(`GET /products → ${res.status}`);
  return res.json();
}

// null means "no such product": 404 for a real uuid that is missing or not
// active, 400 for a malformed one (ParseUUIDPipe). Everything else throws so
// an unreachable API does not masquerade as a missing product.
export async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${encodeURIComponent(id)}`);
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`GET /products/${id} → ${res.status}`);
  return res.json();
}

// Every listing the vendor owns, drafts and archived included.
export async function getMyProducts(token: string): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products/mine`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET /products/mine → ${res.status}`);
  return res.json();
}

export type OrderLine = {
  id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
};

export type Order = {
  id: string;
  total: number;
  currency: string;
  created_at: string;
  items: OrderLine[];
};

// Every order the signed-in customer has placed, newest first.
export async function getMyOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders/mine`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET /orders/mine → ${res.status}`);
  return res.json();
}

// A sale is one order that contains lines of this vendor's. `subtotal` is the
// vendor's own share, not the order total — one order can span vendors.
export type Sale = {
  id: string;
  currency: string;
  created_at: string;
  subtotal: number;
  items: OrderLine[];
};

// Every order containing the signed-in vendor's lines, newest first.
export async function getMySales(token: string): Promise<Sale[]> {
  const res = await fetch(`${API_URL}/orders/sales`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET /orders/sales → ${res.status}`);
  return res.json();
}

// Checkout leans on the backend for pricing, stock and currency checks; a
// failure carries the backend's own message, shown verbatim on the cart page.
export async function createOrder(
  token: string,
  items: { productId: string; quantity: number }[],
): Promise<{ ok: true; order: Order } | { ok: false; message: string }> {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    return {
      ok: false,
      message: messageOf(
        await res.json().catch(() => null),
        "Could not place the order.",
      ),
    };
  }
  return { ok: true, order: await res.json() };
}

// NPR renders as "Rs 1,299" (narrowSymbol, en-US digits) — the convention on
// Nepali webshops. minimumFractionDigits 0 keeps whole prices clean; cents
// still show when a price has them.
const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

export { money };
