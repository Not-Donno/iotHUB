import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account — iotHUB" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-sm px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Create account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        One account to buy or sell on iotHUB.
      </p>
      <RegisterForm initialRole={role === "vendor" ? "vendor" : "customer"} />
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
