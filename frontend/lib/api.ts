export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";

export type ProductStatus = "draft" | "active" | "archived";

export type Product = {
  id: string;
  name: string;
  description: string;
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
