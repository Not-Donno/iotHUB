"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm({ initialRole }: { initialRole: "customer" | "vendor" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "register",
        email: data.get("email"),
        password: data.get("password"),
        role: data.get("role"),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? "Could not create the account.");
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          8–72 characters.
        </p>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">I want to</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="role"
            value="customer"
            defaultChecked={initialRole === "customer"}
            className="accent-primary"
          />
          Buy IoT devices
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="role"
            value="vendor"
            defaultChecked={initialRole === "vendor"}
            className="accent-primary"
          />
          Sell IoT devices
        </label>
      </fieldset>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
