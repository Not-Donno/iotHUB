import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in — iotHUB" };

export default function SignInPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-6 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back to iotHUB.
      </p>
      <SignInForm />
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
