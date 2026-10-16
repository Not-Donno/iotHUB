import type { MetadataRoute } from "next";
import { getProducts, SITE_URL, type Product } from "@/lib/api";

// Per-request so a build without the API still succeeds, and new listings
// appear on the next crawl instead of the next deploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch {
    // API down: still hand the crawler the home page rather than a 500.
  }
  return [
    { url: SITE_URL },
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.id}`,
    })),
  ];
}
