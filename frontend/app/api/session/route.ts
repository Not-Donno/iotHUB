import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

type Body = {
  mode?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
};

// Nest errors carry `message` either as a string or as a validation array.
function messageOf(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
  }
  return fallback;
}

export async function POST(request: Request) {
  const body = ((await request.json().catch(() => null)) ?? {}) as Body;
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  if (body.mode === "register") {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        role: body.role === "vendor" ? "vendor" : "customer",
      }),
    });
    if (!res.ok) {
      return NextResponse.json(
        {
          message: messageOf(
            await res.json().catch(() => null),
            "Could not create the account.",
          ),
        },
        { status: res.status },
      );
    }
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    return NextResponse.json(
      {
        message: messageOf(
          await res.json().catch(() => null),
          "Sign in failed.",
        ),
      },
      { status: res.status },
    );
  }

  const { access_token: token } = await res.json();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // matches the backend's default JWT_EXPIRES_IN of 1d
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
