import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export async function SiteHeader() {
  const user = await getSession();
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          iot<span className="text-muted-foreground">HUB</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link href="/" className="hover:text-foreground">
            Devices
          </Link>
          <Link href="/" className="hover:text-foreground">
            Vendors
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:block">
                {user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="/register?role=vendor">Start selling</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
