"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="ghost"
      size="lg"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/session", { method: "DELETE" });
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
