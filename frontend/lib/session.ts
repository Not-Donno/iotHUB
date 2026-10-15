import { cookies } from "next/headers";
import { API_URL } from "./api";

export const SESSION_COOKIE = "token";

export type SessionUser = {
  id: string;
  email: string;
  role: "customer" | "vendor" | "admin";
};

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

// The cookie is the only client-visible session state; the backend stays the
// authority, so a deleted or demoted account loses its session on next render.
export async function getSession(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}
