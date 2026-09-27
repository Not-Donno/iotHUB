import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
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
          <Button variant="ghost" size="lg" asChild>
            <Link href="/">Sign in</Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/">Start selling</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
