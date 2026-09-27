const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";

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

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export { money };
