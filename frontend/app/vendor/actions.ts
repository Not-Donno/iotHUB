"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { messageOf } from "@/lib/nest-message";
import { getToken } from "@/lib/session";

function field(formData: FormData, name: string, fallback = ""): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : fallback;
}

function payloadFrom(formData: FormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: field(formData, "name"),
    description: field(formData, "description"),
    price: Number(field(formData, "price")),
    stock: Number(field(formData, "stock")),
    status: field(formData, "status", "active"),
  };
  const currency = field(formData, "currency");
  if (currency) payload.currency = currency;
  return payload;
}

// The token only ever comes from the cookie, never from form data; the
// backend enforces the vendor role and per-vendor ownership on top.
async function send(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  payload?: Record<string, unknown>,
): Promise<Response> {
  const token = await getToken();
  if (!token) redirect("/signin");
  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(payload ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

async function finish(res: Response, notice: string): Promise<never> {
  if (!res.ok) {
    const message = messageOf(
      await res.json().catch(() => null),
      "Something went wrong.",
    );
    redirect(`/vendor?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/vendor");
  // an active listing has to appear in the public catalogue too
  revalidatePath("/");
  redirect(`/vendor?notice=${encodeURIComponent(notice)}`);
}

export async function createProduct(formData: FormData) {
  await finish(
    await send("/products", "POST", payloadFrom(formData)),
    "Listing created.",
  );
}

export async function updateProduct(formData: FormData) {
  const id = field(formData, "id");
  await finish(
    await send(`/products/${encodeURIComponent(id)}`, "PATCH", payloadFrom(formData)),
    "Listing updated.",
  );
}

export async function deleteProduct(formData: FormData) {
  const id = field(formData, "id");
  await finish(
    await send(`/products/${encodeURIComponent(id)}`, "DELETE"),
    "Listing deleted.",
  );
}
