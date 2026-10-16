import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SITE_URL } from "@/lib/api";
import "./globals.css";

// globals.css maps `--font-sans` to itself, so the variable has to be named
// that here or `html { @apply font-sans }` resolves to nothing.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "iotHUB — IoT device marketplace",
    template: "%s — iotHUB",
  },
  description:
    "Browse sensors, gateways and controllers from verified vendors.",
  openGraph: {
    siteName: "iotHUB",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <footer className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>iotHUB — IoT device marketplace</p>
            <p>Built on Next.js and NestJS</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
