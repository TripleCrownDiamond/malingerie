import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { ConsentBanners } from "@/features/legal/components/consent-banners";
import { clerkAppearance } from "@/lib/clerk-appearance";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ma Petite Lingerie | Premium & Sensuel",
  description:
    "Maison premium de lingerie et bien-etre intime: collections couture, sextoys design et experience e-commerce haut de gamme.",
  icons: {
    icon: "/logo-ma-petite-lingerie.png",
    shortcut: "/logo-ma-petite-lingerie.png",
    apple: "/logo-ma-petite-lingerie.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-[var(--paper)] text-[var(--ink)]" suppressHydrationWarning>
        <ClerkProvider appearance={clerkAppearance}>
          <div className="min-h-screen">
            <SiteHeader />
            <CartDrawer />
            <main>{children}</main>
            <SiteFooter />
            <ConsentBanners />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
