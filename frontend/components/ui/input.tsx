import type { ComponentProps } from "react";

function Input({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export { Input };
